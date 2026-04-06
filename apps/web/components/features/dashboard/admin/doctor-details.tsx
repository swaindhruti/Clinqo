"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Clock,
  Users,
  Building2,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DoctorWeeklySlot } from "@/types/api";

type DoctorDetailsApi = {
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
  address?: string | null;
  phone?: string | null;
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(":").slice(0, 2);
    const hour = parseInt(hours, 10);
    const min = minutes || "00";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min} ${ampm}`;
  } catch {
    return timeString;
  }
}

interface DoctorDetailsProps {
  doctorId: string;
  onBack: () => void;
}

export function DoctorDetails({ doctorId, onBack }: DoctorDetailsProps) {
  const queryClient = useQueryClient();
  const [slotForm, setSlotForm] = useState({
    clinicId: "",
    weekday: "0",
    startTime: "09:00",
    endTime: "10:00",
    maxPatients: "5",
    visitType: "consultation" as "consultation" | "procedure",
  });
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Fetch doctor details
  const { data: doctorDetails } = useQuery({
    queryKey: ["doctor-details", doctorId],
    queryFn: () => apiClient.get<DoctorDetailsApi>(`/doctors/${doctorId}`),
    enabled: !!doctorId,
  });

  // Fetch clinics
  const { data: clinics } = useQuery({
    queryKey: ["admin-clinics-lite"],
    queryFn: () => apiClient.get<ClinicApi[]>("/clinics"),
  });

  // Fetch clinic details if doctor has clinic_id
  const { data: assignedClinic } = useQuery({
    queryKey: ["clinic-details", doctorDetails?.clinic_id],
    queryFn: () => apiClient.get<ClinicApi>(`/clinics/${doctorDetails?.clinic_id}`),
    enabled: !!doctorDetails?.clinic_id,
  });

  // Fetch weekly slots
  const { data: weeklySlots } = useQuery({
    queryKey: ["doctor-weekly-slots", doctorId],
    queryFn: () => apiClient.get<DoctorWeeklySlot[]>(`/doctors/${doctorId}/weekly-slots`),
    enabled: !!doctorId,
  });

  const consultationSlots = useMemo(
    () => (weeklySlots || []).filter((s) => s.visit_type === "consultation"),
    [weeklySlots]
  );

  const procedureSlots = useMemo(
    () => (weeklySlots || []).filter((s) => s.visit_type === "procedure"),
    [weeklySlots]
  );

  const slotsByDay = useMemo(() => {
    const map = new Map<number, DoctorWeeklySlot[]>();
    (weeklySlots || []).forEach((slot) => {
      if (!map.has(slot.weekday)) {
        map.set(slot.weekday, []);
      }
      map.get(slot.weekday)!.push(slot);
    });
    return map;
  }, [weeklySlots]);

  const effectiveSlotClinicId = slotForm.clinicId || doctorDetails?.clinic_id || "";

  const handleAddSlot = async () => {
    if (!slotForm.startTime || !slotForm.endTime) {
      setSlotError("Start and end times are required.");
      return;
    }

    setIsSavingSlot(true);
    setSlotError(null);
    setSlotMessage(null);

    try {
      await apiClient.post(`/doctors/${doctorId}/weekly-slots`, {
        clinic_id: effectiveSlotClinicId || null,
        weekday: Number(slotForm.weekday),
        start_time: slotForm.startTime,
        end_time: slotForm.endTime,
        max_patients: Number(slotForm.maxPatients),
        visit_type: slotForm.visitType,
        is_active: true,
      });

      setSlotMessage("Time slot added successfully.");
      setSlotForm({
        clinicId: effectiveSlotClinicId,
        weekday: "0",
        startTime: "09:00",
        endTime: "10:00",
        maxPatients: "5",
        visitType: "consultation",
      });

      await queryClient.invalidateQueries({ queryKey: ["doctor-weekly-slots", doctorId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add time slot.";
      setSlotError(message);
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;

    setDeletingSlotId(slotId);
    try {
      await apiClient.delete(`/doctors/${doctorId}/weekly-slots/${slotId}`);
      await queryClient.invalidateQueries({ queryKey: ["doctor-weekly-slots", doctorId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete time slot.";
      alert(message);
    } finally {
      setDeletingSlotId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {doctorDetails?.name || "Doctor Details"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage doctor information, clinic assignment, and weekly schedules
          </p>
        </div>
      </div>

      {/* Doctor Information Card */}
      {doctorDetails && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Doctor Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-700">Doctor Name</p>
              <p className="text-neutral-900 font-semibold">{doctorDetails.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Doctor Code</p>
              <p className="text-neutral-900 font-semibold">{doctorDetails.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Specialty</p>
              <p className="text-neutral-900 font-semibold">
                {doctorDetails.specialty || "General Practitioner"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Assigned Clinic</p>
              {assignedClinic ? (
                <p className="text-neutral-900 font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  {assignedClinic.name}
                </p>
              ) : (
                <p className="text-neutral-500 italic">Not assigned to any clinic</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Slots Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Add Time Slot
        </h2>

        <div className="grid gap-3 md:grid-cols-6">
          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.clinicId}
            onChange={(e) =>
              setSlotForm((prev) => ({ ...prev, clinicId: e.target.value }))
            }
          >
            <option value="">Clinic (optional)</option>
            {(clinics || []).map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.weekday}
            onChange={(e) =>
              setSlotForm((prev) => ({ ...prev, weekday: e.target.value }))
            }
          >
            {WEEKDAYS.map((day, idx) => (
              <option key={idx} value={idx}>
                {day}
              </option>
            ))}
          </select>

          <input
            type="time"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.startTime}
            onChange={(e) =>
              setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))
            }
          />

          <input
            type="time"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.endTime}
            onChange={(e) =>
              setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))
            }
          />

          <input
            type="number"
            min="1"
            max="50"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Max patients"
            value={slotForm.maxPatients}
            onChange={(e) =>
              setSlotForm((prev) => ({ ...prev, maxPatients: e.target.value }))
            }
          />

          <select
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={slotForm.visitType}
            onChange={(e) =>
              setSlotForm((prev) => ({
                ...prev,
                visitType: e.target.value as "consultation" | "procedure",
              }))
            }
          >
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
          </select>
        </div>

        <Button
          onClick={handleAddSlot}
          disabled={isSavingSlot}
          className="mt-3 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isSavingSlot ? "Adding..." : "Add Slot"}
        </Button>

        {slotMessage && (
          <p className="mt-3 text-sm text-green-700">{slotMessage}</p>
        )}
        {slotError && (
          <p className="mt-3 text-sm text-red-600">{slotError}</p>
        )}
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="schedules">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="stats">
            Slots ({(weeklySlots || []).length})
          </TabsTrigger>
        </TabsList>

        {/* Weekly Schedule Tab */}
        <TabsContent value="schedules" className="mt-0 space-y-4">
          {(weeklySlots || []).length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule by Day
              </h3>

              <div className="grid gap-2 md:grid-cols-2">
                {Array.from(slotsByDay.entries())
                  .sort((a, b) => a[0] - b[0])
                  .map(([weekday, slots]) => (
                    <div
                      key={weekday}
                      className="p-4 rounded-lg bg-neutral-50 border border-neutral-100"
                    >
                      <p className="font-semibold text-neutral-900 text-sm mb-3">
                        {WEEKDAYS[weekday] || `Day ${weekday}`}
                      </p>
                      <div className="space-y-2">
                        {slots
                          .sort(
                            (a, b) =>
                              a.start_time.localeCompare(b.start_time)
                          )
                          .map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between p-2 rounded bg-white border border-neutral-200 text-xs"
                            >
                              <div>
                                <p className="font-medium text-neutral-900">
                                  {formatTime(slot.start_time)} -{" "}
                                  {formatTime(slot.end_time)}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                    {slot.visit_type === "consultation"
                                      ? "Consultation"
                                      : "Procedure"}
                                  </span>
                                  <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                    <Users className="h-3 w-3" />
                                    {slot.max_patients}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlot(slot.id)}
                                disabled={deletingSlotId === slot.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 -m-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border border-dashed border-neutral-200 bg-white">
              <Clock className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-500">No time slots configured yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 p-4 bg-blue-50">
              <p className="text-sm font-medium text-neutral-700 mb-2">
                👨‍⚕️ Consultation Slots
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {consultationSlots.length}
              </p>
              {consultationSlots.length > 0 && (
                <p className="text-xs text-neutral-600 mt-2">
                  {consultationSlots.reduce((sum, s) => sum + s.max_patients, 0)} total capacity
                </p>
              )}
            </div>

            <div className="rounded-lg border border-neutral-200 p-4 bg-purple-50">
              <p className="text-sm font-medium text-neutral-700 mb-2">
                🏥 Procedure Slots
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {procedureSlots.length}
              </p>
              {procedureSlots.length > 0 && (
                <p className="text-xs text-neutral-600 mt-2">
                  {procedureSlots.reduce((sum, s) => sum + s.max_patients, 0)} total capacity
                </p>
              )}
            </div>
          </div>

          {weeklySlots && weeklySlots.length > 0 && (
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-sm font-semibold text-neutral-900 mb-3">
                All Slots
              </p>
              <div className="space-y-2">
                {(weeklySlots || [])
                  .sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time))
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {WEEKDAYS[slot.weekday]}, {" "}
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {slot.visit_type === "consultation" ? "👨‍⚕️ Consultation" : "🏥 Procedure"} • {slot.max_patients} max patients
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
