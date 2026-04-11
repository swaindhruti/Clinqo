"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, CalendarDays, Clock3, Loader2, Users } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { getStoredUser } from "@/lib/auth";
import type { Appointment } from "@/types/api";

export function OverviewSection() {
  const user = getStoredUser();
  const doctorId = user?.doctor_id || "";

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ["doctor-overview", doctorId],
    queryFn: () => apiClient.get<Appointment[]>(`/appointments/doctors/${doctorId}/appointments`),
    enabled: Boolean(doctorId),
  });

  const metrics = useMemo(() => {
    const all = appointments || [];
    const today = format(new Date(), "yyyy-MM-dd");

    const todayAppointments = all.filter((item) => item.date === today).length;
    const upcomingAppointments = all.filter(
      (item) => item.date >= today && (item.status || "").toLowerCase() === "booked",
    );
    const completedAppointments = all.filter((item) => (item.status || "").toLowerCase() === "completed").length;
    const uniquePatients = new Set(all.map((item) => item.patient_id)).size;

    const nextAppointment = [...upcomingAppointments].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.slot || 0) - (b.slot || 0);
    })[0];

    return {
      todayAppointments,
      upcomingCount: upcomingAppointments.length,
      completedAppointments,
      uniquePatients,
      nextAppointment,
    };
  }, [appointments]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Doctor Overview</h2>
        <p className="text-neutral-500 mt-1">Live summary of your appointments and patient workload.</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-neutral-500">Loading doctor analytics...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load doctor overview data.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Today&apos;s Appointments</span>
              <p className="mt-2 text-4xl font-black text-neutral-900">{metrics.todayAppointments}</p>
            </div>

            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock3 className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Upcoming</span>
              <p className="mt-2 text-4xl font-black text-neutral-900">{metrics.upcomingCount}</p>
            </div>

            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Unique Patients</span>
              <p className="mt-2 text-4xl font-black text-neutral-900">{metrics.uniquePatients}</p>
            </div>

            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Completed</span>
              <p className="mt-2 text-4xl font-black text-neutral-900">{metrics.completedAppointments}</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-8">
            <h3 className="text-lg font-semibold text-neutral-900">Next Appointment</h3>
            {metrics.nextAppointment ? (
              <div className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">Patient</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {metrics.nextAppointment.patient_name || "Patient"}
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-neutral-600">
                  <div>
                    <p className="text-neutral-500">Date</p>
                    <p className="font-medium text-neutral-900">{metrics.nextAppointment.date}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Slot</p>
                    <p className="font-medium text-neutral-900">{metrics.nextAppointment.slot_label || `Slot ${metrics.nextAppointment.slot}`}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Status</p>
                    <p className="font-medium capitalize text-neutral-900">{metrics.nextAppointment.status}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">
                No upcoming appointments scheduled.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
