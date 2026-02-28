"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Type Definition
export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  status: "approved" | "disabled" | "pending";
  joinDate: string;
};

// Dummy Data
const approvedDoctors: Doctor[] = [
  {
    id: "DOC-2041",
    name: "Dr. Sarah Chen",
    specialty: "Cardiology",
    email: "sarah.chen@example.com",
    status: "approved",
    joinDate: "Oct 12, 2023",
  },
  {
    id: "DOC-2042",
    name: "Dr. Marcus Johnson",
    specialty: "Neurology",
    email: "m.johnson@example.com",
    status: "approved",
    joinDate: "Nov 05, 2023",
  },
  {
    id: "DOC-2045",
    name: "Dr. Emily Rostova",
    specialty: "Pediatrics",
    email: "emily.r@example.com",
    status: "approved",
    joinDate: "Jan 18, 2024",
  },
  {
    id: "DOC-2051",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    email: "j.wilson@example.com",
    status: "approved",
    joinDate: "Feb 22, 2024",
  },
  {
    id: "DOC-2063",
    name: "Dr. Anita Patel",
    specialty: "Dermatology",
    email: "apatel@example.com",
    status: "approved",
    joinDate: "Mar 10, 2024",
  },
];

const disabledDoctors: Doctor[] = [
  {
    id: "DOC-1092",
    name: "Dr. Thomas Wright",
    specialty: "General Practice",
    email: "t.wright@example.com",
    status: "disabled",
    joinDate: "Jan 03, 2022",
  },
  {
    id: "DOC-1104",
    name: "Dr. Lisa Wong",
    specialty: "Psychiatry",
    email: "lwong@example.com",
    status: "disabled",
    joinDate: "Apr 15, 2022",
  },
];

// Columns Definition
export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "name",
    header: "Doctor Name",
    cell: ({ row }) => (
      <span className="font-medium text-neutral-900">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "specialty",
    header: "Specialty",
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.getValue("specialty")}</span>
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
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => (
      <span className="text-neutral-500">{row.getValue("joinDate")}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doctor = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {doctor.status === "disabled" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
            >
              <UserCheck className="mr-1 h-3.5 w-3.5" />
              Enable
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <UserX className="mr-1 h-3.5 w-3.5" />
              Disable
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
          </Button>
        </div>
      );
    },
  },
];

export function DoctorManagement() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Doctor Management
          </h2>
          <p className="text-muted-foreground mt-1">
            View, add, and manage doctors across the platform.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Doctor
        </Button>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="approved">Approved Doctors</TabsTrigger>
          <TabsTrigger value="disabled">Disabled Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={approvedDoctors}
            searchKey="name"
            searchPlaceholder="Search by doctor name..."
            filterColumn="specialty"
            filterOptions={[
              { label: "Cardiology", value: "Cardiology" },
              { label: "Orthopedics", value: "Orthopedics" },
              { label: "Pediatrics", value: "Pediatrics" },
              { label: "Dermatology", value: "Dermatology" },
            ]}
          />
        </TabsContent>

        <TabsContent value="disabled" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={disabledDoctors}
            searchKey="name"
            searchPlaceholder="Search by doctor name..."
            filterColumn="specialty"
            filterOptions={[
              { label: "Cardiology", value: "Cardiology" },
              { label: "Orthopedics", value: "Orthopedics" },
              { label: "Pediatrics", value: "Pediatrics" },
              { label: "Dermatology", value: "Dermatology" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
