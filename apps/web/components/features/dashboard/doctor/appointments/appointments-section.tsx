"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Search, Clock, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
// Reusing the date picker from the clinic UI for consistent UX
import { DatePickerFilter } from "../../clinic/appointments/date-picker-filter";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { Appointment } from "@/types/api";

type Tab = "today" | "past" | "upcoming";

// For demo purposes, hardcoding a doctor UUID. In a real app this comes from auth context.
const DEMO_DOCTOR_ID = "fe38be4f-d5f6-4d49-8366-bd235e43a86e";

export function AppointmentsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("view") || "upcoming") as Tab;
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch appointments for the selected date
  const {
    data: rawAppointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments", DEMO_DOCTOR_ID, queryDate, activeTab],
    queryFn: () => {
      const url = queryDate
        ? `/appointments/doctors/${DEMO_DOCTOR_ID}/appointments?date=${queryDate}`
        : `/appointments/doctors/${DEMO_DOCTOR_ID}/appointments`;
      return apiClient.get<Appointment[]>(url);
    },
  });

  // Transform raw API data to match the UI's expected format
  const mappedAppointments = (rawAppointments || []).map((app) => ({
    id: app.id,
    patient: app.patient_name
      ? app.patient_name
      : `Patient ${app.patient_id.substring(0, 6)}`,
    time: `Slot ${app.slot}`,
    date: app.date,
    category: "Consultation",
    status: app.status === "booked" ? "Upcoming" : app.status,
    type: activeTab,
  }));

  const filteredAppointments = mappedAppointments.filter((app) => {
    // 1. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !app.patient.toLowerCase().includes(q) &&
        !app.category.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    // 2. Separate into the correct tabs
    if (!filterDate) {
      const appDateStr = app.date;
      const todayStr = format(new Date(), "yyyy-MM-dd");

      // For "today" tab, strictly match today's date
      if (activeTab === "today" && appDateStr !== todayStr) return false;

      // For "upcoming" tab, strictly match future dates (> today)
      if (activeTab === "upcoming" && appDateStr <= todayStr) return false;

      // For "past" tab, strictly match past dates (< today)
      if (activeTab === "past" && appDateStr >= todayStr) return false;
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
              My {activeTab} Appointments
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {activeTab === "today"
                ? "Manage your ongoing patient schedule for today."
                : `Review and filter your historical patient records.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search patient, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[260px] pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            {/* Date Picker for Past and Upcoming */}
            {(activeTab === "past" || activeTab === "upcoming") && (
              <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg pl-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest shrink-0">
                  Date
                </span>
                <DatePickerFilter date={filterDate} setDate={setFilterDate} />
              </div>
            )}
          </div>
        </div>

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
                <Clock className="w-6 h-6" />
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
                  <th className="px-6 py-4">Category</th>

                  {activeTab === "today" && (
                    <>
                      <th className="px-6 py-4">Time Slot</th>
                      <th className="px-6 py-4">Status</th>
                    </>
                  )}

                  {(activeTab === "past" || activeTab === "upcoming") && (
                    <>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                    </>
                  )}

                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAppointments.map((app, index) => (
                  <tr
                    key={app.id}
                    onClick={() => {
                      if (activeTab === "today") {
                        router.push(`/doctor/appointments/${app.id}`);
                      }
                    }}
                    className="bg-white hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900 group-hover:text-blue-700 transition-colors">
                      {app.patient}
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

                    {/* Conditional Columns for Past and Upcoming */}
                    {(activeTab === "past" || activeTab === "upcoming") && (
                      <>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                          {app.date}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border bg-neutral-100 text-neutral-600 border-neutral-200">
                            {app.status}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="px-6 py-4 text-right">
                      <div className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 transition-colors ml-auto">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </td>
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
