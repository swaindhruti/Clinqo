import { useRouter } from "next/navigation";
import { Search, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { Appointment } from "@/types/api";

// For demo purposes, hardcoding a doctor UUID. In a real app this comes from auth context.
const DEMO_DOCTOR_ID = "fe38be4f-d5f6-4d49-8366-bd235e43a86e";

export function AppointmentsSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Fetch today's appointments for the doctor
  const {
    data: rawAppointments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["appointments", DEMO_DOCTOR_ID, todayStr],
    queryFn: () => {
      const url = `/appointments/doctors/${DEMO_DOCTOR_ID}/appointments?date=${todayStr}`;
      return apiClient.get<Appointment[]>(url);
    },
  });

  // Mutation to complete an appointment
  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => 
      apiClient.patch(`/appointments/${appointmentId}/status?status=completed`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", DEMO_DOCTOR_ID, todayStr] });
      alert("Appointment marked as completed");
    },
    onError: (err: Error) => {
      alert(err.message || "Failed to complete appointment");
    }
  });

  // Transform raw API data
  const mappedAppointments = (rawAppointments || []).map((app) => ({
    id: app.id,
    patient: app.patient_name
      ? app.patient_name
      : `Patient ${app.patient_id.substring(0, 6)}`,
    time: app.time_slot ? `${app.time_slot}:00` : `Slot ${app.slot}`,
    date: app.date,
    category: "Consultation",
    status: app.status,
  }));

  const filteredAppointments = mappedAppointments.filter((app) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !app.patient.toLowerCase().includes(q) &&
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
        {/* Header & Search */}
        <div className="p-5 md:p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Today&apos;s Appointments
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Manage your patient schedule for {format(new Date(), "MMMM dd, yyyy")}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[260px] pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-neutral-500">
                Loading schedule...
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
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-[15px] font-bold text-neutral-900 mb-1">
                No Appointments Today
              </h4>
              <p className="text-sm text-neutral-500 max-w-[250px]">
                You have no scheduled consultations for today.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-neutral-500 uppercase bg-neutral-50/80 border-b border-neutral-100 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Serial</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAppointments.map((app, index) => (
                  <tr
                    key={app.id}
                    className="bg-white hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-500">
                      {index + 1}
                    </td>
                    <td 
                      className="px-6 py-4 font-bold text-neutral-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => router.push(`/doctor/appointments/${app.id}`)}
                    >
                      {app.patient}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">
                      {app.category}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-900 font-semibold">
                      {app.time}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap ${
                          app.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : app.status === "checked_in"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status !== "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            completeMutation.mutate(app.id);
                          }}
                          disabled={completeMutation.isPending}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {completeMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Complete
                        </button>
                      )}
                      {app.status === "completed" && (
                        <div className="text-green-600">
                          <CheckCircle2 className="w-5 h-5 ml-auto" />
                        </div>
                      )}
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
