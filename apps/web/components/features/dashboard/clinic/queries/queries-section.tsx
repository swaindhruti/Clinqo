"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Loader2, MessageSquare, Phone } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { getStoredUser } from "@/lib/auth";
import type { QueryRecord } from "@/types/api";

function statusLabel(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "resolved" || normalized === "closed") return "Resolved";
  if (normalized === "in_progress") return "In progress";
  return "Pending";
}

export function QueriesSection() {
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();
  const clinicId = currentUser?.clinic_id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["clinic-queries", clinicId],
    queryFn: () => apiClient.get<QueryRecord[]>("/queries", { clinic_id: clinicId }),
    enabled: Boolean(clinicId),
  });

  const queries = useMemo(() => data ?? [], [data]);
  const unresolved = queries.filter((query) => !["resolved", "closed"].includes(query.status.toLowerCase()));
  const resolved = queries.filter((query) => ["resolved", "closed"].includes(query.status.toLowerCase()));

  const resolveMutation = useMutation({
    mutationFn: (queryId: string) => apiClient.put(`/queries/${queryId}/status`, { status: "resolved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-queries", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["admin-queries"] });
    },
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Queries</h2>
        <p className="text-neutral-500 mt-1">
          Review incoming patient queries from the core server with contact details.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-sm text-neutral-500">Loading queries...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load clinic queries.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">Unresolved</h3>
            <div className="mt-4 space-y-3">
              {unresolved.length === 0 ? (
                <p className="text-sm text-neutral-500">No unresolved queries.</p>
              ) : (
                unresolved.map((query) => (
                  <div key={query.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-900">{query.patient_name}</p>
                        <p className="mt-1 text-sm text-neutral-600">{query.query_text}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {statusLabel(query.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {query.patient_phone}
                      </span>
                      <span>{format(new Date(query.created_at), "MMM d, yyyy")}</span>
                      <button
                        type="button"
                        onClick={() => resolveMutation.mutate(query.id)}
                        disabled={resolveMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">Resolved</h3>
            <div className="mt-4 space-y-3">
              {resolved.length === 0 ? (
                <p className="text-sm text-neutral-500">No resolved queries.</p>
              ) : (
                resolved.map((query) => (
                  <div key={query.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-900">{query.patient_name}</p>
                        <p className="mt-1 text-sm text-neutral-600">{query.query_text}</p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {statusLabel(query.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {query.patient_phone}
                      </span>
                      <span>{format(new Date(query.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}