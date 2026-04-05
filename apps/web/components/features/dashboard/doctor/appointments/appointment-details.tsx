"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  Activity,
  Pill,
  Trash2,
  Plus,
  AlertTriangle,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

// API client and types
import { apiClient } from "@/lib/api-client";
import {
  Appointment,
  AppointmentCompletionResponse,
  APIErrorResponse,
} from "@/types/api";
import { getStoredUser } from "@/lib/auth";

export function AppointmentDetailsSection({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const currentUser = getStoredUser();
  const doctorId = currentUser?.doctor_id || null;

  // State for dynamic medicine list
  const [medicines, setMedicines] = useState(() => [
    { id: Date.now(), name: "", dosage: "", days: "" },
  ]);

  // State for date picker
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<Appointment>(`/appointments/${appointmentId}`);
        setAppointment(data);
        
        // Fetch patient history
        if (data.patient_id) {
          const historyData = await apiClient.get<Appointment[]>(`/appointments?patient_id=${data.patient_id}`);
          // Filter out current appointment from history
          setHistory(historyData.filter(app => app.id !== appointmentId));
        }
      } catch (err) {
        const apiErr = err as APIErrorResponse;
        setError(apiErr.message || "Failed to load appointment details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [appointmentId]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now(), name: "", dosage: "", days: "" },
    ]);
  };

  const removeMedicine = (id: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((med) => med.id !== id));
    }
  };

  const updateMedicine = (id: number, field: string, value: string) => {
    setMedicines(
      medicines.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    );
  };

  const handleCompleteAndNext = async () => {
    setIsCompleting(true);
    try {
      const result = await apiClient.post<AppointmentCompletionResponse>(
        `/appointments/${appointmentId}/complete`,
        {},
      );

      if (result.next_appointment?.id) {
        router.replace(`/doctor/appointments/${result.next_appointment.id}`);
        return;
      }

      router.push("/doctor?tab=appointments&view=today");
    } catch (err) {
      const apiErr = err as APIErrorResponse;
      setError(apiErr.message || "Failed to complete appointment.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-neutral-600 font-medium">{error || "Appointment not found"}</p>
        <Button onClick={() => router.push("/doctor?tab=appointments")}>Go Back</Button>
      </div>
    );
  }

  const patient = appointment.patient;
  const formattedDateTime = appointment.date + (appointment.time_slot ? `, ${appointment.time_slot}:00` : "");
  let intakeDetails: Record<string, unknown> | null = null;

  if (appointment.intake_data) {
    try {
      intakeDetails = JSON.parse(appointment.intake_data) as Record<string, unknown>;
    } catch {
      intakeDetails = { raw: appointment.intake_data };
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full h-full min-h-[calc(100vh-100px)]">
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <button
          onClick={() => router.push("/doctor?tab=appointments")}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold bg-white border border-neutral-200 px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleCompleteAndNext}
          disabled={isCompleting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isCompleting ? "Completing..." : "Complete & Next"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Left Column: Patient Details & Past History */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Patient Card - Removed Avatar */}
          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 bg-neutral-50/50 border-b border-neutral-100 flex flex-col items-center text-center">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                {patient?.name || "Unknown Patient"}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {appointment.status}
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  ID: #{appointmentId.slice(0, 8)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-medium">
                    Age / Gender
                  </span>
                  <span className="text-neutral-900 font-bold">
                    {patient?.age ? `${patient.age}Y` : "N/A"}, {patient?.gender || "N/A"}
                  </span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold text-neutral-600">
                      {formattedDateTime}
                    </span>
                  </div>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-medium">
                    Blood Group
                  </span>
                  <span className="text-neutral-900 font-bold">
                    {patient?.blood_group || "N/A"}
                  </span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-medium">Contact</span>
                  <span className="text-neutral-900 font-bold">
                    {patient?.phone || "N/A"}
                  </span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-medium">Doctor</span>
                  <span className="text-neutral-900 font-bold">
                    {doctorId ? doctorId.slice(0, 8) : "N/A"}
                  </span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-medium">Check-in Code</span>
                  <span className="text-neutral-900 font-bold">
                    {appointment.check_in_code || "N/A"}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Past Appointments - Opens Dialog */}
          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <h3 className="text-sm font-bold text-neutral-900">History</h3>
            </div>

            <div className="p-3 flex flex-col gap-2 flex-1 overflow-y-auto max-h-[400px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-neutral-50/30 rounded-lg border border-dashed border-neutral-100 italic text-neutral-400 text-xs">
                  No past appointments
                </div>
              ) : (
                history.map((past) => (
                  <Dialog key={past.id}>
                    <DialogTrigger asChild>
                      <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/30 hover:bg-neutral-50 hover:border-neutral-200 transition-all cursor-pointer group flex items-start justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                            {past.date}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-tight">
                            Status: {past.status}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" /> Appointment
                          Details
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                          Patient: {patient?.name} • Date: {past.date}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4 p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 italic text-neutral-400 text-sm">
                        Detailed prescription history not available.
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Consultation Form (Symptoms, Diagnosis, Rx, Precautions, Follow up) */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden flex flex-col flex-1">
            <div className="p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Prescription & Notes
                </h3>
              </div>
            </div>

            <div className="p-4 md:p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
              {/* Symptoms & Diagnosis Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                    <Activity className="w-3.5 h-3.5" />
                    Symptoms
                  </label>
                  <textarea
                    rows={6}
                    className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium placeholder:text-neutral-400 resize-none shadow-sm"
                    placeholder="Describe patient compliants..."
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                    <FileText className="w-3.5 h-3.5" />
                    Diagnosis
                  </label>
                  <textarea
                    rows={6}
                    className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium placeholder:text-neutral-400 resize-none shadow-sm"
                    placeholder="Primary and secondary issues..."
                  ></textarea>
                </div>
              </div>

              {/* Precautions Box */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Precautions & Advice
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium placeholder:text-neutral-400 resize-none shadow-sm"
                  placeholder="Dietary restrictions, rest instructions..."
                ></textarea>
              </div>

              {/* Medications */}
              <div className="space-y-3 bg-neutral-50/50 p-4 md:p-5 rounded-xl border border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                    <Pill className="w-3.5 h-3.5" />
                    Medicines & Dosage
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  {medicines.map((med) => (
                    <div
                      key={med.id}
                      className="flex gap-2 items-start relative animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div className="grid grid-cols-[2fr_1.5fr_1fr] flex-1 gap-2">
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) =>
                            updateMedicine(med.id, "name", e.target.value)
                          }
                          placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                          className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium shadow-sm"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedicine(med.id, "dosage", e.target.value)
                          }
                          placeholder="Dosage (e.g. 1-0-1)"
                          className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium shadow-sm"
                        />
                        <input
                          type="text"
                          value={med.days}
                          onChange={(e) =>
                            updateMedicine(med.id, "days", e.target.value)
                          }
                          placeholder="Days"
                          className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium shadow-sm"
                        />
                      </div>

                      <button
                        onClick={() => removeMedicine(med.id)}
                        disabled={medicines.length === 1}
                        className="w-10 h-10 flex shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neutral-400 bg-white border border-neutral-200 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addMedicine}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 border-2 border-dashed border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors mt-1"
                  >
                    <Plus className="w-4 h-4" /> Add Next Medicine
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Form row component */}
            <div className="p-4 md:p-5 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
              <div className="space-y-1.5 flex flex-col justify-center">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Plan Follow-up
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-medium shadow-sm w-[220px] justify-between">
                      {followUpDate ? (
                        format(followUpDate, "PPP")
                      ) : (
                        <span className="text-neutral-400">
                          Select follow-up date
                        </span>
                      )}
                      <CalendarIcon className="w-4 h-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <p className="text-xs text-neutral-400 font-medium max-w-[280px] sm:text-right hidden xl:block">
                Ensure all medical records are accurate before completing the
                consultation.
              </p>
            </div>

            {intakeDetails ? (
              <div className="px-4 md:px-6 pb-6">
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <h4 className="text-sm font-bold text-neutral-900">
                    WhatsApp booking details
                  </h4>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-neutral-700 border border-blue-100">
                    {JSON.stringify(intakeDetails, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
