"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Building2, CalendarCheck2, Loader2, Stethoscope, Trophy } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import type { Appointment, ProcedureBooking } from "@/types/api";

type ClinicLite = { id: string; name: string };
type DoctorLite = { id: string; name: string; clinic_id?: string | null };

export function OverviewSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview-analytics"],
    queryFn: async () => {
      const [appointments, procedures, clinics, doctors] = await Promise.all([
        apiClient.get<Appointment[]>("/appointments"),
        apiClient.get<ProcedureBooking[]>("/procedures"),
        apiClient.get<ClinicLite[]>("/clinics"),
        apiClient.get<DoctorLite[]>("/doctors"),
      ]);
      return { appointments, procedures, clinics, doctors };
    },
  });

  const metrics = useMemo(() => {
    const appointments = data?.appointments || [];
    const procedures = data?.procedures || [];
    const clinics = data?.clinics || [];
    const doctors = data?.doctors || [];
    const today = format(new Date(), "yyyy-MM-dd");

    const todayAppointments = appointments.filter((item) => item.date === today).length;
    const todayProcedures = procedures.filter((item) => item.preferred_date === today).length;

    const doctorNameById = Object.fromEntries(doctors.map((d) => [d.id, d.name]));
    const clinicNameById = Object.fromEntries(clinics.map((c) => [c.id, c.name]));
    const clinicIdByDoctorId = Object.fromEntries(doctors.map((d) => [d.id, d.clinic_id || ""]));

    const clinicCounts = appointments.reduce<Record<string, number>>((acc, item) => {
      const clinicId = item.doctor?.clinic_id || clinicIdByDoctorId[item.doctor_id] || "";
      if (!clinicId) return acc;
      acc[clinicId] = (acc[clinicId] || 0) + 1;
      return acc;
    }, {});

    const doctorCounts = appointments.reduce<Record<string, number>>((acc, item) => {
      const doctorId = item.doctor_id;
      if (!doctorId) return acc;
      acc[doctorId] = (acc[doctorId] || 0) + 1;
      return acc;
    }, {});

    const topClinicEntry = Object.entries(clinicCounts).sort((a, b) => b[1] - a[1])[0];
    const topDoctorEntry = Object.entries(doctorCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalAppointments: appointments.length,
      totalProcedureBookings: procedures.length,
      totalClinics: clinics.length,
      totalDoctors: doctors.length,
      todayBookings: todayAppointments + todayProcedures,
      topClinicName: topClinicEntry ? clinicNameById[topClinicEntry[0]] || "—" : "—",
      topClinicCount: topClinicEntry?.[1] || 0,
      topDoctorName: topDoctorEntry ? doctorNameById[topDoctorEntry[0]] || "—" : "—",
      topDoctorCount: topDoctorEntry?.[1] || 0,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Platform Overview</h2>
        <p className="text-muted-foreground mt-1">Live platform analytics across clinics, doctors, and bookings.</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-neutral-500">Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load overview analytics.
        </div>
      ) : (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Total Appointments</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.totalAppointments}</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Total Procedure Bookings</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.totalProcedureBookings}</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Total Clinics / Doctors</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.totalClinics} / {metrics.totalDoctors}</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <p className="text-sm text-neutral-500">Today&apos;s Total Bookings</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{metrics.todayBookings}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <Building2 className="h-4 w-4 text-blue-600" />
                Highest-Load Clinic
              </h3>
              <p className="mt-3 text-xl font-bold text-neutral-900">{metrics.topClinicName}</p>
              <p className="mt-1 text-sm text-neutral-500">{metrics.topClinicCount} appointments recorded</p>
            </div>
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <Stethoscope className="h-4 w-4 text-teal-600" />
                Highest-Load Doctor
              </h3>
              <p className="mt-3 text-xl font-bold text-neutral-900">{metrics.topDoctorName}</p>
              <p className="mt-1 text-sm text-neutral-500">{metrics.topDoctorCount} appointments recorded</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
            <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Quick Insights
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-neutral-700">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium">Appointments</p>
                <p className="text-neutral-500 mt-1">{metrics.totalAppointments} total across platform.</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium">Procedures</p>
                <p className="text-neutral-500 mt-1">{metrics.totalProcedureBookings} total procedure requests.</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium">Today</p>
                <p className="text-neutral-500 mt-1">{metrics.todayBookings} combined bookings today.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
