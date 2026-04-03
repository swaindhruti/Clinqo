const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Fetch list of doctors from API
 * @returns {Promise<Array>} - Array of doctor objects
 */
async function fetchDoctors() {
  try {
    const DOCTORS_API_URL = process.env.DOCTORS_API_URL || 'https://unhawked-jamarion-noncleistogamous.ngrok-free.dev/api/v1/doctors';
    
    console.log(`👨‍⚕️ Fetching doctors list...`);
    
    const response = await axios.get(DOCTORS_API_URL, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Found ${response.data.length} doctors`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching doctors:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { fetchDoctors };
