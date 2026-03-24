const axios = require('axios');
const dotenv = require('dotenv');
const redisClient = require('./redis-config');
const { extractAppointmentFields, generateFollowUpQuestion, validateDate, validateTime } = require('./gemini-ai');

dotenv.config();

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '248402908354623';
const ACCESS_TOKEN = process.env.APP_SECRET;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

// Default template for new users
const DEFAULT_COLLECTED_INFO = {
  name: '',
  age: '',
  sex: '',
  patient_id: '',
  doctor: '',
  doctor_id: '',
  date: '',
  hour: ''
};

// State machine configuration
const STATE_MESSAGES = {
  NAME: "Please enter your name:",
  AGE: "Please enter your age:",
  SEX: "Please enter your sex (Male/Female/Other):",
  DOCTOR: "Please select your doctor:\n1. Sandeep Das\n2. Dr. Smith",
  NATURAL_LANGUAGE: "Now you can tell me your appointment details in your own words. For example:\n\n'I want an appointment with Dr. Sandeep tomorrow at 2pm'\n\nOr you can provide details step by step.",
  DATE: "Please enter appointment date (YYYY-MM-DD):",
  HOUR: "Please enter appointment time (HH:MM):"
};

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

/**
 * Send message via WhatsApp API
 */
async function sendWhatsAppMessage(to, messageBody) {
  try {
    const response = await axios.post(WHATSAPP_API_URL, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    console.log(`✅ Message sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create patient record via API
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

/**
 * Fetch list of doctors from API
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

/**
 * Create appointment booking
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

/**
 * Check if message is already processed (duplicate check)
 */
async function isMessageProcessed(waId, messageId) {
  const key = `processed:${waId}:${messageId}`;
  const exists = await redisClient.exists(key);
  return exists === 1;
}

/**
 * Mark message as processed
 */
async function markMessageProcessed(waId, messageId) {
  const key = `processed:${waId}:${messageId}`;
  await redisClient.setEx(key, 86400, '1'); // Expire after 24 hours
}

/**
 * Check if user session exists
 */
async function getSession(waId) {
  const sessionKey = `session:${waId}`;
  const sessionData = await redisClient.get(sessionKey);
  return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * Create new session for user
 */
async function createSession(waId) {
  const sessionKey = `session:${waId}`;
  const session = {
    wa_id: waId,
    state: 'NAME',
    created_at: new Date().toISOString()
  };
  await redisClient.setEx(sessionKey, 86400 * 7, JSON.stringify(session)); // 7 days
  return session;
}

/**
 * Update session state
 */
async function updateSessionState(waId, newState) {
  const sessionKey = `session:${waId}`;
  const session = await getSession(waId);
  if (session) {
    session.state = newState;
    session.updated_at = new Date().toISOString();
    await redisClient.setEx(sessionKey, 86400 * 7, JSON.stringify(session));
  }
  return session;
}

/**
 * Get collected info for user
 */
async function getCollectedInfo(waId) {
  const collectedKey = `collected:${waId}`;
  const data = await redisClient.get(collectedKey);
  return data ? JSON.parse(data) : { ...DEFAULT_COLLECTED_INFO };
}

/**
 * Update collected info
 */
async function updateCollectedInfo(waId, field, value) {
  const collectedKey = `collected:${waId}`;
  const collected = await getCollectedInfo(waId);
  collected[field] = value;
  collected.last_updated = new Date().toISOString();
  await redisClient.setEx(collectedKey, 86400 * 7, JSON.stringify(collected));
  return collected;
}

/**
 * Enqueue session for processing
 */
async function enqueueSession(waId) {
  const session = await getSession(waId);
  if (session) {
    await redisClient.rPush('session_queue', JSON.stringify(session));
    console.log(`📤 Session enqueued for ${waId} with state: ${session.state}`);
  }
}

/**
 * Clear all user data from Redis (delete user session, collected info, and processed messages)
 */
async function clearUserData(waId) {
  try {
    const sessionKey = `session:${waId}`;
    const collectedKey = `collected:${waId}`;
    
    // Delete session
    await redisClient.del(sessionKey);
    console.log(`🗑️  Deleted session for ${waId}`);
    
    // Delete collected info
    await redisClient.del(collectedKey);
    console.log(`🗑️  Deleted collected info for ${waId}`);
    
    // Delete all processed messages for this user
    const processedKeys = await redisClient.keys(`processed:${waId}:*`);
    if (processedKeys.length > 0) {
      await redisClient.del(processedKeys);
      console.log(`🗑️  Deleted ${processedKeys.length} processed message records for ${waId}`);
    }
    
    console.log(`✅ All user data cleared for ${waId}\n`);
  } catch (error) {
    console.error(`❌ Error clearing user data for ${waId}:`, error);
  }
}

/**
 * Process incoming message
 */
async function processIncomingMessage(messageData) {
  try {
    // Extract wa_id and message_id from webhook
    const waId = messageData.from;
    const messageId = messageData.id;
    const messageText = (messageData.text?.body || '').toLowerCase().trim();

    console.log(`📨 Received message from ${waId}: "${messageText}"`);

    // Check for duplicate message
    if (await isMessageProcessed(waId, messageId)) {
      console.log(`⚠️  Duplicate message from ${waId}. Rejecting.`);
      return { status: 'duplicate', message: 'Message already processed' };
    }

    // Mark message as processed
    await markMessageProcessed(waId, messageId);

    // Check if user sends "end" command to terminate appointment
    if (messageText === 'end') {
      console.log(`🛑 User ${waId} is ending the appointment`);
      await sendWhatsAppMessage(waId, 'Your ongoing appointment ended. 👋\n\nSend any message to start again.');
      await clearUserData(waId);
      return { status: 'appointment_ended', message: 'Appointment terminated by user' };
    }

    // Check if user has existing session
    let session = await getSession(waId);

    if (!session) {
      // NEW USER - Create entries in all 3 tables
      console.log(`✨ New user detected: ${waId}`);

      session = await createSession(waId);
      await updateCollectedInfo(waId, 'name', ''); // Initialize empty collected info

      // Send welcome message
      await sendWhatsAppMessage(waId, 'Welcome to Clinqo! 👋\n\nLet\'s collect your information for the appointment.');

      // Send first state message
      await sendWhatsAppMessage(waId, STATE_MESSAGES.NAME);

      // Enqueue for processing
      await enqueueSession(waId);

      return { status: 'new_user', session };
    } else {
      // EXISTING SESSION
      console.log(`👤 Existing user: ${waId}. Current state: ${session.state}`);

      const currentState = session.state;
      const stateFieldMap = {
        NAME: 'name',
        AGE: 'age',
        SEX: 'sex',
        DOCTOR: 'doctor',
        DATE: 'date',
        HOUR: 'hour'
      };

      if (currentState === 'COMPLETE') {
        await sendWhatsAppMessage(waId, 'Your appointment information has been recorded. Thank you!');
        return { status: 'session_complete', message: 'User data complete' };
      }

      // Handle PATIENT_CREATION state (internal, no WhatsApp message)
      if (currentState === 'PATIENT_CREATION') {
        console.log(`\n🔄 Processing PATIENT_CREATION state...`);
        const collectedInfo = await getCollectedInfo(waId);
        
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
          
          console.log(`✅ Patient record created and stored`);
          
          // Move to next state (DOCTOR)
          const nextState = NEXT_STATE[currentState];
          await updateSessionState(waId, nextState);
          
          // Don't send message here - let the DOCTOR state handle it through queue processing
          console.log(`📤 Moving to ${nextState} state - will be processed in queue`);
          
          // Enqueue for processing
          await enqueueSession(waId);
          
          return { status: 'patient_created', patientId, session, collected: await getCollectedInfo(waId) };
        } catch (error) {
          console.error('❌ Failed to create patient:', error);
          await sendWhatsAppMessage(waId, 'Sorry, there was an error processing your information. Please try again by sending "end" and starting over.');
          await clearUserData(waId);
          throw error;
        }
      }

      // Handle DOCTOR state - fetch doctors and show list
      if (currentState === 'DOCTOR') {
        console.log(`\n👨‍⚕️ Processing DOCTOR state - fetching doctor list...`);
        
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
          const nextState = NEXT_STATE[currentState];
          await updateSessionState(waId, nextState);
          
          await enqueueSession(waId);
          
          return { status: 'doctors_fetched', doctors, session, collected: await getCollectedInfo(waId) };
        } catch (error) {
          console.error('❌ Failed to fetch doctors:', error);
          await sendWhatsAppMessage(waId, 'Sorry, there was an error fetching doctors. Please try again by sending "end" and starting over.');
          await clearUserData(waId);
          throw error;
        }
      }

      // Handle NATURAL_LANGUAGE state - process natural language input with Gemini AI
      if (currentState === 'NATURAL_LANGUAGE') {
        console.log(`\n🤖 Processing NATURAL_LANGUAGE state with Gemini AI...`);
        
        try {
          const collectedInfo = await getCollectedInfo(waId);
          const doctors = JSON.parse(collectedInfo.doctors_list || '[]');
          
          // Extract fields using Gemini AI
          const aiResult = await extractAppointmentFields(messageText, collectedInfo, doctors);
          
          if (!aiResult.success) {
            await sendWhatsAppMessage(waId, aiResult.extracted.natural_response);
            return { status: 'ai_error', session };
          }
          
          const extracted = aiResult.extracted;
          console.log(`🧠 AI Extracted:`, extracted);
          
          // Update fields that were extracted
          if (extracted.doctor && extracted.doctor_id) {
            await updateCollectedInfo(waId, 'doctor', extracted.doctor);
            await updateCollectedInfo(waId, 'doctor_id', extracted.doctor_id);
            console.log(`✅ Updated doctor: ${extracted.doctor} (ID: ${extracted.doctor_id})`);
          }
          
          if (extracted.date) {
            const dateValidation = validateDate(extracted.date);
            if (dateValidation.valid) {
              await updateCollectedInfo(waId, 'date', dateValidation.formatted);
              console.log(`✅ Updated date: ${dateValidation.formatted}`);
            } else {
              await sendWhatsAppMessage(waId, dateValidation.message);
              return { status: 'invalid_date', session };
            }
          }
          
          if (extracted.hour) {
            const timeValidation = validateTime(extracted.hour);
            if (timeValidation.valid) {
              await updateCollectedInfo(waId, 'hour', timeValidation.formatted);
              console.log(`✅ Updated hour: ${timeValidation.formatted}`);
            } else {
              await sendWhatsAppMessage(waId, timeValidation.message);
              return { status: 'invalid_time', session };
            }
          }
          
          // Check if all required fields are filled
          const updatedInfo = await getCollectedInfo(waId);
          const requiredFields = ['doctor_id', 'date', 'hour'];
          const stillMissing = requiredFields.filter(field => !updatedInfo[field] || updatedInfo[field] === '');
          
          if (stillMissing.length > 0) {
            // Still have missing fields - ask for them
            const followUpMessage = generateFollowUpQuestion(stillMissing, doctors);
            await sendWhatsAppMessage(waId, followUpMessage);
            
            return { status: 'partial_info', missing: stillMissing, session, collected: updatedInfo };
          } else {
            // All fields collected - move to COMPLETE
            await updateSessionState(waId, 'COMPLETE');
            
            // Book the appointment
            try {
              const appointment = await createAppointment(
                updatedInfo.patient_id,
                updatedInfo.doctor_id,
                updatedInfo.date,
                updatedInfo.hour
              );
              
              console.log(`✅ Appointment booked successfully!`);
              
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${appointment.check_in_code}`;
              
              await sendWhatsAppMessage(waId, `Thank you! Your appointment has been confirmed! 🎉\n\nAppointment Details:\n📝 Name: ${updatedInfo.name}\n🎂 Age: ${updatedInfo.age}\n👤 Gender: ${updatedInfo.sex}\n🆔 Patient ID: ${updatedInfo.patient_id}\n👨‍⚕️ Doctor: ${updatedInfo.doctor}\n📅 Date: ${updatedInfo.date}\n⏰ Time: ${updatedInfo.hour}\n\n🔑 Check-in Code: *${appointment.check_in_code}*\n\nShow this QR code at the front desk to check in:\n${qrCodeUrl}`);
              
              // Clear user data after successful appointment completion
              console.log(`\n🧹 Clearing all data for completed appointment...`);
              await clearUserData(waId);
              
              return { status: 'appointment_booked', appointment, finalInfo: updatedInfo };
            } catch (error) {
              console.error('❌ Failed to book appointment:', error);
              await sendWhatsAppMessage(waId, 'Sorry, there was an error booking your appointment. Please contact support.');
              throw error;
            }
          }
        } catch (error) {
          console.error('❌ Failed to process natural language:', error);
          await sendWhatsAppMessage(waId, 'Sorry, I had trouble understanding that. Could you try again or provide details step by step?');
          throw error;
        }
      }

      // Handle DOCTOR_ID state - process doctor selection
      if (currentState === 'DOCTOR_ID') {
        console.log(`\n🆔 Processing DOCTOR_ID state - processing doctor selection...`);
        
        try {
          const doctorSelection = parseInt(messageText.trim());
          const collectedInfo = await getCollectedInfo(waId);
          const doctors = JSON.parse(collectedInfo.doctors_list || '[]');
          
          if (isNaN(doctorSelection) || doctorSelection < 1 || doctorSelection > doctors.length) {
            await sendWhatsAppMessage(waId, `Invalid selection. Please enter a number between 1 and ${doctors.length}.`);
            return { status: 'invalid_doctor_selection', session };
          }
          
          const selectedDoctor = doctors[doctorSelection - 1];
          
          // Store doctor name and doctor_id
          await updateCollectedInfo(waId, 'doctor', selectedDoctor.name);
          await updateCollectedInfo(waId, 'doctor_id', selectedDoctor.id);
          
          console.log(`✅ Doctor selected: ${selectedDoctor.name} (ID: ${selectedDoctor.id})`);
          
          // Move to next state
          const nextState = NEXT_STATE[currentState];
          await updateSessionState(waId, nextState);
          
          // Send next state message
          await sendWhatsAppMessage(waId, STATE_MESSAGES[nextState]);
          
          await enqueueSession(waId);
          
          return { status: 'doctor_selected', selectedDoctor, session, collected: await getCollectedInfo(waId) };
        } catch (error) {
          console.error('❌ Failed to process doctor selection:', error);
          await sendWhatsAppMessage(waId, 'Sorry, there was an error processing your selection. Please try again.');
          throw error;
        }
      }

      // Update collected info with user's response
      const field = stateFieldMap[currentState];
      const collectedInfo = await updateCollectedInfo(waId, field, messageText);

      console.log(`✏️  Updated ${field} to: ${messageText}`);
      console.log(`📊 Collected info:`, collectedInfo);

      // Move to next state
      const nextState = NEXT_STATE[currentState];
      await updateSessionState(waId, nextState);

      if (nextState === 'COMPLETE') {
        // All information collected - book the appointment
        const finalInfo = await getCollectedInfo(waId);
        console.log(`✅ All information collected:`, finalInfo);
        
        try {
          // Create the appointment
          const appointment = await createAppointment(
            finalInfo.patient_id,
            finalInfo.doctor_id,
            finalInfo.date,
            finalInfo.hour
          );
          
          console.log(`✅ Appointment booked successfully!`);
          
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${appointment.check_in_code}`;
          
          await sendWhatsAppMessage(waId, `Thank you! Your appointment has been confirmed! 🎉\n\nAppointment Details:\n📝 Name: ${finalInfo.name}\n🎂 Age: ${finalInfo.age}\n👤 Gender: ${finalInfo.sex}\n🆔 Patient ID: ${finalInfo.patient_id}\n👨‍⚕️ Doctor: ${finalInfo.doctor}\n📅 Date: ${finalInfo.date}\n⏰ Time: ${finalInfo.hour}\n\n🔑 Check-in Code: *${appointment.check_in_code}*\n\nShow this QR code at the front desk to check in:\n${qrCodeUrl}`);
          
          // Clear user data after successful appointment completion
          console.log(`\n🧹 Clearing all data for completed appointment...`);
          await clearUserData(waId);
          
          return { status: 'appointment_booked', appointment, finalInfo };
        } catch (error) {
          console.error('❌ Failed to book appointment:', error);
          await sendWhatsAppMessage(waId, 'Sorry, there was an error booking your appointment. Please contact support.');
          throw error;
        }
      } else if (nextState !== 'PATIENT_CREATION' && nextState !== 'DOCTOR') {
        // Send next state message (but not for PATIENT_CREATION, DOCTOR as they have special handling)
        await sendWhatsAppMessage(waId, STATE_MESSAGES[nextState]);
      }

      // Enqueue for processing
      await enqueueSession(waId);

      return { status: 'session_ongoing', session, collected: await getCollectedInfo(waId) };
    }
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

/**
 * Dequeue and process session from queue
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
 * Start queue processor (runs continuously)
 */
function startQueueProcessor(intervalMs = 5000) {
  console.log('🚀 Starting queue processor...');
  setInterval(async () => {
    const result = await processQueuedSession();
    if (result) {
      console.log('Processing complete:', result);
    }
  }, intervalMs);
}

module.exports = {
  processIncomingMessage,
  sendWhatsAppMessage,
  createPatientRecord,
  fetchDoctors,
  createAppointment,
  getSession,
  getCollectedInfo,
  clearUserData,
  startQueueProcessor,
  processQueuedSession,
  redisClient
};
