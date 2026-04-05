/**
 * handlers/patient.js - Patient registration and history handlers
 */
const { sendWhatsAppMessage, sendWhatsAppButtons } = require('../services/whatsapp');
const { createPatientRecord, searchPatientByPhone } = require('../services/api');
const { saveSession, clearUserData } = require('../services/session');
const { getMessage } = require('../i18n');

async function sendVisitTypeMenu(waId, lang) {
  try {
    await sendWhatsAppButtons(
      waId,
      getMessage(lang, 'visit_type_prompt'),
      [
        { id: '1', title: '🩺 Consultation' },
        { id: '2', title: '💉 Procedure' },
        { id: '3', title: '❓ General Query' },
      ]
    );
  } catch (_err) {
    await sendWhatsAppMessage(waId, getMessage(lang, 'visit_type_prompt'));
  }
}

async function handlePatientCreation(waId, session, lang) {
  try {
    const patient = await createPatientRecord(session.name, session.age, session.sex, waId);
    session.patient_id = patient.id;
    session.state = 'VISIT_TYPE_SELECT';
    await saveSession(waId, session);
    await sendWhatsAppMessage(waId, getMessage(lang, 'patient_created', { patient_id: patient.id }));
    await sendVisitTypeMenu(waId, lang);
  } catch (error) {
    console.error('❌ Patient creation failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
    await clearUserData(waId);
  }
}

async function handleRepeatPatientLookup(waId, session, lang) {
  try {
    const patient = await searchPatientByPhone(waId);
    if (!patient) {
      await sendWhatsAppMessage(waId, getMessage(lang, 'patient_not_found'));
      session.patient_type = 'new';
      session.state = 'NAME';
      await saveSession(waId, session);
      await sendWhatsAppMessage(waId, getMessage(lang, 'ask_name'));
      return;
    }
    session.patient_id = patient.id;
    session.name = patient.name;
    session.age = patient.age ? String(patient.age) : '';
    session.sex = patient.gender || '';
    // Go directly to visit type selection (clinic already set from QR)
    session.state = 'VISIT_TYPE_SELECT';
    await saveSession(waId, session);
    await sendWhatsAppMessage(waId, getMessage(lang, 'welcome_back', { name: patient.name }));
    await sendVisitTypeMenu(waId, lang);
  } catch (error) {
    console.error('❌ Patient lookup failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

module.exports = { handlePatientCreation, handleRepeatPatientLookup };
