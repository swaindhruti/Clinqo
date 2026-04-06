/**
 * chatbot.js - Core state machine orchestrator (v6)
 * 
 * Entry: QR scan → clinic verified → booking flow
 *        "Hi" → menu (view upcoming/past appointments and procedures)
 */

const { sendWhatsAppMessage, sendWhatsAppButtons, sendWhatsAppList } = require('./services/whatsapp');
const {
  isMessageProcessed, markMessageProcessed,
  getSession, saveSession, createSession,
  clearUserData, resetBookingFields, redisClient
} = require('./services/session');
const { fetchClinicById, searchPatientByPhone, fetchAppointmentsByPatient, fetchProcedureBookingsByPatient } = require('./services/api');
const { handlePatientCreation, handleRepeatPatientLookup } = require('./handlers/patient');
const {
  handleShowSubCategories, sendDetailQuestion,
  handleShowDoctors, handleShowDates, handleShowSlots,
  sendConsultationConfirmation, sendProcedureConfirmation, handleBooking
} = require('./handlers/booking');
const { handleQueryLogged } = require('./handlers/query');

const { getMessage, getGender, getLanguageCode } = require('./i18n');
const { VISIT_TYPES, getVisitTypeByIndex, getDetailQuestions } = require('./visit-types');

// Regex to extract clinic ID from QR message: "... (clinic_id)"
const CLINIC_ID_REGEX = /\(([a-f0-9-]+)\)/i;

function parseIncomingMessageText(messageData) {
  if (messageData.interactive?.button_reply?.id) {
    return String(messageData.interactive.button_reply.id).trim();
  }
  if (messageData.interactive?.list_reply?.id) {
    return String(messageData.interactive.list_reply.id).trim();
  }
  if (messageData.button?.payload) {
    return String(messageData.button.payload).trim();
  }
  return (messageData.text?.body || '').trim();
}

async function sendMainMenu(waId, lang = 'en') {
  try {
    await sendWhatsAppList(
      waId,
      getMessage(lang, 'menu_prompt'),
      'Open menu',
      [{
        title: 'Main Menu',
        rows: [
          { id: '1', title: 'Upcoming appointments', description: 'View upcoming appointments' },
          { id: '2', title: 'Past appointments', description: 'View recent appointments' },
          { id: '3', title: 'Upcoming procedures', description: 'View upcoming procedures' },
          { id: '4', title: 'Past procedures', description: 'View recent procedures' },
        ]
      }],
    );
  } catch (_err) {
    await sendWhatsAppMessage(waId, getMessage(lang, 'menu_prompt'));
  }
}

async function sendLanguageMenu(waId) {
  try {
    await sendWhatsAppButtons(
      waId,
      'Please choose your language',
      [
        { id: '1', title: 'English' },
        { id: '2', title: 'हिन्दी' },
        { id: '3', title: 'ଓଡ଼ିଆ' },
      ]
    );
  } catch (_err) {
    await sendWhatsAppMessage(waId, getMessage('en', 'language_options'));
  }
}

async function sendPatientTypeMenu(waId, lang) {
  try {
    await sendWhatsAppButtons(
      waId,
      getMessage(lang, 'patient_type_prompt'),
      [
        { id: '1', title: '🆕 New Patient' },
        { id: '2', title: '🔄 Returning' },
      ]
    );
  } catch (_err) {
    await sendWhatsAppMessage(waId, getMessage(lang, 'patient_type_prompt'));
  }
}

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

// ==================== Core Message Processor ====================

async function processIncomingMessage(messageData) {
  try {
    const waId = messageData.from;
    const messageId = messageData.id;
    const messageText = parseIncomingMessageText(messageData);
    const messageTextLower = messageText.toLowerCase();

    console.log(`\n📨 Received from ${waId}: "${messageText}"`);

    // Duplicate check
    if (await isMessageProcessed(waId, messageId)) {
      console.log(`⚠️ Duplicate message. Skipping.`);
      return { status: 'duplicate' };
    }
    await markMessageProcessed(waId, messageId);

    // "end" / "exit" command
    if (messageTextLower === 'end' || messageTextLower === 'exit') {
      let session = await getSession(waId);
      const lang = session?.language || 'en';
      await sendWhatsAppMessage(waId, getMessage(lang, 'end_message'));
      await clearUserData(waId);
      return { status: 'ended' };
    }

    // Get or create session
    let session = await getSession(waId);
    if (!session) {
      session = await createSession(waId);
    }

    const lang = session.language || 'en';
    const state = session.state;
    console.log(`👤 ${waId} — State: ${state}, Lang: ${lang}`);

    // ==================== State Router ====================

    switch (state) {

      // ==================== INIT — Parse QR or show menu ====================
      case 'INIT': {
        const match = messageText.match(CLINIC_ID_REGEX);
        if (match) {
          // QR scan — extract and verify clinic ID
          const clinicId = match[1];
          const clinic = await fetchClinicById(clinicId);
          if (clinic) {
            session.clinic_id = clinic.id;
            session.clinic_name = clinic.name;
            session.clinic_specialty = clinic.specialty || '';
            session.state = 'LANGUAGE_SELECT';
            await saveSession(waId, session);
            await sendWhatsAppMessage(waId, getMessage('en', 'clinic_verified', { clinic_name: clinic.name }));
            await sendLanguageMenu(waId);
          } else {
            await sendWhatsAppMessage(waId, getMessage('en', 'invalid_clinic'));
            await clearUserData(waId);
          }
        } else {
          // "Hi" or generic message — show menu
          session.state = 'MENU';
          await saveSession(waId, session);
          await sendMainMenu(waId, 'en');
        }
        return { status: 'init_handled' };
      }

      // ==================== MENU — View upcoming/past appointments/procedures ====================
      case 'MENU': {
        if (!['1', '2', '3', '4'].includes(messageText)) {
          // Check if this is a QR message that came while in MENU state
          const match = messageText.match(CLINIC_ID_REGEX);
          if (match) {
            const clinicId = match[1];
            const clinic = await fetchClinicById(clinicId);
            if (clinic) {
              session.clinic_id = clinic.id;
              session.clinic_name = clinic.name;
              session.clinic_specialty = clinic.specialty || '';
              session.state = 'LANGUAGE_SELECT';
              await saveSession(waId, session);
              await sendWhatsAppMessage(waId, getMessage('en', 'clinic_verified', { clinic_name: clinic.name }));
              await sendLanguageMenu(waId);
              return { status: 'qr_from_menu' };
            }
          }
          await sendWhatsAppMessage(waId, getMessage('en', 'invalid_menu'));
          await sendMainMenu(waId, 'en');
          return { status: 'invalid_input' };
        }
        // Search patient by phone
        const patient = await searchPatientByPhone(waId);
        if (!patient) {
          await sendWhatsAppMessage(waId, getMessage('en', 'no_patient_found_menu'));
          await clearUserData(waId);
          return { status: 'no_patient' };
        }
        const appts = await fetchAppointmentsByPatient(patient.id, 10);
        const procedureBookings = await fetchProcedureBookingsByPatient(patient.id, waId);
        const today = new Date().toISOString().split('T')[0];

        const isProcedureMenu = messageText === '3' || messageText === '4';
        const selectedVisitType = isProcedureMenu ? 'procedure' : 'consultation';

        if (messageText === '1' || messageText === '3') {
          // Upcoming (limit to 5)
          const upcoming = isProcedureMenu
            ? (procedureBookings || []).filter((p) => p.preferred_date >= today && p.status !== 'completed' && p.status !== 'cancelled').slice(0, 5)
            : (appts || []).filter((a) => a.visit_type === selectedVisitType && a.date >= today && a.status === 'booked').slice(0, 5);
          if (upcoming.length === 0) {
            await sendWhatsAppMessage(
              waId,
              getMessage('en', isProcedureMenu ? 'no_upcoming_procedures' : 'no_upcoming')
            );
          } else {
            let msg = getMessage('en', isProcedureMenu ? 'upcoming_procedures_header' : 'upcoming_header');
            upcoming.forEach((a, idx) => {
              if (isProcedureMenu) {
                msg += getMessage('en', 'procedure_list_item', {
                  index: String(idx + 1),
                  sub_category: a.sub_category || 'Procedure',
                  date: a.preferred_date,
                  status: a.status,
                }) + '\n';
              } else {
                msg += getMessage('en', 'appt_list_item', {
                  index: String(idx + 1), doctor: a.doctor_name || 'N/A',
                  date: a.date, status: a.status
                }) + '\n';
              }
            });
            msg += getMessage('en', 'view_done');
            await sendWhatsAppMessage(waId, msg);
          }
        } else {
          // Past 5
          const past = isProcedureMenu
            ? (procedureBookings || [])
              .filter((p) => p.preferred_date < today || p.status === 'completed' || p.status === 'cancelled')
              .slice(0, 5)
            : (appts || [])
              .filter((a) => a.visit_type === selectedVisitType && (a.date < today || a.status !== 'booked'))
              .slice(0, 5);
          if (past.length === 0) {
            await sendWhatsAppMessage(
              waId,
              getMessage('en', isProcedureMenu ? 'no_past_procedures' : 'no_past')
            );
          } else {
            let msg = getMessage('en', isProcedureMenu ? 'past_procedures_header' : 'past_header');
            past.forEach((a, idx) => {
              if (isProcedureMenu) {
                msg += getMessage('en', 'procedure_list_item', {
                  index: String(idx + 1),
                  sub_category: a.sub_category || 'Procedure',
                  date: a.preferred_date,
                  status: a.status,
                }) + '\n';
              } else {
                msg += getMessage('en', 'appt_list_item', {
                  index: String(idx + 1), doctor: a.doctor_name || 'N/A',
                  date: a.date, status: a.status
                }) + '\n';
              }
            });
            msg += getMessage('en', 'view_done');
            await sendWhatsAppMessage(waId, msg);
          }
        }
        await clearUserData(waId);
        return { status: 'menu_handled' };
      }

      // ==================== Language & Patient Type ====================
      case 'LANGUAGE_SELECT': {
        const langCode = getLanguageCode(messageText);
        if (!langCode) {
          await sendWhatsAppMessage(waId, getMessage('en', 'invalid_language'));
          await sendLanguageMenu(waId);
          return { status: 'invalid_input' };
        }
        session.language = langCode;
        session.state = 'PATIENT_TYPE';
        await saveSession(waId, session);
        await sendPatientTypeMenu(waId, langCode);
        return { status: 'language_selected' };
      }

      case 'PATIENT_TYPE': {
        if (messageText !== '1' && messageText !== '2') {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_patient_type'));
          await sendPatientTypeMenu(waId, lang);
          return { status: 'invalid_input' };
        }
        if (messageText === '1') {
          session.patient_type = 'new';
          session.state = 'NAME';
          await saveSession(waId, session);
          await sendWhatsAppMessage(waId, getMessage(lang, 'ask_name'));
        } else {
          session.patient_type = 'repeat';
          await saveSession(waId, session);
          await handleRepeatPatientLookup(waId, session, lang);
        }
        return { status: 'patient_type_selected' };
      }

      // ==================== New Patient Registration ====================
      case 'NAME': {
        session.name = messageText;
        session.state = 'AGE';
        await saveSession(waId, session);
        await sendWhatsAppMessage(waId, getMessage(lang, 'ask_age'));
        return { status: 'name_collected' };
      }

      case 'AGE': {
        const age = parseInt(messageText);
        if (isNaN(age) || age < 0 || age > 150) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_selection'));
          return { status: 'invalid_input' };
        }
        session.age = messageText;
        session.state = 'SEX';
        await saveSession(waId, session);
        await sendWhatsAppMessage(waId, getMessage(lang, 'ask_sex'));
        return { status: 'age_collected' };
      }

      case 'SEX': {
        const gender = getGender(lang, messageText);
        if (!gender) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_sex'));
          return { status: 'invalid_input' };
        }
        session.sex = gender;
        session.state = 'PATIENT_CREATION';
        await saveSession(waId, session);
        await handlePatientCreation(waId, session, lang);
        return { status: 'sex_collected' };
      }

      // ==================== Visit Type Branching ====================
      case 'VISIT_TYPE_SELECT': {
        const vtIndex = parseInt(messageText);
        if (isNaN(vtIndex) || vtIndex < 1 || vtIndex > VISIT_TYPES.length) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_visit_type'));
          await sendVisitTypeMenu(waId, lang);
          return { status: 'invalid_input' };
        }
        const vt = getVisitTypeByIndex(vtIndex);
        session.visit_type = vt.key;
        if (vt.key === 'GENERAL_QUERY') {
          session.state = 'QUERY_TEXT';
          await saveSession(waId, session);
          await sendWhatsAppMessage(waId, getMessage(lang, 'query_prompt'));
        } else {
          session.state = 'SUB_CATEGORY_SELECT';
          await saveSession(waId, session);
          await handleShowSubCategories(waId, session, lang);
        }
        return { status: 'visit_type_selected' };
      }

      case 'SUB_CATEGORY_SELECT': {
        const subCats = session.cached_sub_categories || [];
        const choice = parseInt(messageText);
        if (isNaN(choice) || choice < 1 || choice > subCats.length) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_selection'));
          return { status: 'invalid_input' };
        }
        const selected = subCats[choice - 1];
        session.sub_category = selected.name;
        session.sub_category_name = selected.name;
        session.fee = selected.price || 'N/A';
        session.detail_question_index = 0;
        session.detail_answers = {};
        session.state = 'COLLECT_DETAILS';
        await saveSession(waId, session);
        await sendDetailQuestion(waId, session, lang);
        return { status: 'sub_category_selected' };
      }

      case 'COLLECT_DETAILS': {
        const questions = getDetailQuestions(session.visit_type);
        const qIdx = session.detail_question_index;
        if (qIdx < questions.length) {
          const question = questions[qIdx];
          if (question.isMedia && messageTextLower === 'skip') {
            session.detail_answers[question.key] = 'skipped';
          } else {
            session.detail_answers[question.key] = messageText;
          }
          session.detail_question_index = qIdx + 1;
          await saveSession(waId, session);
          if (session.detail_question_index < questions.length) {
            await sendDetailQuestion(waId, session, lang);
          } else {
            session.state = session.visit_type === 'PROCEDURE' ? 'SHOW_DATES' : 'SHOW_DOCTORS';
            await saveSession(waId, session);
            if (session.visit_type === 'PROCEDURE') {
              await handleShowDates(waId, session, lang);
            } else {
              await handleShowDoctors(waId, session, lang);
            }
          }
        }
        return { status: 'detail_collected', index: qIdx };
      }

      // ==================== General Query ====================
      case 'QUERY_TEXT': {
        session.query_text = messageText;
        session.state = 'QUERY_LOGGED';
        await saveSession(waId, session);
        await handleQueryLogged(waId, session, lang);
        return { status: 'query_submitted' };
      }

      // ==================== Doctor / Date / Slot ====================
      case 'PICK_DOCTOR': {
        const doctors = session.cached_doctors || [];
        const choice = parseInt(messageText);
        if (isNaN(choice) || choice < 1 || choice > doctors.length) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_selection'));
          return { status: 'invalid_input' };
        }
        session.doctor_id = doctors[choice - 1].id;
        session.doctor_name = doctors[choice - 1].name;
        session.state = 'SHOW_DATES';
        await saveSession(waId, session);
        await handleShowDates(waId, session, lang);
        return { status: 'doctor_selected' };
      }

      case 'PICK_DATE': {
        const dates = session.cached_dates || [];
        const choice = parseInt(messageText);
        if (isNaN(choice) || choice < 1 || choice > dates.length) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_selection'));
          return { status: 'invalid_input' };
        }
        session.selected_date = dates[choice - 1].dateStr;
        session.state = 'SHOW_SLOTS';
        await saveSession(waId, session);
        await handleShowSlots(waId, session, lang);
        return { status: 'date_selected' };
      }

      case 'PICK_SLOT': {
        const slots = session.cached_slots || [];
        const choice = parseInt(messageText);
        if (isNaN(choice) || choice < 1 || choice > slots.length) {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_selection'));
          return { status: 'invalid_input' };
        }
        const selected = slots[choice - 1];
        session.selected_slot_index = choice - 1;
        session.selected_slot_label = selected.slot_label || selected.label || null;
        session.selected_slot = selected.hour ?? null;
        session.state = 'CONFIRM';
        await saveSession(waId, session);
        if (session.visit_type === 'PROCEDURE') {
          await sendProcedureConfirmation(waId, session, lang);
        } else {
          await sendConsultationConfirmation(waId, session, lang);
        }
        return { status: 'slot_selected' };
      }

      // ==================== Confirm ====================
      case 'CONFIRM': {
        if (messageText !== '1' && messageText !== '2') {
          await sendWhatsAppMessage(waId, getMessage(lang, 'invalid_confirm'));
          return { status: 'invalid_input' };
        }
        if (messageText === '1') {
          await handleBooking(waId, session, lang);
        } else {
          resetBookingFields(session);
          session.state = 'VISIT_TYPE_SELECT';
          await saveSession(waId, session);
          await sendVisitTypeMenu(waId, lang);
        }
        return { status: 'confirm_handled' };
      }

      case 'COMPLETE': {
        await sendWhatsAppMessage(waId, getMessage(lang, 'already_complete'));
        return { status: 'already_complete' };
      }

      default: {
        await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
        return { status: 'unhandled_state', state };
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

module.exports = {
  processIncomingMessage,
  sendWhatsAppMessage,
  getSession, clearUserData, redisClient
};
