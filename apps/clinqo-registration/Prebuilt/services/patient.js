const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Create patient record via API
 * @param {string} name - Patient name
 * @param {string|number} age - Patient age
 * @param {string} gender - Patient gender
 * @param {string} phone - Patient phone (wa_id)
 * @returns {Promise<string|number>} - Created patient ID
 */
async function createPatientRecord(name, age, gender, phone) {
  try {
    const PATIENT_API_URL = process.env.PATIENT_API_URL || 'https://unhawked-jamarion-noncleistogamous.ngrok-free.dev/api/v1/patients';
    
    console.log(`🏥 Creating patient record for: ${name}`);
    
    const response = await axios.post(PATIENT_API_URL, {
      name: name,
      age: parseInt(age),
      gender: gender,
      phone: phone
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const patientId = response.data.id;
    console.log(`✅ Patient created successfully`);
    console.log(`   Patient ID: ${patientId}`);
    console.log(`   Name: ${response.data.name}`);
    
    return patientId;
  } catch (error) {
    console.error('❌ Error creating patient record:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { createPatientRecord };
