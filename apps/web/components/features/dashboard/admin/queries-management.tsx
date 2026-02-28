"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquareReply } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Type Definition
export type UserQuery = {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  date: string;
  status: "unresolved" | "resolved";
};

// Dummy Data
const unresolvedQueries: UserQuery[] = [
  {
    id: "QRY-1092",
    senderName: "Michael Chang",
    email: "m.chang@example.com",
    subject: "Trouble linking my clinic account",
    date: "Oct 24, 2024",
    status: "unresolved",
  },
  {
    id: "QRY-1093",
    senderName: "Dr. Amanda Smith",
    email: "asmith@example.com",
    subject: "Update profile photo bug",
    date: "Oct 24, 2024",
    status: "unresolved",
  },
  {
    id: "QRY-1095",
    senderName: "Guest User",
    email: "guest12@test.com",
    subject: "Pricing inquiries for Enterprise",
    date: "Oct 23, 2024",
    status: "unresolved",
  },
];

const resolvedQueries: UserQuery[] = [
  {
    id: "QRY-1081",
    senderName: "Pioneer Ortho Admin",
    email: "admin@pioneerortho.com",
    subject: "Billing issue resolved?",
    date: "Oct 20, 2024",
    status: "resolved",
  },
  {
    id: "QRY-1077",
    senderName: "Dr. L. Wong",
    email: "lwong@example.com",
    subject: "Documentation access",
    date: "Oct 18, 2024",
    status: "resolved",
  },
];

// Columns Definition
export const columns: ColumnDef<UserQuery>[] = [
  {
    accessorKey: "senderName",
    header: "Sender",
    cell: ({ row }) => (
      <span className="font-medium text-neutral-900">
        {row.getValue("senderName")}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject / Preview",
    cell: ({ row }) => (
      <span className="text-neutral-800 max-w-[250px] truncate block">
        {row.getValue("subject")}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-neutral-500">{row.getValue("date")}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const query = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {query.status === "unresolved" && (
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
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Resolve
              </Button>
            </>
          )}
          {query.status === "resolved" && (
            <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              Resolved
            </span>
          )}
        </div>
      );
    },
  },
];

export function QueriesManagement() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            User Queries
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage support tickets and platform inquiries.
          </p>
        </div>
      </div>

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
            searchPlaceholder="Search queries by sender name..."
            filterColumn="status"
            filterOptions={[
              { label: "New", value: "New" },
              { label: "In Progress", value: "In Progress" },
            ]}
          />
        </TabsContent>

        <TabsContent value="resolved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={resolvedQueries}
            searchKey="senderName"
            searchPlaceholder="Search queries by sender name..."
            filterColumn="status"
            filterOptions={[{ label: "Resolved", value: "Resolved" }]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
