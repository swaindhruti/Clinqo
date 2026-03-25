"use client";

import { Users, CalendarHeart, Stethoscope, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type ClinicStats = {
  total_patients: number;
  appointments_today: number;
  doctors_available: number;
};

export function StatCards() {
  const { clinic } = useAuth();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["clinic-stats", clinic?.id],
    queryFn: () => apiClient.get<ClinicStats>(`/clinics/${clinic?.id}/stats`),
    enabled: !!clinic?.id,
  });

  const stats = [
    {
      title: "Total Patients",
      value: statsData?.total_patients?.toLocaleString() || "0",
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: statsData?.appointments_today?.toString() || "0",
      icon: CalendarHeart,
    },
    {
      title: "Total Doctors",
      value: statsData?.doctors_available?.toString() || "0",
      icon: Stethoscope,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 shadow-sm aspect-video rounded-xl p-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-neutral-300 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3 w-full">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white border border-neutral-200 shadow-sm aspect-video rounded-xl p-6 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-500"
        >
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-50/50">
            <stat.icon className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-neutral-500 mb-1">
            {stat.title}
          </span>
          <span className="text-3xl font-bold text-neutral-900 tracking-tight">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
