/**
 * handlers/query.js - General Query and Procedure submission handlers
 */
const { sendWhatsAppMessage } = require('../services/whatsapp');
const { logGeneralQuery } = require('../services/api');
const { saveSession, clearUserData } = require('../services/session');
const { getMessage } = require('../i18n');

async function handleProcedureSubmit(waId, session, lang) {
  try {
    const concern = session.detail_answers?.concern || 'N/A';
    const details = getMessage(lang, 'procedure_confirm_details', {
      name: session.name, clinic: session.clinic_name || 'N/A',
      sub_category: session.sub_category_name || 'N/A',
      fee: session.fee || 'N/A', concern
    });
    await sendWhatsAppMessage(waId, getMessage(lang, 'procedure_confirmed', { details }));
    await logGeneralQuery({
      patient_phone: waId, patient_name: session.name,
      patient_id: session.patient_id || null, clinic_id: session.clinic_id || null,
      query_text: `[PROCEDURE REQUEST] ${session.sub_category_name} - ${concern}`,
      status: 'pending'
    });
    session.state = 'COMPLETE';
    await saveSession(waId, session);
    await clearUserData(waId);
  } catch (error) {
    console.error('❌ Procedure submit failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

async function handleQueryLogged(waId, session, lang) {
  try {
    await logGeneralQuery({
      patient_phone: waId, patient_name: session.name,
      patient_id: session.patient_id || null, clinic_id: session.clinic_id || null,
      query_text: session.query_text, status: 'pending'
    });
    await sendWhatsAppMessage(waId, getMessage(lang, 'query_auto_reply', {
      query: session.query_text, phone: waId, name: session.name || 'N/A'
    }));
    session.state = 'COMPLETE';
    await saveSession(waId, session);
    await clearUserData(waId);
  } catch (error) {
    console.error('❌ Query log failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

module.exports = { handleProcedureSubmit, handleQueryLogged };
