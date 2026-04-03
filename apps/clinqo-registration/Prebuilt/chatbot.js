const dotenv = require('dotenv');
const redisClient = require('./redis-config');

// Import from service modules
const { sendWhatsAppMessage } = require('./services/whatsapp');
const {
  acquireUserLock,
  releaseUserLock,
  isMessageProcessed,
  markMessageProcessed,
  getSession,
  createSession,
  updateSessionState,
  getCollectedInfo,
  updateCollectedInfo,
  clearUserData
} = require('./services/session');
const { createPatientRecord } = require('./services/patient');
const { fetchDoctors } = require('./services/doctor');
const { createAppointment } = require('./services/appointment');
const { NEXT_STATE, STATE_MESSAGES, enqueueSession, startQueueProcessor, processQueuedSession } = require('./services/queue');
const { extractAppointmentFields, generateFollowUpQuestion, validateDate, validateTime } = require('./gemini-ai');

dotenv.config();

/**
 * Process incoming message from WhatsApp webhook.
 * Uses per-user distributed locking to prevent race conditions
 * when the same user sends multiple rapid messages.
 * 
 * @param {Object} messageData - Webhook message payload
 * @returns {Promise<Object>} - Processing result
 */
async function processIncomingMessage(messageData) {
  const waId = messageData.from;
  const messageId = messageData.id;
  const messageText = (messageData.text?.body || '').toLowerCase().trim();

  console.log(`📨 Received message from ${waId}: "${messageText}"`);

  // ── Step 1: Duplicate check (before acquiring lock for speed) ──
  try {
    if (await isMessageProcessed(waId, messageId)) {
      console.log(`⚠️  Duplicate message from ${waId}. Rejecting.`);
      return { status: 'duplicate', message: 'Message already processed' };
    }
  } catch (error) {
    console.error('Error checking duplicate:', error);
    throw error;
  }

  // ── Step 2: Acquire per-user lock ──
  const lockAcquired = await acquireUserLock(waId);
  if (!lockAcquired) {
    console.log(`🔒 User ${waId} is locked (another message is being processed). Waiting...`);
    // Retry a few times with small delays
    let retries = 5;
    let acquired = false;
    while (retries > 0 && !acquired) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      acquired = await acquireUserLock(waId);
      retries--;
    }
    if (!acquired) {
      console.log(`⏳ User ${waId} lock timeout. Asking to retry.`);
      await sendWhatsAppMessage(waId, 'I\'m still processing your previous message. Please wait a moment and try again.');
      return { status: 'locked', message: 'User locked, retry later' };
    }
  }

  // ── Step 3: Process the message (with lock held) ──
  try {
    // Mark message as processed now that we have the lock
    await markMessageProcessed(waId, messageId);

    // Check for "end" command
    if (messageText === 'end') {
      console.log(`🛑 User ${waId} is ending the appointment`);
      await sendWhatsAppMessage(waId, 'Your ongoing appointment ended. 👋\n\nSend any message to start again.');
      await clearUserData(waId);
      return { status: 'appointment_ended', message: 'Appointment terminated by user' };
    }

    // Check for existing session
    let session = await getSession(waId);

    if (!session) {
      return await handleNewUser(waId);
    } else {
      return await handleExistingSession(waId, session, messageText);
    }
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  } finally {
    // ── Always release the lock ──
    await releaseUserLock(waId);
  }
}

/**
 * Handle a brand new user (no session exists)
 */
async function handleNewUser(waId) {
  console.log(`✨ New user detected: ${waId}`);

  const session = await createSession(waId);
  await updateCollectedInfo(waId, 'name', ''); // Initialize empty collected info

  // Send welcome message
  await sendWhatsAppMessage(waId, 'Welcome to Clinqo! 👋\n\nLet\'s collect your information for the appointment.');

  // Send first state message
  await sendWhatsAppMessage(waId, STATE_MESSAGES.NAME);

  // Enqueue for processing
  await enqueueSession(waId);

  return { status: 'new_user', session };
}

/**
 * Handle an existing session – route to the correct state handler
 */
async function handleExistingSession(waId, session, messageText) {
  console.log(`👤 Existing user: ${waId}. Current state: ${session.state}`);

  const currentState = session.state;

  if (currentState === 'COMPLETE') {
    await sendWhatsAppMessage(waId, 'Your appointment information has been recorded. Thank you!');
    return { status: 'session_complete', message: 'User data complete' };
  }

  // Route to the appropriate state handler
  switch (currentState) {
    case 'PATIENT_CREATION':
      return await handlePatientCreation(waId, session);
    case 'DOCTOR':
      return await handleDoctorSelection(waId, session);
    case 'NATURAL_LANGUAGE':
      return await handleNaturalLanguage(waId, session, messageText);
    case 'DOCTOR_ID':
      return await handleDoctorId(waId, session, messageText);
    default:
      return await handleFieldCollection(waId, session, currentState, messageText);
  }
}

/**
 * Handle PATIENT_CREATION state – create patient record via API
 */
async function handlePatientCreation(waId, session) {
  console.log(`\n🔄 Processing PATIENT_CREATION state...`);
  const collectedInfo = await getCollectedInfo(waId);
  
  try {
    const patientId = await createPatientRecord(
      collectedInfo.name,
      collectedInfo.age,
      collectedInfo.sex,
      waId
    );
    
    await updateCollectedInfo(waId, 'patient_id', patientId);
    console.log(`✅ Patient record created and stored`);
    
    const nextState = NEXT_STATE['PATIENT_CREATION'];
    await updateSessionState(waId, nextState);
    
    console.log(`📤 Moving to ${nextState} state - will be processed in queue`);
    await enqueueSession(waId);
    
    return { status: 'patient_created', patientId, session, collected: await getCollectedInfo(waId) };
  } catch (error) {
    console.error('❌ Failed to create patient:', error);
    await sendWhatsAppMessage(waId, 'Sorry, there was an error processing your information. Please try again by sending "end" and starting over.');
    await clearUserData(waId);
    throw error;
  }
}

/**
 * Handle DOCTOR state – fetch doctors list and show to user
 */
async function handleDoctorSelection(waId, session) {
  console.log(`\n👨‍⚕️ Processing DOCTOR state - fetching doctor list...`);
  
  try {
    const doctors = await fetchDoctors();
    
    let doctorsMessage = "Please select a doctor by entering the serial number:\n\n";
    doctors.forEach((doctor, index) => {
      doctorsMessage += `${index + 1}. ${doctor.name} - ${doctor.specialty}\n`;
    });
    
    await sendWhatsAppMessage(waId, doctorsMessage);
    
    await updateCollectedInfo(waId, 'doctors_list', JSON.stringify(doctors));
    
    const nextState = NEXT_STATE['DOCTOR'];
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

/**
 * Handle NATURAL_LANGUAGE state – process free-text input with Gemini AI
 */
async function handleNaturalLanguage(waId, session, messageText) {
  console.log(`\n🤖 Processing NATURAL_LANGUAGE state with Gemini AI...`);
  
  try {
    const collectedInfo = await getCollectedInfo(waId);
    const doctors = JSON.parse(collectedInfo.doctors_list || '[]');
    
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
      const followUpMessage = generateFollowUpQuestion(stillMissing, doctors);
      await sendWhatsAppMessage(waId, followUpMessage);
      return { status: 'partial_info', missing: stillMissing, session, collected: updatedInfo };
    } else {
      return await finalizeAppointment(waId, updatedInfo);
    }
  } catch (error) {
    console.error('❌ Failed to process natural language:', error);
    await sendWhatsAppMessage(waId, 'Sorry, I had trouble understanding that. Could you try again or provide details step by step?');
    throw error;
  }
}

/**
 * Handle DOCTOR_ID state – process numeric doctor selection
 */
async function handleDoctorId(waId, session, messageText) {
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
    
    await updateCollectedInfo(waId, 'doctor', selectedDoctor.name);
    await updateCollectedInfo(waId, 'doctor_id', selectedDoctor.id);
    
    console.log(`✅ Doctor selected: ${selectedDoctor.name} (ID: ${selectedDoctor.id})`);
    
    const nextState = NEXT_STATE['DOCTOR_ID'];
    await updateSessionState(waId, nextState);
    
    await sendWhatsAppMessage(waId, STATE_MESSAGES[nextState]);
    await enqueueSession(waId);
    
    return { status: 'doctor_selected', selectedDoctor, session, collected: await getCollectedInfo(waId) };
  } catch (error) {
    console.error('❌ Failed to process doctor selection:', error);
    await sendWhatsAppMessage(waId, 'Sorry, there was an error processing your selection. Please try again.');
    throw error;
  }
}

/**
 * Handle generic field collection states (NAME, AGE, SEX, DATE, HOUR)
 */
async function handleFieldCollection(waId, session, currentState, messageText) {
  const stateFieldMap = {
    NAME: 'name',
    AGE: 'age',
    SEX: 'sex',
    DOCTOR: 'doctor',
    DATE: 'date',
    HOUR: 'hour'
  };

  const field = stateFieldMap[currentState];
  const collectedInfo = await updateCollectedInfo(waId, field, messageText);

  console.log(`✏️  Updated ${field} to: ${messageText}`);
  console.log(`📊 Collected info:`, collectedInfo);

  const nextState = NEXT_STATE[currentState];
  await updateSessionState(waId, nextState);

  if (nextState === 'COMPLETE') {
    const finalInfo = await getCollectedInfo(waId);
    console.log(`✅ All information collected:`, finalInfo);
    return await finalizeAppointment(waId, finalInfo);
  } else if (nextState !== 'PATIENT_CREATION' && nextState !== 'DOCTOR') {
    // Send next state message (but not for PATIENT_CREATION, DOCTOR as they have special handling)
    await sendWhatsAppMessage(waId, STATE_MESSAGES[nextState]);
  }

  await enqueueSession(waId);
  return { status: 'session_ongoing', session, collected: await getCollectedInfo(waId) };
}

/**
 * Finalize and book the appointment, then send confirmation with QR code
 */
async function finalizeAppointment(waId, info) {
  await updateSessionState(waId, 'COMPLETE');

  try {
    const appointment = await createAppointment(
      info.patient_id,
      info.doctor_id,
      info.date,
      info.hour
    );
    
    console.log(`✅ Appointment booked successfully!`);
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${appointment.check_in_code}`;
    
    await sendWhatsAppMessage(waId, `Thank you! Your appointment has been confirmed! 🎉\n\nAppointment Details:\n📝 Name: ${info.name}\n🎂 Age: ${info.age}\n👤 Gender: ${info.sex}\n🆔 Patient ID: ${info.patient_id}\n👨‍⚕️ Doctor: ${info.doctor}\n📅 Date: ${info.date}\n⏰ Time: ${info.hour}\n\n🔑 Check-in Code: *${appointment.check_in_code}*\n\nShow this QR code at the front desk to check in:\n${qrCodeUrl}`);
    
    // Clear user data after successful appointment completion
    console.log(`\n🧹 Clearing all data for completed appointment...`);
    await clearUserData(waId);
    
    return { status: 'appointment_booked', appointment, finalInfo: info };
  } catch (error) {
    console.error('❌ Failed to book appointment:', error);
    await sendWhatsAppMessage(waId, 'Sorry, there was an error booking your appointment. Please contact support.');
    throw error;
  }
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
