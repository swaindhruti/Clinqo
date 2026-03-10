export interface Patient {
  id: string;
  name: string;
  age: number;
  gender?: string | null;
  phone: string;
  email: string | null;
  created_at: string;
}

export interface Doctor {
  id?: string;
  name: string;
  code: string;
  specialty: string;
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
  status: string;
  created_at?: string;
  updated_at?: string;
  
  // These fields might be appended by the backend when joining with patient data
  patient_name?: string;
  doctor_name?: string;
}

export interface CheckIn {
  queue_position: number;
  checked_in_at: string;
  appointment_id: string;
}

export interface APIErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
