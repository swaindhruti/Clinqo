const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

/**
 * Extract appointment fields from natural language input using Gemini AI
 * @param {string} userMessage - The user's natural language message
 * @param {Object} collectedInfo - Already collected appointment information
 * @param {Array} doctors - List of available doctors
 * @returns {Promise<Object>} - Extracted fields and AI response
 */
async function extractAppointmentFields(userMessage, collectedInfo, doctors) {
  try {
    // Build the doctor list for the prompt
    const doctorList = doctors.map((doc, idx) => 
      `${idx + 1}. ${doc.name} (ID: ${doc.id}) - ${doc.specialty}`
    ).join('\n');

    const prompt = `You are an AI assistant helping to book medical appointments. Extract appointment details from the user's message.

Available Doctors:
${doctorList}

User's message: "${userMessage}"

Currently collected information:
- Patient ID: ${collectedInfo.patient_id || 'Not set'}
- Doctor: ${collectedInfo.doctor || 'Not set'}
- Doctor ID: ${collectedInfo.doctor_id || 'Not set'}
- Date: ${collectedInfo.date || 'Not set'}
- Hour: ${collectedInfo.hour || 'Not set'}

Task: Extract the following fields from the user's message. If a field is already collected and not mentioned again, keep the existing value. If the user mentions a new value, update it.

Rules:
1. For doctor: Match the doctor's name from the available doctors list (case-insensitive, partial match OK). Extract the doctor's name and ID.
2. For date: Convert relative dates like "tomorrow", "today", "next Monday" to YYYY-MM-DD format. Today is ${new Date().toISOString().split('T')[0]}.
3. For hour: Extract time in HH:MM format (24-hour). Convert "2pm" to "14:00", "10am" to "10:00", etc.
4. Only extract fields that are explicitly mentioned or can be inferred from the message.

Return a JSON object with this exact structure:
{
  "doctor": "Doctor's full name or null if not mentioned/found",
  "doctor_id": "Doctor's ID number or null if not mentioned/found",
  "date": "YYYY-MM-DD or null if not mentioned",
  "hour": "HH:MM or null if not mentioned",
  "confidence": {
    "doctor": 0.0 to 1.0,
    "date": 0.0 to 1.0,
    "hour": 0.0 to 1.0
  },
  "missing_fields": ["array", "of", "field", "names", "that", "are", "still", "missing"],
  "natural_response": "A friendly response asking for the next missing field or confirming what was understood"
}

Examples:
- "I want Dr. Smith tomorrow at 2pm" → doctor: "Dr. Smith", date: tomorrow's date, hour: "14:00"
- "Book with Sandeep Das" → doctor: "Sandeep Das", other fields null
- "Tomorrow at 10am" → date: tomorrow's date, hour: "10:00", doctor: null

Return ONLY valid JSON, no other text.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const responseText = result.text;
    
    console.log(`🤖 Gemini AI Response:`, responseText);
    
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      extracted: extractedData
    };
  } catch (error) {
    console.error('❌ Error calling Gemini AI:', error);
    return {
      success: false,
      error: error.message,
      extracted: {
        doctor: null,
        doctor_id: null,
        date: null,
        hour: null,
        confidence: { doctor: 0, date: 0, hour: 0 },
        missing_fields: ['doctor', 'date', 'hour'],
        natural_response: "Sorry, I couldn't understand that. Could you please provide your appointment details? For example: 'I want an appointment with Dr. Smith tomorrow at 2pm'"
      }
    };
  }
}

/**
 * Generate a follow-up question for missing fields
 * @param {Array} missingFields - Array of missing field names
 * @param {Array} doctors - List of available doctors
 * @returns {string} - Follow-up question
 */
function generateFollowUpQuestion(missingFields, doctors) {
  if (missingFields.length === 0) {
    return "Great! I have all the information needed. Let me confirm your appointment.";
  }

  const field = missingFields[0]; // Ask for the first missing field

  switch (field) {
    case 'doctor':
    case 'doctor_id':
      let doctorList = "Which doctor would you like to book with?\n\n";
      doctors.forEach((doc, idx) => {
        doctorList += `${idx + 1}. ${doc.name} - ${doc.specialty}\n`;
      });
      return doctorList;
    
    case 'date':
      return "What date would you like for your appointment? (You can say 'tomorrow', 'next Monday', or use YYYY-MM-DD format)";
    
    case 'hour':
      return "What time would you prefer? (e.g., '2pm', '14:00', '10:30am')";
    
    default:
      return `Please provide your ${field}.`;
  }
}

/**
 * Validate and format date
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Object} - Validation result
 */
function validateDate(dateStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, message: 'Invalid date format. Please use YYYY-MM-DD.' };
  }

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { valid: false, message: 'Date cannot be in the past.' };
  }

  return { valid: true, formatted: dateStr };
}

/**
 * Validate and format time
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {Object} - Validation result
 */
function validateTime(timeStr) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(timeStr)) {
    return { valid: false, message: 'Invalid time format. Please use HH:MM (e.g., 14:00 or 09:30).' };
  }

  return { valid: true, formatted: timeStr };
}

module.exports = {
  extractAppointmentFields,
  generateFollowUpQuestion,
  validateDate,
  validateTime
};
