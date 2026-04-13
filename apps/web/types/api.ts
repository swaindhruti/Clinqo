export interface Patient {
  id: string;
  name: string;
  age: number;
  gender?: string | null;
  phone: string;
  email: string | null;
  blood_group?: string | null;
  created_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  specialty?: string | null;
  created_at?: string;
}

export interface Doctor {
  id?: string;
  name: string;
  code: string;
  specialty: string;
  clinic_id?: string | null;
  clinic?: Clinic | null;
}

export interface DoctorAvailability {
  doctor_id?: string;
  date: string;
  is_present: boolean;
  notes?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  slot: number;
  time_slot?: number;
  slot_label?: string | null;
  visit_type?: "consultation" | "procedure";
  status: string;
  created_at?: string;
  updated_at?: string;
  
  // These fields are appended by the backend when joining with patient/doctor data
  patient?: Patient;
  doctor?: Doctor;
  patient_name?: string;
  doctor_name?: string;
  check_in_code?: string;
  intake_data?: string | null;
}

export interface CheckIn {
  queue_position: number;
  checked_in_at: string;
  appointment_id: string;
  check_in_code?: string;
}

export interface AppointmentCompletionResponse {
  completed_appointment: Appointment;
  next_appointment?: Appointment | null;
}

export interface DoctorWeeklySlot {
  id: string;
  doctor_id: string;
  clinic_id?: string | null;
  weekday: number;
  start_time: string;
  end_time: string;
  max_patients: number;
  visit_type: "consultation" | "procedure";
  is_active: boolean;
  created_at: string;
}

export interface SlotAvailability {
  slot_label: string;
  max_patients: number;
  booked_patients: number;
  remaining: number;
  visit_type: "consultation" | "procedure";
}

export interface DayAvailability {
  date: string;
  weekday: number;
  slots: SlotAvailability[];
}

export interface ProcedureBooking {
  id: string;
  clinic_id: string;
  patient_id: string;
  sub_category?: string | null;
  preferred_date: string;
  preferred_slot?: string | null;
  intake_data?: string | null;
  status: string;
  patient?: Patient;
  created_at: string;
  updated_at: string;
}

export interface QueryRecord {
  id: string;
  clinic_id: string;
  patient_id?: string | null;
  patient_phone: string;
  patient_name: string;
  query_text: string;
  status: string;
  created_at: string;
}

export interface APIErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthRole = "admin" | "clinic" | "doctor";

export interface User {
  id: string;
  email: string;
  role: AuthRole;
  clinic_id?: string | null;
  doctor_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: AuthRole;
  user_id: string;
}
