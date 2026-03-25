"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DatePickerFilter } from "./date-picker-filter";
import { Search, Clock, Loader2, AlertCircle, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Appointment } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";
import { CheckInDialog } from "./check-in-dialog";
import { Button } from "@/components/ui/button";
import { format, isBefore, isAfter, startOfDay } from "date-fns";

type Tab = "today" | "past" | "upcoming";

// No specific Doctor ID needed for global clinic view

// Mock Data Structure
type UiAppointment = {
  id: string;
  patient: string;
  time: string;
  date: string;
  doctor: string;
  category: string;
  status: string;
  type: Tab;
};

export function AppointmentTabs() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("view") || "upcoming") as Tab;
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);

  const queryDate =
    activeTab === "today"
      ? format(new Date(), "yyyy-MM-dd")
      : activeTab === "upcoming"
        ? filterDate
          ? format(filterDate, "yyyy-MM-dd")
          : ""
        : filterDate
          ? format(filterDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");

  const { clinic } = useAuth();

  const {
    data: rawAppointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clinic-appointments", clinic?.id, queryDate, activeTab],
    queryFn: () => {
      let url = `/appointments?`;
      if (queryDate) url += `date=${queryDate}&`;
      if (clinic?.id) url += `clinic_id=${clinic.id}`;
      return apiClient.get<Appointment[]>(url);
    },
    enabled: !!clinic?.id,
  });

  const allAppointments = useMemo(() => {
    if (!rawAppointments) return [];
    const today = startOfDay(new Date());

    return rawAppointments.map((app): UiAppointment => {
      const appDate = startOfDay(new Date(app.date));
      let type: Tab = "today";

      if (isBefore(appDate, today)) {
        type = "past";
      } else if (isAfter(appDate, today)) {
        type = "upcoming";
      }

      return {
        id: app.id,
        patient:
          app.patient_name || `Patient ${app.patient_id.substring(0, 6)}`,
        time: `Slot ${app.slot}`,
        date: app.date,
        doctor: app.doctor_name || "Dr. Smith Sandbox",
        category: "Consultation",
        status:
          app.status === "booked"
            ? type === "past"
              ? "Missed"
              : "Upcoming"
            : app.status,
        type: type,
      };
    });
  }, [rawAppointments]);

  const filteredAppointments = allAppointments.filter((app) => {
    // 1. Filter by Tab logic cleanly using string comparisons
    if (!filterDate) {
      const appDateStr = app.date;
      const todayStr = format(new Date(), "yyyy-MM-dd");

      if (activeTab === "today" && appDateStr !== todayStr) return false;
      if (activeTab === "upcoming" && appDateStr <= todayStr) return false;
      if (activeTab === "past" && appDateStr >= todayStr) return false;
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !app.patient.toLowerCase().includes(q) &&
        !app.doctor.toLowerCase().includes(q) &&
        !app.category.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Header & Filters */}
        <div className="p-5 md:p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 capitalize">
              {activeTab} Appointments
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {activeTab === "today"
                ? "Manage today's ongoing schedule."
                : `Review and filter ${activeTab} consultation records.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search patient, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[260px] pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            {/* Date Picker for Past and Upcoming */}
            {activeTab !== "today" ? (
              <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg pl-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest shrink-0">
                  Date
                </span>
                <DatePickerFilter date={filterDate} setDate={setFilterDate} />
              </div>
            ) : (
              <Button 
                onClick={() => setShowCheckIn(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold h-10 px-6 gap-2"
              >
                <QrCode className="w-4 h-4" />
                Check-in Patient
              </Button>
            )}
          </div>
        </div>

        {/* Check-in Dialog */}
        <CheckInDialog 
          open={showCheckIn} 
          onOpenChange={setShowCheckIn}
          onSuccess={() => {
            // Refresh appointments list on successful check-in
            window.location.reload(); // Simple refresh for now to update the table
          }}
        />

        {/* Table Body */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-neutral-500">
                Loading appointments...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-red-600">
                Failed to load appointments.
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {(error as Error).message}
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-[15px] font-bold text-neutral-900 mb-1">
                No Appointments Found
              </h4>
              <p className="text-sm text-neutral-500 max-w-[250px]">
                There are no scheduled consultations matching your current
                filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-neutral-500 uppercase bg-neutral-50/80 border-b border-neutral-100 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Sl No</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Doctor Name</th>
                  <th className="px-6 py-4">Category</th>

                  {activeTab === "today" && (
                    <>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Status</th>
                    </>
                  )}

                  {activeTab === "past" && (
                    <>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                    </>
                  )}

                  {activeTab === "upcoming" && (
                    <>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAppointments.map((app, index) => (
                  <tr
                    key={app.id}
                    className="bg-white hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900 group-hover:text-blue-700 transition-colors">
                      {app.patient}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">
                      {app.doctor}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {app.category}
                    </td>

                    {/* Conditional Columns for Today */}
                    {activeTab === "today" && (
                      <>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-900">
                          {app.time}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap ${
                              app.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : app.status === "In Progress"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Conditional Columns for Past */}
                    {activeTab === "past" && (
                      <>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {app.date}
                        </td>
                        <td className="px-6 py-4">
                          {/* Even though status wasn't explicitly requested for past, it is standard UX to show if it was completed or cancelled */}
                          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border bg-neutral-100 text-neutral-600 border-neutral-200">
                            {app.status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Conditional Columns for Upcoming */}
                    {activeTab === "upcoming" && (
                      <>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-900">
                          {app.time}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {app.date}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
