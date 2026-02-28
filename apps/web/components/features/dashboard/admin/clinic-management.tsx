"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreHorizontal,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Type Definition
export type Clinic = {
  id: string;
  name: string;
  location: string;
  email: string;
  status: "approved" | "applicant" | "rejected";
  appliedDate: string;
};

// Dummy Data
const approvedClinics: Clinic[] = [
  {
    id: "CLN-8021",
    name: "MetroHealth Clinic",
    location: "New York, NY",
    email: "admin@metrohealth.com",
    status: "approved",
    appliedDate: "Oct 12, 2023",
  },
  {
    id: "CLN-8022",
    name: "Westside Dental",
    location: "San Francisco, CA",
    email: "contact@westsidedental.com",
    status: "approved",
    appliedDate: "Nov 05, 2023",
  },
  {
    id: "CLN-8025",
    name: "Sunrise Care Hub",
    location: "Austin, TX",
    email: "info@sunrisecare.org",
    status: "approved",
    appliedDate: "Jan 18, 2024",
  },
  {
    id: "CLN-8041",
    name: "Pioneer Orthopedics",
    location: "Denver, CO",
    email: "hello@pioneerortho.com",
    status: "approved",
    appliedDate: "Feb 22, 2024",
  },
];

const applicantClinics: Clinic[] = [
  {
    id: "CLN-9102",
    name: "Valley Family Medicine",
    location: "Phoenix, AZ",
    email: "apply@valleyfam.com",
    status: "applicant",
    appliedDate: "Today",
  },
  {
    id: "CLN-9104",
    name: "ClearVision Eye Care",
    location: "Seattle, WA",
    email: "hello@clearvision.com",
    status: "applicant",
    appliedDate: "Yesterday",
  },
  {
    id: "CLN-9107",
    name: "Peak Performance Physio",
    location: "Portland, OR",
    email: "contact@peakphysio.com",
    status: "applicant",
    appliedDate: "3 days ago",
  },
];

const rejectedClinics: Clinic[] = [
  {
    id: "CLN-7052",
    name: "Downtown Chiro",
    location: "Chicago, IL",
    email: "info@downtownchiro.com",
    status: "rejected",
    appliedDate: "Dec 14, 2023",
  },
];

// Columns Definition
export const columns: ColumnDef<Clinic>[] = [
  {
    accessorKey: "name",
    header: "Clinic Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="font-medium text-neutral-900">
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.getValue("location")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Contact Email",
    cell: ({ row }) => (
      <span className="text-neutral-600">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "appliedDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-neutral-500">{row.getValue("appliedDate")}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const clinic = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {clinic.status === "applicant" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
          </Button>
        </div>
      );
    },
  },
];

export function ClinicManagement() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Clinic Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Review applicant clinics and manage existing partners.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Clinic
        </Button>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-6">
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              3
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={approvedClinics}
            searchKey="name"
            searchPlaceholder="Search by clinic name..."
            filterColumn="status"
            filterOptions={[
              { label: "Approved", value: "Approved" },
              { label: "Pending", value: "Pending" },
              { label: "Rejected", value: "Rejected" },
            ]}
          />
        </TabsContent>

        <TabsContent value="applicants" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={applicantClinics}
            searchKey="name"
            searchPlaceholder="Search by clinic name..."
            filterColumn="status"
            filterOptions={[
              { label: "Approved", value: "Approved" },
              { label: "Pending", value: "Pending" },
              { label: "Rejected", value: "Rejected" },
            ]}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={rejectedClinics}
            searchKey="name"
            searchPlaceholder="Search by clinic name..."
            filterColumn="status"
            filterOptions={[
              { label: "Approved", value: "Approved" },
              { label: "Pending", value: "Pending" },
              { label: "Rejected", value: "Rejected" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
