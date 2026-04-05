"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { apiClient } from "@/lib/api-client";
import { DoctorWeeklySlot } from "@/types/api";

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

type DoctorApi = {
  id: string;
  name: string;
  code: string;
  specialty?: string | null;
  clinic_id?: string | null;
  created_at: string;
};

type ClinicApi = {
  id: string;
  name: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

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
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", specialty: "", clinicId: "" });
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    clinicId: "",
    weekday: "0",
    startTime: "09:00",
    endTime: "10:00",
    maxPatients: "5",
    visitType: "consultation",
  });

  const { data: liveDoctors } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: () => apiClient.get<DoctorApi[]>("/doctors"),
  });

  const { data: clinics } = useQuery({
    queryKey: ["admin-clinics-lite"],
    queryFn: () => apiClient.get<ClinicApi[]>("/clinics"),
  });

  const { data: weeklySlots } = useQuery({
    queryKey: ["doctor-weekly-slots", selectedDoctorId],
    queryFn: () => apiClient.get<DoctorWeeklySlot[]>(`/doctors/${selectedDoctorId}/weekly-slots`),
    enabled: Boolean(selectedDoctorId),
  });

  const approvedFromApi: Doctor[] = (liveDoctors || []).map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty || "General",
    email: doctor.code,
    status: "approved",
    joinDate: formatDate(doctor.created_at),
  }));

  const handleCreateDoctor = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/doctors", {
        name: form.name,
        code: form.code,
        specialty: form.specialty || null,
        clinic_id: form.clinicId || null,
      });
      setShowForm(false);
      setForm({ name: "", code: "", specialty: "", clinicId: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDoctorId) return;

    setIsSavingSlot(true);
    try {
      await apiClient.post(`/doctors/${selectedDoctorId}/weekly-slots`, {
        clinic_id: slotForm.clinicId || null,
        weekday: Number(slotForm.weekday),
        start_time: slotForm.startTime,
        end_time: slotForm.endTime,
        max_patients: Number(slotForm.maxPatients),
        visit_type: slotForm.visitType,
        is_active: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["doctor-weekly-slots", selectedDoctorId] });
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!selectedDoctorId) return;
    await apiClient.delete(`/doctors/${selectedDoctorId}/weekly-slots/${slotId}`);
    await queryClient.invalidateQueries({ queryKey: ["doctor-weekly-slots", selectedDoctorId] });
  };

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
        <Button className="flex items-center gap-2" type="button" onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          Add New Doctor
        </Button>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Doctor name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Doctor code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Specialty" value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} />
          <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" placeholder="Clinic ID (optional)" value={form.clinicId} onChange={(e) => setForm((p) => ({ ...p, clinicId: e.target.value }))} />
          <div className="md:col-span-2 flex gap-2 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="button" onClick={handleCreateDoctor} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Doctor"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">
          Doctor Clinic Schedule Assignment
        </h3>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="">Select doctor</option>
            {(liveDoctors || []).map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.clinicId}
            onChange={(e) => setSlotForm((p) => ({ ...p, clinicId: e.target.value }))}
          >
            <option value="">Select clinic</option>
            {(clinics || []).map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.weekday}
            onChange={(e) => setSlotForm((p) => ({ ...p, weekday: e.target.value }))}
          >
            <option value="0">Monday</option>
            <option value="1">Tuesday</option>
            <option value="2">Wednesday</option>
            <option value="3">Thursday</option>
            <option value="4">Friday</option>
            <option value="5">Saturday</option>
            <option value="6">Sunday</option>
          </select>

          <input
            type="time"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.startTime}
            onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))}
          />
          <input
            type="time"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.endTime}
            onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))}
          />
          <input
            type="number"
            min={1}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Max patients"
            value={slotForm.maxPatients}
            onChange={(e) => setSlotForm((p) => ({ ...p, maxPatients: e.target.value }))}
          />

          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm md:col-span-2"
            value={slotForm.visitType}
            onChange={(e) => setSlotForm((p) => ({ ...p, visitType: e.target.value }))}
          >
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
          </select>

          <Button
            type="button"
            onClick={handleAddSlot}
            disabled={!selectedDoctorId || isSavingSlot}
            className="md:col-span-1"
          >
            {isSavingSlot ? "Saving..." : "Add Slot"}
          </Button>
        </div>

        {selectedDoctorId ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-500 text-xs uppercase">
                  <th className="text-left py-2">Day</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Max</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {(weeklySlots || []).map((slot) => (
                  <tr key={slot.id} className="border-b border-neutral-100">
                    <td className="py-2">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][slot.weekday]}</td>
                    <td className="py-2">{slot.start_time}-{slot.end_time}</td>
                    <td className="py-2 capitalize">{slot.visit_type}</td>
                    <td className="py-2">{slot.max_patients}</td>
                    <td className="py-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSlot(slot.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="approved">Approved Doctors</TabsTrigger>
          <TabsTrigger value="disabled">Disabled Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="mt-0 outline-none">
          <DataTable
            columns={columns}
            data={approvedFromApi.length > 0 ? approvedFromApi : approvedDoctors}
            searchKey="name"
            searchPlaceholder="Search by doctor name or code..."
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
