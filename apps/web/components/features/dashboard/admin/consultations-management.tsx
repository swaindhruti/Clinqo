"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  Clock,
  Video,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Appointment } from "@/types/api";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
// Import the DatePickerFilter
import { DatePickerFilter } from "../clinic/appointments/date-picker-filter";

// Constants are not needed for a global fetch

// Type Definition for the Table
export type Consultation = {
  id: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  dateTime: string;
  status: "upcoming" | "completed" | "cancelled";
  type: "video" | "in-person";
};

// Columns Definition
export const columns: ColumnDef<Consultation>[] = [
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <span className="font-medium text-neutral-900">
        {row.getValue("patientName")}
      </span>
    ),
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
    cell: ({ row }) => (
      <span className="text-neutral-600 font-medium">
        {row.getValue("doctorName")}
      </span>
    ),
  },
  {
    accessorKey: "clinicName",
    header: "Clinic",
    cell: ({ row }) => (
      <span className="text-neutral-500">{row.getValue("clinicName")}</span>
    ),
  },
  {
    accessorKey: "dateTime",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="flex items-center text-neutral-600">
        <Calendar className="mr-2 h-3.5 w-3.5 text-neutral-400" />
        {row.getValue("dateTime")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 capitalize">
          {type === "video" ? (
            <Video className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {type}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
          </Button>
        </div>
      );
    },
  },
];

export function ConsultationsManagement() {
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") || "upcoming";
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  const queryDate =
    activeView === "today"
      ? format(new Date(), "yyyy-MM-dd")
      : activeView === "upcoming"
        ? filterDate
          ? format(filterDate, "yyyy-MM-dd")
          : ""
        : filterDate
          ? format(filterDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");

  const {
    data: rawAppointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-appointments", "all-doctors", queryDate, activeView],
    queryFn: () => {
      const url = queryDate
        ? `/appointments?date=${queryDate}`
        : `/appointments`;
      return apiClient.get<Appointment[]>(url);
    },
  });

  const { upcomingConsultations, completedConsultations } = useMemo(() => {
    if (!rawAppointments)
      return { upcomingConsultations: [], completedConsultations: [] };

    const upcoming: Consultation[] = [];
    const completed: Consultation[] = [];
    const todayStr = format(new Date(), "yyyy-MM-dd");

    rawAppointments.forEach((app) => {
      // 1. Strict Date Filtering
      if (!filterDate) {
        if (activeView === "today" && app.date !== todayStr) return;
        if (activeView === "upcoming" && app.date <= todayStr) return;
        if (activeView === "past" && app.date >= todayStr) return;
      }

      const consultation: Consultation = {
        id: app.id,
        patientName:
          app.patient_name || `Patient ${app.patient_id.substring(0, 6)}`,
        doctorName: app.doctor_name || "Dr. Smith Sandbox",
        clinicName: app.doctor?.clinic?.name || "Clinic Not Assigned",
        dateTime: `${app.date} - Slot ${app.slot}`,
        status:
          app.status === "booked"
            ? "upcoming"
            : (app.status as "completed" | "cancelled" | "upcoming"),
        type: "in-person", // Defaulting as API doesn't specify type
      };

      if (app.status === "booked") {
        upcoming.push(consultation);
      } else {
        completed.push(consultation);
      }
    });

    return {
      upcomingConsultations: upcoming,
      completedConsultations: completed,
    };
  }, [rawAppointments, activeView, filterDate]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            All Consultations
          </h2>
          <p className="text-muted-foreground mt-1">
            Platform-wide oversight of upcoming and past medical appointments.
          </p>
        </div>

        {/* Date Picker Filter */}
        <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg pl-3 shadow-sm h-10 w-full sm:w-auto">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest shrink-0">
            Date
          </span>
          <DatePickerFilter date={filterDate} setDate={setFilterDate} />
        </div>
      </div>

      <Tabs
        defaultValue={activeView === "past" ? "completed" : "upcoming"}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">
            Upcoming
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {upcomingConsultations.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">Completed / Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0 outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-4 text-sm text-neutral-500">
                Loading platform consultations...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-20 text-red-500">
              <AlertCircle className="h-10 w-10 mb-4" />
              <p className="text-lg font-semibold">
                Failed to load consultations
              </p>
              <p className="text-sm mt-1">
                Please ensure the backend is running.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={upcomingConsultations}
              searchKey="patientName"
              searchPlaceholder="Search appointments by patient..."
              filterColumn="type"
              filterOptions={[
                { label: "Video", value: "Video" },
                { label: "In-person", value: "In-person" },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0 outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={completedConsultations}
              searchKey="patientName"
              searchPlaceholder="Search appointments by patient..."
              filterColumn="type"
              filterOptions={[
                { label: "Video", value: "Video" },
                { label: "In-person", value: "In-person" },
              ]}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
