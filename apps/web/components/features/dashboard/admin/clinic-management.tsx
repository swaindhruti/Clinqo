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
  Eye,
  Trash2,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { apiClient } from "@/lib/api-client";
import { ClinicDetails } from "./clinic-details";
import QRCode from "qrcode";

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

export function ClinicManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", specialty: "" });
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedClinicForDetails, setSelectedClinicForDetails] = useState<string | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    visitType: "consultation" as VisitType,
    name: "",
    price: "",
    emoji: "",
  });
  const [credentialForm, setCredentialForm] = useState({
    clinicId: "",
    email: "",
    password: "",
  });
  const [isCreatingCredential, setIsCreatingCredential] = useState(false);
  const [isUpdatingCredential, setIsUpdatingCredential] = useState(false);
  const [credentialMessage, setCredentialMessage] = useState<string | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [deletingClinicId, setDeletingClinicId] = useState<string | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [copiedClinicId, setCopiedClinicId] = useState<string | null>(null);

  const buildClinicChatLink = (clinicId: string) => {
    const phoneNumber = "9348840861";
    const message = buildClinicBookingText(clinicId);
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const buildClinicBookingText = (clinicId: string) => `Book an appointment ${clinicId}`;

  const handleCopyClinicChatLink = async (clinicId: string) => {
    const link = buildClinicChatLink(clinicId);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedClinicId(clinicId);
      setTimeout(() => setCopiedClinicId((current) => (current === clinicId ? null : current)), 2000);
    } catch {
      alert(`Copy this link: ${link}`);
    }
  };

  const handleDownloadClinicQr = async (clinic: Clinic) => {
    try {
      const qrPayload = buildClinicChatLink(clinic.id);
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 640,
        margin: 1,
        errorCorrectionLevel: "H",
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to create QR canvas");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "#e5e7eb";
      context.lineWidth = 4;
      context.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      context.fillStyle = "#111827";
      context.font = "bold 54px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText(clinic.name, canvas.width / 2, 170);

      context.fillStyle = "#374151";
      context.font = "34px Inter, system-ui, sans-serif";
      context.fillText("Scan to open WhatsApp booking", canvas.width / 2, 230);

      const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to render QR image"));
        image.src = qrDataUrl;
      });

      const qrSize = 700;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 290;
      context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      context.fillStyle = "#6b7280";
      context.font = "28px Inter, system-ui, sans-serif";
      context.fillText("QR opens WhatsApp booking link", canvas.width / 2, 1070);
      context.fillText(`Clinic ID: ${clinic.id}`, canvas.width / 2, 1120);

      const anchor = document.createElement("a");
      const fileSafeName = clinic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = `${fileSafeName || "clinic"}-booking-qr.png`;
      anchor.click();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate QR image";
      alert(message);
    }
  };

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

  const handleCreateClinicCredential = async () => {
    if (!credentialForm.clinicId || !credentialForm.email.trim() || !credentialForm.password.trim()) {
      setCredentialError("Clinic, email, and password are required.");
      setCredentialMessage(null);
      return;
    }

    setIsCreatingCredential(true);
    setCredentialError(null);
    setCredentialMessage(null);

    try {
      await apiClient.post("/auth/register", {
        email: credentialForm.email.trim(),
        password: credentialForm.password,
        role: "clinic",
        clinic_id: credentialForm.clinicId,
      });

      setCredentialMessage("Clinic login credentials created successfully.");
      setCredentialForm((prev) => ({ ...prev, email: "", password: "" }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create clinic credentials.";
      setCredentialError(message);
    } finally {
      setIsCreatingCredential(false);
    }
  };

  const handleEmergencyUpdateClinicCredential = async () => {
    if (!credentialForm.clinicId || !credentialForm.email.trim() || !credentialForm.password.trim()) {
      setCredentialError("Clinic, email, and password are required for emergency update.");
      setCredentialMessage(null);
      return;
    }

    setIsUpdatingCredential(true);
    setCredentialError(null);
    setCredentialMessage(null);

    try {
      await apiClient.put("/auth/credentials/emergency", {
        role: "clinic",
        clinic_id: credentialForm.clinicId,
        email: credentialForm.email.trim(),
        password: credentialForm.password,
      });

      setCredentialMessage("Clinic credentials updated successfully.");
      setCredentialForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update clinic credentials.";
      setCredentialError(message);
    } finally {
      setIsUpdatingCredential(false);
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    if (!confirm("Are you sure you want to delete this clinic?")) return;

    setDeletingClinicId(clinicId);
    try {
      await apiClient.delete(`/clinics/${clinicId}`);
      if (selectedClinicId === clinicId) {
        setSelectedClinicId("");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      await queryClient.invalidateQueries({ queryKey: ["clinic-services"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete clinic.";
      alert(message);
    } finally {
      setDeletingClinicId(null);
    }
  };

  const handleDeleteServiceCategory = async (serviceId: string) => {
    if (!selectedClinicId) return;
    if (!confirm("Delete this service category?")) return;

    setDeletingServiceId(serviceId);
    try {
      await apiClient.delete(`/clinics/${selectedClinicId}/services/${serviceId}`);
      await queryClient.invalidateQueries({ queryKey: ["clinic-services", selectedClinicId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service category.";
      alert(message);
    } finally {
      setDeletingServiceId(null);
    }
  };

  const consultationServices = (clinicServices || []).filter(
    (service) => service.visit_type === "consultation",
  );
  const procedureServices = (clinicServices || []).filter(
    (service) => service.visit_type === "procedure",
  );

  // Create columns with access to state
  const columns: ColumnDef<Clinic>[] = [
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors: Record<string, string> = {
          approved: "bg-green-100 text-green-800",
          applicant: "bg-blue-100 text-blue-800",
          rejected: "bg-red-100 text-red-800",
        };
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-neutral-100 text-neutral-800"}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const clinic = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
              onClick={() => setSelectedClinicForDetails(clinic.id)}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleCopyClinicChatLink(clinic.id)}
            >
              <MessageCircle className="mr-1 h-3.5 w-3.5" />
              {copiedClinicId === clinic.id ? "Copied" : "Copy Chat Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleDownloadClinicQr(clinic)}
            >
              <QrCode className="mr-1 h-3.5 w-3.5" />
              Download QR
            </Button>
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClinic(clinic.id)}
              disabled={deletingClinicId === clinic.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // If viewing clinic details, render the ClinicDetails component
  if (selectedClinicForDetails) {
    return (
      <ClinicDetails
        clinicId={selectedClinicForDetails}
        onBack={() => setSelectedClinicForDetails(null)}
      />
    );
  }

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
          Clinic Portal Credentials
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Create login credentials for a clinic so they can access the clinic dashboard.
        </p>

        <div className="grid gap-3 md:grid-cols-4">
          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={credentialForm.clinicId}
            onChange={(e) => setCredentialForm((prev) => ({ ...prev, clinicId: e.target.value }))}
          >
            <option value="">Select clinic</option>
            {(liveClinics || []).map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Clinic email"
            type="email"
            value={credentialForm.email}
            onChange={(e) => setCredentialForm((prev) => ({ ...prev, email: e.target.value }))}
          />

          <input
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Temporary password"
            type="password"
            value={credentialForm.password}
            onChange={(e) => setCredentialForm((prev) => ({ ...prev, password: e.target.value }))}
          />

          <div className="flex gap-2 md:col-span-4 lg:col-span-1">
            <Button
              type="button"
              disabled={isCreatingCredential || isUpdatingCredential}
              onClick={handleCreateClinicCredential}
              className="flex-1"
            >
              {isCreatingCredential ? "Creating..." : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isCreatingCredential || isUpdatingCredential}
              onClick={handleEmergencyUpdateClinicCredential}
              className="flex-1"
            >
              {isUpdatingCredential ? "Updating..." : "Emergency Update"}
            </Button>
          </div>
        </div>

        {credentialMessage ? (
          <p className="mt-3 text-sm text-green-700">{credentialMessage}</p>
        ) : null}
        {credentialError ? (
          <p className="mt-3 text-sm text-red-600">{credentialError}</p>
        ) : null}
      </div>

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
                    <li key={service.id} className="flex items-center justify-between gap-2">
                      <span>
                        {service.emoji ? `${service.emoji} ` : ""}
                        {service.name}
                        {service.price ? ` — ${service.price}` : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteServiceCategory(service.id)}
                        disabled={deletingServiceId === service.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
                    <li key={service.id} className="flex items-center justify-between gap-2">
                      <span>
                        {service.emoji ? `${service.emoji} ` : ""}
                        {service.name}
                        {service.price ? ` — ${service.price}` : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteServiceCategory(service.id)}
                        disabled={deletingServiceId === service.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
