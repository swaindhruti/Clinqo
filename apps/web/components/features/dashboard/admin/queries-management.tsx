"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Loader2, MessageSquareReply } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
import { QueryRecord } from "@/types/api";

type QueryStatus = "pending" | "resolved" | "closed" | "in_progress" | string;

export type UserQuery = {
  id: string;
  senderName: string;
  phone: string;
  subject: string;
  date: string;
  status: QueryStatus;
};

function normalizeStatus(status: string): QueryStatus {
  const normalized = status.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "resolved" || normalized === "closed" || normalized === "in_progress") {
    return normalized;
  }
  return "pending";
}

function mapQueryRecord(record: QueryRecord): UserQuery {
  return {
    id: record.id,
    senderName: record.patient_name,
    phone: record.patient_phone,
    subject: record.query_text,
    date: format(new Date(record.created_at), "MMM d, yyyy"),
    status: normalizeStatus(record.status),
  };
}

export function QueriesManagement() {
  const queryClient = useQueryClient();
  const { data: rawQueries, isLoading, error } = useQuery({
    queryKey: ["admin-queries"],
    queryFn: () => apiClient.get<QueryRecord[]>('/queries'),
  });

  const resolveMutation = useMutation({
    mutationFn: (queryId: string) => apiClient.put(`/queries/${queryId}/status`, { status: "resolved" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-queries"] }),
  });

  const columns = useMemo<ColumnDef<UserQuery>[]>(() => [
    {
      accessorKey: "senderName",
      header: "Sender",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900">{row.getValue("senderName")}</span>
          <span className="text-xs text-neutral-500">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => <span className="text-neutral-600">{row.getValue("phone")}</span>,
    },
    {
      accessorKey: "subject",
      header: "Query",
      cell: ({ row }) => <span className="text-neutral-800 max-w-[250px] truncate block">{row.getValue("subject")}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-neutral-500">{row.getValue("date")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isResolved = row.original.status === "resolved" || row.original.status === "closed";

        return (
          <div className="flex items-center justify-end gap-2">
            {!isResolved ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                >
                  <MessageSquareReply className="mr-1.5 h-3.5 w-3.5" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
                  onClick={() => resolveMutation.mutate(row.original.id)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Resolve
                </Button>
              </>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                Resolved
              </span>
            )}
          </div>
        );
      },
    },
  ], [resolveMutation]);

  const queries = useMemo(() => (rawQueries ?? []).map(mapQueryRecord), [rawQueries]);
  const unresolvedQueries = useMemo(
    () => queries.filter((query) => query.status !== "resolved" && query.status !== "closed"),
    [queries],
  );
  const resolvedQueries = useMemo(
    () => queries.filter((query) => query.status === "resolved" || query.status === "closed"),
    [queries],
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">User Queries</h2>
          <p className="text-muted-foreground mt-1">
            Review live patient queries pulled from the core server.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-sm text-neutral-500">Loading queries...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load queries from the backend.
        </div>
      ) : null}

      <Tabs defaultValue="unresolved" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="unresolved">
            Unresolved
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              {unresolvedQueries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="unresolved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={unresolvedQueries}
            searchKey="senderName"
            searchPlaceholder="Search queries by patient name..."
          />
        </TabsContent>

        <TabsContent value="resolved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={resolvedQueries}
            searchKey="senderName"
            searchPlaceholder="Search queries by patient name..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
