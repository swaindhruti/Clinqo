"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, CalendarDays, Loader2, Stethoscope, Users } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { getStoredUser } from "@/lib/auth";
import type { Appointment, ProcedureBooking } from "@/types/api";

type ClinicDoctor = { id: string; name: string; specialty?: string | null };

export function OverviewSection() {
  const user = getStoredUser();
  const clinicId = user?.clinic_id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["clinic-overview", clinicId],
    queryFn: async () => {
      const [appointments, procedures, doctors] = await Promise.all([
        apiClient.get<Appointment[]>("/appointments", { clinic_id: clinicId }),
        apiClient.get<ProcedureBooking[]>("/procedures", { clinic_id: clinicId }),
        apiClient.get<ClinicDoctor[]>(`/clinics/${clinicId}/doctors`),
      ]);
      return { appointments, procedures, doctors };
    },
    enabled: Boolean(clinicId),
  });

  const metrics = useMemo(() => {
    const appointments = data?.appointments || [];
    const procedures = data?.procedures || [];
    const doctors = data?.doctors || [];
    const today = format(new Date(), "yyyy-MM-dd");

    const todayAppointments = appointments.filter((item) => item.date === today).length;
    const upcomingAppointments = appointments.filter(
      (item) => item.date >= today && (item.status || "").toLowerCase() === "booked",
    ).length;

    const uniquePatientIds = new Set<string>([
      ...appointments.map((item) => item.patient_id),
      ...procedures.map((item) => item.patient_id),
    ]);

    const doctorCounts = appointments.reduce<Record<string, number>>((acc, item) => {
      if (!item.doctor_id) return acc;
      acc[item.doctor_id] = (acc[item.doctor_id] || 0) + 1;
      return acc;
    }, {});
    const topDoctorEntry = Object.entries(doctorCounts).sort((a, b) => b[1] - a[1])[0];
    const topDoctor = doctors.find((doctor) => doctor.id === topDoctorEntry?.[0]);

    return {
      totalPatients: uniquePatientIds.size,
      todayAppointments,
      upcomingAppointments,
      procedureBookings: procedures.length,
      doctorCount: doctors.length,
      topDoctorName: topDoctor?.name || "—",
      topDoctorCount: topDoctorEntry?.[1] || 0,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Clinic Overview</h2>
        <p className="text-neutral-500 mt-1">Live metrics for your clinic operations and bookings.</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-neutral-500">Loading clinic analytics...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load clinic analytics.
        </div>
      ) : (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Total Patients</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.totalPatients}</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Appointments Today</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.todayAppointments}</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Upcoming Appointments</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.upcomingAppointments}</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Procedure Bookings</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.procedureBookings}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                Doctors in Clinic
              </h3>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.doctorCount}</p>
              <p className="mt-1 text-sm text-neutral-500">Assigned to this clinic.</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-600" />
                Highest-Load Doctor
              </h3>
              <p className="mt-2 text-xl font-bold text-neutral-900">{metrics.topDoctorName}</p>
              <p className="mt-1 text-sm text-neutral-500">{metrics.topDoctorCount} appointments recorded.</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-violet-600" />
              Operations Snapshot
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-neutral-700">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium">Today</p>
                <p className="text-neutral-500 mt-1">{metrics.todayAppointments} appointments scheduled.</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium">Upcoming</p>
                <p className="text-neutral-500 mt-1">{metrics.upcomingAppointments} booked upcoming appointments.</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium">Procedures</p>
                <p className="text-neutral-500 mt-1">{metrics.procedureBookings} total procedure bookings.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
