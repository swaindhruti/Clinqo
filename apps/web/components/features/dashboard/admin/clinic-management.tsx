"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
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
import { apiClient } from "@/lib/api-client";

// Type Definition
export type Clinic = {
  id: string;
  name: string;
  location: string;
  email: string;
  status: "approved" | "applicant" | "rejected";
  appliedDate: string;
};

type VisitType = "consultation" | "procedure";

type ClinicApi = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  specialty?: string | null;
  created_at: string;
};

type ServiceCategoryApi = {
  id: string;
  clinic_id: string;
  visit_type: VisitType;
  name: string;
  price?: string | null;
  emoji?: string | null;
  sort_order: number;
  detail_questions?: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

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
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", specialty: "" });
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    visitType: "consultation" as VisitType,
    name: "",
    price: "",
    emoji: "",
  });

  const { data: liveClinics } = useQuery({
    queryKey: ["admin-clinics"],
    queryFn: () => apiClient.get<ClinicApi[]>("/clinics"),
  });

  const { data: clinicServices } = useQuery({
    queryKey: ["clinic-services", selectedClinicId],
    queryFn: () => apiClient.get<ServiceCategoryApi[]>(`/clinics/${selectedClinicId}/services`),
    enabled: Boolean(selectedClinicId),
  });

  const approvedFromApi: Clinic[] = (liveClinics || []).map((clinic) => ({
    id: clinic.id,
    name: clinic.name,
    location: clinic.address || "—",
    email: clinic.phone || "—",
    status: "approved",
    appliedDate: formatDate(clinic.created_at),
  }));

  const applicantClinics: Clinic[] = [];
  const rejectedClinics: Clinic[] = [];

  const handleCreateClinic = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/clinics", {
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        specialty: form.specialty || null,
      });
      setShowForm(false);
      setForm({ name: "", address: "", phone: "", specialty: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateServiceCategory = async () => {
    if (!selectedClinicId || !serviceForm.name.trim()) return;

    setIsSavingService(true);
    try {
      await apiClient.post(`/clinics/${selectedClinicId}/services`, {
        clinic_id: selectedClinicId,
        visit_type: serviceForm.visitType,
        name: serviceForm.name.trim(),
        price: serviceForm.price.trim() || null,
        emoji: serviceForm.emoji.trim() || null,
        sort_order: 0,
        detail_questions: null,
      });

      setServiceForm({
        visitType: serviceForm.visitType,
        name: "",
        price: "",
        emoji: "",
      });

      await queryClient.invalidateQueries({ queryKey: ["clinic-services", selectedClinicId] });
    } finally {
      setIsSavingService(false);
    }
  };

  const consultationServices = (clinicServices || []).filter(
    (service) => service.visit_type === "consultation",
  );
  const procedureServices = (clinicServices || []).filter(
    (service) => service.visit_type === "procedure",
  );

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
        <Button className="flex items-center gap-2" type="button" onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          Add New Clinic
        </Button>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Clinic name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Specialty" value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} />
          <div className="md:col-span-2 flex gap-2 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="button" onClick={handleCreateClinic} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Clinic"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">
          Clinic Service Types (Bot Flow)
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Add consultation and procedure options that appear in WhatsApp booking.
        </p>

        <div className="grid gap-3 md:grid-cols-5">
          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={selectedClinicId}
            onChange={(e) => setSelectedClinicId(e.target.value)}
          >
            <option value="">Select clinic</option>
            {(liveClinics || []).map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={serviceForm.visitType}
            onChange={(e) =>
              setServiceForm((prev) => ({
                ...prev,
                visitType: e.target.value as VisitType,
              }))
            }
          >
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
          </select>

          <input
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Category name (e.g. Root Canal)"
            value={serviceForm.name}
            onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <input
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Price (optional, e.g. ₹1200)"
            value={serviceForm.price}
            onChange={(e) => setServiceForm((prev) => ({ ...prev, price: e.target.value }))}
          />

          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              placeholder="Emoji (optional)"
              value={serviceForm.emoji}
              onChange={(e) => setServiceForm((prev) => ({ ...prev, emoji: e.target.value }))}
            />
            <Button
              type="button"
              onClick={handleCreateServiceCategory}
              disabled={!selectedClinicId || !serviceForm.name.trim() || isSavingService}
            >
              {isSavingService ? "Saving..." : "Add"}
            </Button>
          </div>
        </div>

        {selectedClinicId ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 p-3">
              <h4 className="text-sm font-semibold text-neutral-900 mb-2">Consultations</h4>
              {consultationServices.length > 0 ? (
                <ul className="space-y-1 text-sm text-neutral-700">
                  {consultationServices.map((service) => (
                    <li key={service.id}>
                      {service.emoji ? `${service.emoji} ` : ""}
                      {service.name}
                      {service.price ? ` — ${service.price}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No consultation categories yet.</p>
              )}
            </div>

            <div className="rounded-lg border border-neutral-200 p-3">
              <h4 className="text-sm font-semibold text-neutral-900 mb-2">Procedures</h4>
              {procedureServices.length > 0 ? (
                <ul className="space-y-1 text-sm text-neutral-700">
                  {procedureServices.map((service) => (
                    <li key={service.id}>
                      {service.emoji ? `${service.emoji} ` : ""}
                      {service.name}
                      {service.price ? ` — ${service.price}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No procedure categories yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">Select a clinic to manage categories.</p>
        )}
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-6">
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {applicantClinics.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={approvedFromApi}
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
          {applicantClinics.length > 0 ? (
            <DataTable
              columns={columns}
              data={applicantClinics}
              searchKey="name"
              searchPlaceholder="Search by clinic name..."
            />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500">
              No applicant clinics are available from the backend yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0 outline-none">
          {rejectedClinics.length > 0 ? (
            <DataTable
              columns={columns}
              data={rejectedClinics}
              searchKey="name"
              searchPlaceholder="Search by clinic name..."
            />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500">
              No rejected clinics are available from the backend yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
