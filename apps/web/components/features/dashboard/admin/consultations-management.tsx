"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, Clock, Video } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Type Definition
export type Consultation = {
  id: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  dateTime: string;
  status: "upcoming" | "completed" | "cancelled";
  type: "video" | "in-person";
};

// Dummy Data
const upcomingConsultations: Consultation[] = [
  {
    id: "APT-9021",
    patientName: "Alice Walker",
    doctorName: "Dr. Sarah Chen",
    clinicName: "MetroHealth Clinic",
    dateTime: "Oct 25, 2024 - 10:00 AM",
    status: "upcoming",
    type: "video",
  },
  {
    id: "APT-9022",
    patientName: "Robert Fox",
    doctorName: "Dr. Marcus Johnson",
    clinicName: "Westside Dental",
    dateTime: "Oct 25, 2024 - 11:30 AM",
    status: "upcoming",
    type: "in-person",
  },
  {
    id: "APT-9023",
    patientName: "Elena Rodriguez",
    doctorName: "Dr. Emily Rostova",
    clinicName: "Sunrise Care Hub",
    dateTime: "Oct 26, 2024 - 09:15 AM",
    status: "upcoming",
    type: "video",
  },
  {
    id: "APT-9025",
    patientName: "David Kim",
    doctorName: "Dr. James Wilson",
    clinicName: "Pioneer Orthopedics",
    dateTime: "Oct 26, 2024 - 02:00 PM",
    status: "upcoming",
    type: "in-person",
  },
  {
    id: "APT-9026",
    patientName: "Sofia M.",
    doctorName: "Dr. Anita Patel",
    clinicName: "MetroHealth Clinic",
    dateTime: "Oct 27, 2024 - 10:45 AM",
    status: "upcoming",
    type: "video",
  },
];

const completedConsultations: Consultation[] = [
  {
    id: "APT-8010",
    patientName: "John Doe",
    doctorName: "Dr. Sarah Chen",
    clinicName: "MetroHealth Clinic",
    dateTime: "Oct 24, 2024 - 09:00 AM",
    status: "completed",
    type: "in-person",
  },
  {
    id: "APT-8009",
    patientName: "Maria Garcia",
    doctorName: "Dr. James Wilson",
    clinicName: "Pioneer Orthopedics",
    dateTime: "Oct 23, 2024 - 03:30 PM",
    status: "completed",
    type: "video",
  },
  {
    id: "APT-8005",
    patientName: "James Smith",
    doctorName: "Dr. Marcus Johnson",
    clinicName: "Westside Dental",
    dateTime: "Oct 22, 2024 - 11:00 AM",
    status: "completed",
    type: "in-person",
  },
  {
    id: "APT-8001",
    patientName: "Patricia B.",
    doctorName: "Dr. Anita Patel",
    clinicName: "MetroHealth Clinic",
    dateTime: "Oct 20, 2024 - 01:15 PM",
    status: "completed",
    type: "video",
  },
];

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
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            All Consultations
          </h2>
          <p className="text-muted-foreground mt-1">
            Platform-wide oversight of upcoming and past medical appointments.
          </p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
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
        </TabsContent>

        <TabsContent value="completed" className="mt-0 outline-none">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
