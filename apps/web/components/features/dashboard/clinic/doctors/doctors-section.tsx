"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Loader2, Stethoscope, Clock3, CalendarDays } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { getStoredUser } from "@/lib/auth";
import type { Doctor, DoctorWeeklySlot } from "@/types/api";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatWeekday(day: number) {
  return weekdayLabels[day] || `Day ${day}`;
}

export function DoctorsSection() {
  const currentUser = getStoredUser();
  const clinicId = currentUser?.clinic_id || "";

  const { data: doctors, isLoading: doctorsLoading, error: doctorsError } = useQuery({
    queryKey: ["clinic-doctors", clinicId],
    queryFn: () => apiClient.get<Doctor[]>(`/clinics/${clinicId}/doctors`),
    enabled: Boolean(clinicId),
  });

  const { data: weeklySlots, isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ["clinic-doctor-weekly-slots", clinicId],
    queryFn: () => apiClient.get<DoctorWeeklySlot[]>(`/clinics/${clinicId}/doctor-weekly-slots`),
    enabled: Boolean(clinicId),
  });

  const slotsByDoctor = useMemo(() => {
    const map = new Map<string, DoctorWeeklySlot[]>();
    (doctors || []).forEach((doctor) => {
      map.set(
        doctor.id || "",
        (weeklySlots || []).filter((slot) => slot.doctor_id === doctor.id),
      );
    });
    return map;
  }, [doctors, weeklySlots]);

  const activeDoctorCount = (doctors || []).length;
  const totalSlots = (weeklySlots || []).length;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Doctors & Slots</h2>
        <p className="text-neutral-500 mt-1">
          View all doctors assigned to this clinic and their weekly availability windows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Assigned Doctors</p>
              <p className="text-2xl font-bold text-neutral-900">{activeDoctorCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Weekly Slots</p>
              <p className="text-2xl font-bold text-neutral-900">{totalSlots}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Updated</p>
              <p className="text-sm font-semibold text-neutral-900">{format(new Date(), "MMM d, yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      {doctorsLoading || slotsLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-sm text-neutral-500">Loading doctors and slots...</p>
        </div>
      ) : doctorsError || slotsError ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load doctors or weekly slots.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {(doctors || []).map((doctor) => {
          const doctorSlots = slotsByDoctor.get(doctor.id || "") || [];

          return (
            <div key={doctor.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{doctor.name}</h3>
                  <p className="text-sm text-neutral-500">{doctor.specialty || "General"}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {doctorSlots.length} slots
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {doctorSlots.length === 0 ? (
                  <p className="text-sm text-neutral-500">No weekly slots configured.</p>
                ) : (
                  doctorSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-neutral-900">{formatWeekday(slot.weekday)}</p>
                        <p className="text-sm text-neutral-500">
                          {slot.start_time} - {slot.end_time} · {slot.visit_type}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-neutral-600">
                        Max {slot.max_patients} patients
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {clinicId && (doctors || []).length === 0 && !doctorsLoading ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-500">
          No doctors are assigned to this clinic yet.
        </div>
      ) : null}
    </div>
  );
}