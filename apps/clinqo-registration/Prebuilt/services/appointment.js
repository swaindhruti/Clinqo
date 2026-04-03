const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Create appointment booking via API
 * @param {string|number} patientId - Patient ID
 * @param {string|number} doctorId - Doctor ID
 * @param {string} date - Appointment date (YYYY-MM-DD)
 * @param {string} timeStr - Appointment time (HH:MM)
 * @returns {Promise<Object>} - Created appointment object
 */
async function createAppointment(patientId, doctorId, date, timeStr) {
  try {
    const APPOINTMENTS_API_URL = process.env.APPOINTMENTS_API_URL || 'https://unhawked-jamarion-noncleistogamous.ngrok-free.dev/api/v1/appointments';
    
    console.log(`📅 Creating appointment...`);
    console.log(`   Patient ID: ${patientId}`);
    console.log(`   Doctor ID: ${doctorId}`);
    console.log(`   Date: ${date}`);
    console.log(`   Time: ${timeStr}`);
    
    // Parse time to get just the hour slot (e.g. "14:00" -> 14)
    const timeSlot = timeStr ? parseInt(timeStr.split(':')[0]) : null;
    
    const response = await axios.post(APPOINTMENTS_API_URL, {
      patient_id: patientId,
      doctor_id: doctorId,
      date: date,
      time_slot: timeSlot,
      idempotency_key: `${patientId}-${doctorId}-${date}-${Date.now()}`
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Appointment created successfully`);
    console.log(`   Appointment ID: ${response.data.id || 'N/A'}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating appointment:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { createAppointment };
