const redisClient = require('../config/redis-config');
const { sendWhatsAppMessage } = require('./whatsapp');
const { getSession, getCollectedInfo, updateCollectedInfo, updateSessionState, clearUserData } = require('./session');
const { createPatientRecord, fetchDoctors } = require('./api');

// State machine transitions
const NEXT_STATE = {
  NAME: 'AGE',
  AGE: 'SEX',
  SEX: 'PATIENT_CREATION',
  PATIENT_CREATION: 'DOCTOR',
  DOCTOR: 'NATURAL_LANGUAGE',
  NATURAL_LANGUAGE: 'COMPLETE',
  DOCTOR_ID: 'DATE',
  DATE: 'HOUR',
  HOUR: 'COMPLETE'
};

const STATE_MESSAGES = {
  NAME: "Please enter your name:",
  AGE: "Please enter your age:",
  SEX: "Please enter your sex (Male/Female/Other):",
  DOCTOR: "Please select your doctor:\n1. Sandeep Das\n2. Dr. Smith",
  NATURAL_LANGUAGE: "Now you can tell me your appointment details in your own words. For example:\n\n'I want an appointment with Dr. Sandeep tomorrow at 2pm'\n\nOr you can provide details step by step.",
  DATE: "Please enter appointment date (YYYY-MM-DD):",
  HOUR: "Please enter appointment time (HH:MM):"
};

/**
 * Enqueue session for background processing
 * @param {string} waId - User's WhatsApp ID
 */
async function enqueueSession(waId) {
  const session = await getSession(waId);
  if (session) {
    await redisClient.rPush('session_queue', JSON.stringify(session));
    console.log(`📤 Session enqueued for ${waId} with state: ${session.state}`);
  }
}

/**
 * Process a single queued session from the Redis queue.
 * Handles PATIENT_CREATION and DOCTOR states that require background API calls.
 * @returns {Promise<Object|null>} - Processing result or null if queue empty
 */
async function processQueuedSession() {
  try {
    const sessionData = await redisClient.lPop('session_queue');
    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData);
    const waId = session.wa_id;
    const state = session.state;

    console.log(`\n📥 Processing queued session:`);
    console.log(`   WA ID: ${waId}`);
    console.log(`   State: ${state}`);

    const collectedInfo = await getCollectedInfo(waId);
    console.log(`   Collected Info:`, collectedInfo);

    // Handle PATIENT_CREATION state processing
    if (state === 'PATIENT_CREATION') {
      console.log(`\n🔄 Processing PATIENT_CREATION state in queue...`);
      
      try {
        // Create patient record with collected data
        const patientId = await createPatientRecord(
          collectedInfo.name,
          collectedInfo.age,
          collectedInfo.sex,
          waId
        );
        
        // Store patient_id in collected info
        await updateCollectedInfo(waId, 'patient_id', patientId);
        
        console.log(`✅ Patient record created and stored in queue processing`);
        
        // Move to next state (DOCTOR)
        const nextState = NEXT_STATE[state];
        await updateSessionState(waId, nextState);
        
        // Enqueue the session again for DOCTOR state processing
        await enqueueSession(waId);
        
        console.log(`📤 Moved to ${nextState} state - enqueued for doctor processing`);
        
        return { 
          session: { ...session, state: nextState }, 
          collectedInfo: await getCollectedInfo(waId),
          patientId 
        };
      } catch (error) {
        console.error('❌ Failed to create patient in queue processing:', error);
        await sendWhatsAppMessage(waId, 'Sorry, there was an error processing your information. Please try again by sending "end" and starting over.');
        await clearUserData(waId);
        throw error;
      }
    }

    // Handle DOCTOR state processing
    if (state === 'DOCTOR') {
      console.log(`\n👨‍⚕️ Processing DOCTOR state in queue...`);
      
      try {
        const doctors = await fetchDoctors();
        
        let doctorsMessage = "Please select a doctor by entering the serial number:\n\n";
        doctors.forEach((doctor, index) => {
          doctorsMessage += `${index + 1}. ${doctor.name} - ${doctor.specialty}\n`;
        });
        
        await sendWhatsAppMessage(waId, doctorsMessage);
        
        // Store the doctors list temporarily for the next state
        await updateCollectedInfo(waId, 'doctors_list', JSON.stringify(doctors));
        
        // Move to NATURAL_LANGUAGE state
        const nextState = NEXT_STATE[state];
        await updateSessionState(waId, nextState);
        
        // Send the natural language prompt
        await sendWhatsAppMessage(waId, STATE_MESSAGES.NATURAL_LANGUAGE);
        
        console.log(`📤 Moved to ${nextState} state and sent doctor list + NLP prompt`);
        
        return { 
          session: { ...session, state: nextState }, 
          collectedInfo: await getCollectedInfo(waId),
          doctors 
        };
      } catch (error) {
        console.error('❌ Failed to fetch doctors in queue processing:', error);
        await sendWhatsAppMessage(waId, 'Sorry, there was an error fetching doctors. Please try again by sending "end" and starting over.');
        await clearUserData(waId);
        throw error;
      }
    }

    return { session, collectedInfo };
  } catch (error) {
    console.error('Error processing queued session:', error);
    return null;
  }
}

/**
 * Start the queue processor.
 * Processes multiple queued sessions in parallel per tick for better throughput.
 * @param {number} intervalMs - Polling interval in milliseconds
 * @param {number} batchSize - Max sessions to process per tick
 */
function startQueueProcessor(intervalMs = 2000, batchSize = 10) {
  console.log(`🚀 Starting queue processor (interval: ${intervalMs}ms, batch: ${batchSize})...`);
  
  setInterval(async () => {
    try {
      // Pop up to batchSize items from the queue
      const tasks = [];
      for (let i = 0; i < batchSize; i++) {
        tasks.push(processQueuedSession());
      }
      
      const results = await Promise.allSettled(tasks);
      const processed = results.filter(r => r.status === 'fulfilled' && r.value !== null);
      
      if (processed.length > 0) {
        console.log(`📦 Batch processed ${processed.length} queued session(s)`);
      }
    } catch (error) {
      console.error('Error in queue processor batch:', error);
    }
  }, intervalMs);
}

module.exports = {
  NEXT_STATE,
  STATE_MESSAGES,
  enqueueSession,
  processQueuedSession,
  startQueueProcessor
};
