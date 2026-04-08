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
  Stethoscope,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DoctorWeeklySlot } from "@/types/api";

type ClinicDetailsApi = {
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
  visit_type: "consultation" | "procedure";
  name: string;
  price?: string | null;
  emoji?: string | null;
  sort_order: number;
  detail_questions?: string | null;
  created_at: string;
};

type DoctorDetailsApi = {
  id: string;
  name: string;
  code: string;
  specialty: string;
  clinic_id?: string | null;
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

interface ClinicDetailsProps {
  clinicId: string;
  onBack: () => void;
}

export function ClinicDetails({ clinicId, onBack }: ClinicDetailsProps) {
  const queryClient = useQueryClient();
  const [serviceForm, setServiceForm] = useState({
    visitType: "consultation" as "consultation" | "procedure",
    name: "",
    price: "",
    emoji: "",
  });
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isDeletingClinic, setIsDeletingClinic] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Fetch clinic details
  const { data: clinicDetails } = useQuery({
    queryKey: ["clinic-details", clinicId],
    queryFn: () => apiClient.get<ClinicDetailsApi>(`/clinics/${clinicId}`),
    enabled: !!clinicId,
  });

  // Fetch clinic services
  const { data: clinicServices } = useQuery({
    queryKey: ["clinic-services", clinicId],
    queryFn: () => apiClient.get<ServiceCategoryApi[]>(`/clinics/${clinicId}/services`),
    enabled: !!clinicId,
  });

  // Fetch doctors in clinic
  const { data: clinicDoctors } = useQuery({
    queryKey: ["clinic-doctors", clinicId],
    queryFn: () => apiClient.get<DoctorDetailsApi[]>(`/clinics/${clinicId}/doctors`),
    enabled: !!clinicId,
  });

  // Fetch weekly slots for all doctors in clinic
  const { data: weeklySlots } = useQuery({
    queryKey: ["clinic-weekly-slots", clinicId],
    queryFn: () => apiClient.get<DoctorWeeklySlot[]>(`/clinics/${clinicId}/doctor-weekly-slots`),
    enabled: !!clinicId,
  });

  const consultationServices = useMemo(
    () => (clinicServices || []).filter((s) => s.visit_type === "consultation"),
    [clinicServices]
  );

  const procedureServices = useMemo(
    () => (clinicServices || []).filter((s) => s.visit_type === "procedure"),
    [clinicServices]
  );

  const doctorSlotsMap = useMemo(() => {
    const map = new Map<string, DoctorWeeklySlot[]>();
    if (clinicDoctors && weeklySlots) {
      clinicDoctors.forEach((doctor) => {
        const doctorSlots = weeklySlots.filter((slot) => slot.doctor_id === doctor.id);
        map.set(doctor.id, doctorSlots);
      });
    }
    return map;
  }, [clinicDoctors, weeklySlots]);

  const handleAddService = async () => {
    if (!serviceForm.name.trim()) {
      setServiceError("Service name is required.");
      return;
    }

    setIsSavingService(true);
    setServiceError(null);
    setServiceMessage(null);

    try {
      await apiClient.post(`/clinics/${clinicId}/services`, {
        clinic_id: clinicId,
        visit_type: serviceForm.visitType,
        name: serviceForm.name.trim(),
        price: serviceForm.price.trim() || null,
        emoji: serviceForm.emoji.trim() || null,
        sort_order: 0,
        detail_questions: null,
      });

      setServiceMessage(
        `${serviceForm.visitType === "consultation" ? "Consultation" : "Procedure"} added successfully.`
      );
      setServiceForm({
        visitType: serviceForm.visitType,
        name: "",
        price: "",
        emoji: "",
      });

      await queryClient.invalidateQueries({ queryKey: ["clinic-services", clinicId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add service.";
      setServiceError(message);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    setDeletingServiceId(serviceId);
    try {
      await apiClient.delete(`/clinics/${clinicId}/services/${serviceId}`);
      await queryClient.invalidateQueries({ queryKey: ["clinic-services", clinicId] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service.";
      alert(message);
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleDeleteClinic = async () => {
    if (!confirm("Are you sure you want to delete this clinic?")) return;

    setIsDeletingClinic(true);
    try {
      await apiClient.delete(`/clinics/${clinicId}`);
      await queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
      onBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete clinic.";
      alert(message);
    } finally {
      setIsDeletingClinic(false);
    }
  };

  const handleDeleteSlot = async (doctorId: string, slotId: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;

    setDeletingSlotId(slotId);
    try {
      await apiClient.delete(`/doctors/${doctorId}/weekly-slots/${slotId}`);
      await queryClient.invalidateQueries({ queryKey: ["clinic-weekly-slots", clinicId] });
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
            {clinicDetails?.name || "Clinic Details"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage clinic information, services, and doctors
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteClinic}
            disabled={isDeletingClinic}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeletingClinic ? "Deleting..." : "Delete Clinic"}
          </Button>
        </div>
      </div>

      {/* Clinic Information Card */}
      {clinicDetails && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Clinic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-700">Clinic Name</p>
              <p className="text-neutral-900 font-semibold">{clinicDetails.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Contact Number</p>
              <p className="text-neutral-900 font-semibold">{clinicDetails.phone || "—"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-neutral-700">Address</p>
              <p className="text-neutral-900 font-semibold">
                {clinicDetails.address || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Specialty</p>
              <p className="text-neutral-900 font-semibold">
                {clinicDetails.specialty || "General"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="doctors">Doctors & Slots</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="mt-0 space-y-6">
          {/* Add Service Section */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Add New Service
            </h2>

            <div className="grid gap-3 md:grid-cols-5">
              <select
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                value={serviceForm.visitType}
                onChange={(e) =>
                  setServiceForm((prev) => ({
                    ...prev,
                    visitType: e.target.value as "consultation" | "procedure",
                  }))
                }
              >
                <option value="consultation">Consultation</option>
                <option value="procedure">Procedure</option>
              </select>

              <input
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                placeholder="Service name (e.g. Root Canal)"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <input
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                placeholder="Price (optional)"
                value={serviceForm.price}
                onChange={(e) =>
                  setServiceForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />

              <input
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                placeholder="Emoji (optional)"
                maxLength={2}
                value={serviceForm.emoji}
                onChange={(e) =>
                  setServiceForm((prev) => ({ ...prev, emoji: e.target.value }))
                }
              />

              <Button
                onClick={handleAddService}
                disabled={!serviceForm.name.trim() || isSavingService}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isSavingService ? "Adding..." : "Add Service"}
              </Button>
            </div>

            {serviceMessage && (
              <p className="mt-3 text-sm text-green-700">{serviceMessage}</p>
            )}
            {serviceError && (
              <p className="mt-3 text-sm text-red-600">{serviceError}</p>
            )}
          </div>

          {/* Consultations */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Consultations ({consultationServices.length})
              </h2>
            </div>

            {consultationServices.length > 0 ? (
              <div className="space-y-2">
                {consultationServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {service.emoji ? `${service.emoji} ` : ""}
                        {service.name}
                      </p>
                      {service.price && (
                        <p className="text-sm text-neutral-600">₹ {service.price}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      disabled={deletingServiceId === service.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No consultation services added yet.</p>
            )}
          </div>

          {/* Procedures */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Procedures ({procedureServices.length})
              </h2>
            </div>

            {procedureServices.length > 0 ? (
              <div className="space-y-2">
                {procedureServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {service.emoji ? `${service.emoji} ` : ""}
                        {service.name}
                      </p>
                      {service.price && (
                        <p className="text-sm text-neutral-600">₹ {service.price}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      disabled={deletingServiceId === service.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No procedure services added yet.</p>
            )}
          </div>
        </TabsContent>

        {/* Doctors & Slots Tab */}
        <TabsContent value="doctors" className="mt-0 space-y-6">
          {clinicDoctors && clinicDoctors.length > 0 ? (
            <div className="space-y-4">
              {clinicDoctors.map((doctor) => {
                const doctorSlots = doctorSlotsMap.get(doctor.id) || [];
                const slotsByDay = new Map<number, DoctorWeeklySlot[]>();

                doctorSlots.forEach((slot) => {
                  if (!slotsByDay.has(slot.weekday)) {
                    slotsByDay.set(slot.weekday, []);
                  }
                  slotsByDay.get(slot.weekday)!.push(slot);
                });

                return (
                  <div
                    key={doctor.id}
                    className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {doctor.specialty || "General Practitioner"} • ID: {doctor.code}
                        </p>
                      </div>
                    </div>

                    {doctorSlots.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Weekly Schedule
                        </h4>

                        <div className="grid gap-2 md:grid-cols-2">
                          {Array.from(slotsByDay.entries())
                            .sort((a, b) => a[0] - b[0])
                            .map(([weekday, slots]) => (
                              <div
                                key={weekday}
                                className="p-3 rounded-lg bg-neutral-50 border border-neutral-100"
                              >
                                <p className="font-medium text-neutral-900 text-sm mb-2">
                                  {WEEKDAYS[weekday] || `Day ${weekday}`}
                                </p>
                                <div className="space-y-1">
                                  {slots
                                    .sort(
                                      (a, b) =>
                                        a.start_time.localeCompare(b.start_time)
                                    )
                                    .map((slot) => (
                                      <div
                                        key={slot.id}
                                        className="flex items-center justify-between text-xs text-neutral-600 bg-white p-2 rounded"
                                      >
                                        <span>
                                          {formatTime(slot.start_time)} -{" "}
                                          {formatTime(slot.end_time)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                            {slot.visit_type === "consultation"
                                              ? "Consultation"
                                              : "Procedure"}
                                          </span>
                                          <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                            <Users className="h-3 w-3" />
                                            {slot.max_patients}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteSlot(doctor.id, slot.id)}
                                            disabled={deletingSlotId === slot.id}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">No weekly schedule configured.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
              <p>No doctors assigned to this clinic yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
