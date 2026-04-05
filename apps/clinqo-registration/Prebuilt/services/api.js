/**
 * services/api.js - Backend API calls to the core server
 */
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
const headers = { 'Content-Type': 'application/json' };

// ==================== Clinics ====================

async function fetchClinicById(clinicId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/clinics/${clinicId}`, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    console.error('❌ Error fetching clinic:', error.response?.data || error.message);
    return null;
  }
}

async function fetchServiceCategories(clinicId, visitType) {
  try {
    const response = await axios.get(`${API_BASE_URL}/clinics/${clinicId}/services`, {
      params: { visit_type: visitType }, headers
    });
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching service categories:', error.response?.data || error.message);
    return [];
  }
}

// ==================== Patients ====================

async function createPatientRecord(name, age, gender, phone) {
  try {
    const response = await axios.post(`${API_BASE_URL}/patients`, {
      name, age: parseInt(age), gender, phone
    }, { headers });
    console.log(`✅ Patient created — ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating patient:', error.response?.data || error.message);
    throw error;
  }
}

async function searchPatientByPhone(phone) {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/search`, {
      params: { phone }, headers
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

// ==================== Appointments ====================

async function fetchAppointmentsByPatient(patientId, limit = 10) {
  try {
    const response = await axios.get(`${API_BASE_URL}/appointments`, {
      params: { patient_id: patientId, limit }, headers
    });
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching appointments:', error.response?.data || error.message);
    return [];
  }
}

async function fetchProcedureBookingsByPatient(patientId, patientPhone = null) {
  try {
    const response = await axios.get(`${API_BASE_URL}/procedures`, {
      params: { patient_id: patientId }, headers
    });
    const byPatientId = response.data || [];
    if (byPatientId.length > 0 || !patientPhone) {
      return byPatientId;
    }

    const fallback = await axios.get(`${API_BASE_URL}/procedures`, {
      params: { patient_phone: patientPhone }, headers
    });
    return fallback.data || [];
  } catch (error) {
    console.error('❌ Error fetching procedure bookings:', error.response?.data || error.message);
    return [];
  }
}

// ==================== Doctors & Scheduling ====================

async function fetchDoctors(specialty, clinicId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors`, {
      params: { specialty, clinic_id: clinicId }, headers
    });
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching doctors:', error.response?.data || error.message);
    return [];
  }
}

async function fetchDoctorAvailability(doctorId, date) {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}/availability`, {
      params: { date }, headers
    });
    return response.data;
  } catch (error) {
    return { is_present: true };
  }
}

async function fetchDoctorAppointmentsForDate(doctorId, date) {
  try {
    const response = await axios.get(`${API_BASE_URL}/appointments/doctors/${doctorId}/appointments`, {
      params: { date }, headers
    });
    return response.data || [];
  } catch (error) {
    return [];
  }
}

async function fetchDoctorSlotAvailability(doctorId, visitType = 'consultation', days = 14) {
  try {
    const response = await axios.get(`${API_BASE_URL}/appointments/doctors/${doctorId}/availability`, {
      params: { visit_type: visitType, days }, headers
    });
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching slot availability:', error.response?.data || error.message);
    return [];
  }
}

async function createProcedureBooking(clinicId, patientId, preferredDate, preferredSlot, intakeData = {}, subCategory = null) {
  try {
    const response = await axios.post(`${API_BASE_URL}/procedures`, {
      clinic_id: clinicId,
      patient_id: patientId,
      sub_category: subCategory,
      preferred_date: preferredDate,
      preferred_slot: preferredSlot,
      intake_data: intakeData ? JSON.stringify(intakeData) : undefined,
    }, { headers });
    console.log(`✅ Procedure booking created — ID: ${response.data.id || 'N/A'}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating procedure booking:', error.response?.data || error.message);
    throw error;
  }
}

async function createAppointment(patientId, doctorId, date, timeSlot, idempotencyKey, options = {}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/appointments`, {
      patient_id: patientId, doctor_id: doctorId,
      date, time_slot: timeSlot,
      slot_label: options.slotLabel,
      visit_type: options.visitType || 'consultation',
      intake_data: options.intakeData ? JSON.stringify(options.intakeData) : undefined,
      idempotency_key: idempotencyKey || `${patientId}-${doctorId}-${date}-${Date.now()}`
    }, { headers });
    console.log(`✅ Appointment created — ID: ${response.data.id || 'N/A'}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating appointment:', error.response?.data || error.message);
    throw error;
  }
}

// ==================== Queries ====================

async function logGeneralQuery(queryData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/queries`, queryData, { headers });
    return response.data;
  } catch (error) {
    console.log('📝 Query logged locally (backend not available):', queryData);
    return { id: 'local-' + Date.now(), ...queryData };
  }
}

module.exports = {
  fetchClinicById,
  fetchServiceCategories,
  createPatientRecord,
  searchPatientByPhone,
  fetchAppointmentsByPatient,
  fetchProcedureBookingsByPatient,
  fetchDoctors,
  fetchDoctorAvailability,
  fetchDoctorAppointmentsForDate,
  fetchDoctorSlotAvailability,
  createAppointment,
  createProcedureBooking,
  logGeneralQuery
};
