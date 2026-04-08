/**
 * handlers/booking.js - Sub-category, doctor, date, slot, and booking handlers
 * Sub-categories are now fetched from the backend API.
 */
const { sendWhatsAppMessage, sendWhatsAppButtons, sendWhatsAppList } = require('../services/whatsapp');
const {
  fetchServiceCategories, fetchDoctors,
  fetchDoctorSlotAvailability, createAppointment, createProcedureBooking
} = require('../services/api');
const { saveSession, clearUserData } = require('../services/session');
const { getMessage, getDayName } = require('../i18n');
const { getDetailQuestions } = require('../visit-types');

function short(text, max = 24) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

async function sendVisitTypeMenu(waId, lang) {
  try {
    await sendWhatsAppButtons(
      waId,
      getMessage(lang, 'visit_type_prompt'),
      [
        { id: '1', title: getMessage(lang, 'btn_consultation') },
        { id: '2', title: getMessage(lang, 'btn_procedure') },
        { id: '3', title: getMessage(lang, 'btn_general_query') },
      ]
    );
  } catch (_err) {
    await sendWhatsAppMessage(waId, getMessage(lang, 'visit_type_prompt'));
  }
}

async function sendConfirmButtons(waId, lang) {
  try {
    await sendWhatsAppButtons(
      waId,
      getMessage(lang, 'confirm_action_text'),
      [
        { id: '1', title: getMessage(lang, 'btn_yes') },
        { id: '2', title: getMessage(lang, 'btn_no') },
      ]
    );
  } catch (_err) {
    await sendWhatsAppMessage(waId, getMessage(lang, 'confirm_prompt'));
  }
}

// Default time slots (9 AM - 5 PM)
const ALL_TIME_SLOTS = [
  { hour: 9, label: '09:00 AM' }, { hour: 10, label: '10:00 AM' },
  { hour: 11, label: '11:00 AM' }, { hour: 12, label: '12:00 PM' },
  { hour: 13, label: '01:00 PM' }, { hour: 14, label: '02:00 PM' },
  { hour: 15, label: '03:00 PM' }, { hour: 16, label: '04:00 PM' },
  { hour: 17, label: '05:00 PM' }
];

function getNextNDays(n) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({ dateStr: d.toISOString().split('T')[0], dayIndex: d.getDay() });
  }
  return dates;
}

function formatTimeSlot(hour) {
  const slot = ALL_TIME_SLOTS.find(s => s.hour === hour);
  return slot ? slot.label : `${hour}:00`;
}

// ==================== Sub-categories (from backend) ====================

async function handleShowSubCategories(waId, session, lang) {
  try {
    const visitTypeApi = session.visit_type.toLowerCase(); // 'consultation' or 'procedure'
    const subCats = await fetchServiceCategories(session.clinic_id, visitTypeApi);

    if (!subCats || subCats.length === 0) {
      await sendWhatsAppMessage(waId, getMessage(lang, 'no_sub_categories'));
      session.state = 'VISIT_TYPE_SELECT';
      await saveSession(waId, session);
      await sendVisitTypeMenu(waId, lang);
      return;
    }

    let msg = getMessage(lang, 'sub_category_header');
    subCats.forEach((cat, idx) => {
      msg += getMessage(lang, 'sub_category_item', {
        index: String(idx + 1),
        emoji: cat.emoji || '📋',
        name: cat.name,
        price: cat.price || 'N/A'
      }) + '\n';
    });
    msg += getMessage(lang, 'pick_sub_category');

    session.cached_sub_categories = subCats;
    session.state = 'SUB_CATEGORY_SELECT';
    await saveSession(waId, session);
    try {
      await sendWhatsAppList(
        waId,
        getMessage(lang, 'sub_category_header'),
        getMessage(lang, 'list_choose'),
        [{
          title: getMessage(lang, 'list_title_subcategories'),
          rows: subCats.map((cat, idx) => ({
            id: String(idx + 1),
            title: short(`${cat.emoji || '📋'} ${cat.name}`),
            description: short(getMessage(lang, 'list_desc_fee', { fee: cat.price || 'N/A' }), 72),
          }))
        }]
      );
    } catch (_err) {
      await sendWhatsAppMessage(waId, msg);
    }
  } catch (error) {
    console.error('❌ Show sub-categories failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

async function sendDetailQuestion(waId, session, lang) {
  const questions = getDetailQuestions(session.visit_type);
  const qIdx = session.detail_question_index;
  if (qIdx === 0) {
    await sendWhatsAppMessage(waId, getMessage(lang, 'collect_details_header'));
  }
  if (qIdx < questions.length) {
    const question = questions[qIdx];
    const prompt = question.prompt[lang] || question.prompt['en'];
    await sendWhatsAppMessage(waId, `(${qIdx + 1}/${questions.length}) ${prompt}`);
  }
}

// ==================== Doctor / Date / Slot ====================

async function handleShowDoctors(waId, session, lang) {
  try {
    const doctors = await fetchDoctors(undefined, session.clinic_id);
    if (!doctors || doctors.length === 0) {
      await sendWhatsAppMessage(waId, getMessage(lang, 'no_doctors'));
      session.state = 'VISIT_TYPE_SELECT';
      await saveSession(waId, session);
      await sendVisitTypeMenu(waId, lang);
      return;
    }
    let msg = getMessage(lang, 'doctors_header');
    doctors.forEach((doc, idx) => {
      msg += getMessage(lang, 'doctors_item', {
        index: String(idx + 1), name: doc.name, specialty: doc.specialty || 'General'
      }) + '\n';
    });
    msg += getMessage(lang, 'pick_doctor');
    session.cached_doctors = doctors;
    session.state = 'PICK_DOCTOR';
    await saveSession(waId, session);
    try {
      await sendWhatsAppList(
        waId,
        getMessage(lang, 'doctors_header'),
        getMessage(lang, 'list_choose'),
        [{
          title: getMessage(lang, 'list_title_doctors'),
          rows: doctors.map((doc, idx) => ({
            id: String(idx + 1),
            title: short(doc.name || `Doctor ${idx + 1}`),
            description: short(doc.specialty || 'General', 72),
          }))
        }]
      );
    } catch (_err) {
      await sendWhatsAppMessage(waId, msg);
    }
  } catch (error) {
    console.error('❌ Show doctors failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

async function handleShowDates(waId, session, lang) {
  try {
    const visitType = session.visit_type?.toLowerCase() === 'procedure' ? 'procedure' : 'consultation';
    const availability = await fetchDoctorSlotAvailability(session.doctor_id, visitType, 7);
    const availableDates = availability.map((item) => {
      const dateObj = new Date(item.date);
      return {
        dateStr: item.date,
        dayIndex: dateObj.getDay(),
        slots: item.slots || []
      };
    });

    if (availableDates.length === 0) {
      await sendWhatsAppMessage(waId, getMessage(lang, 'no_dates'));
      session.state = 'SHOW_DOCTORS';
      await saveSession(waId, session);
      await handleShowDoctors(waId, session, lang);
      return;
    }
    let msg = getMessage(lang, 'dates_header');
    availableDates.forEach((d, idx) => {
      msg += getMessage(lang, 'dates_item', {
        index: String(idx + 1), date: d.dateStr, day: getDayName(lang, d.dayIndex)
      }) + '\n';
    });
    msg += getMessage(lang, 'pick_date');
    session.cached_dates = availableDates;
    session.state = 'PICK_DATE';
    await saveSession(waId, session);
    try {
      await sendWhatsAppList(
        waId,
        getMessage(lang, 'dates_header'),
        getMessage(lang, 'list_choose'),
        [{
          title: getMessage(lang, 'list_title_dates'),
          rows: availableDates.map((d, idx) => ({
            id: String(idx + 1),
            title: short(d.dateStr),
            description: short(getDayName(lang, d.dayIndex), 72),
          }))
        }]
      );
    } catch (_err) {
      await sendWhatsAppMessage(waId, msg);
    }
  } catch (error) {
    console.error('❌ Show dates failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

async function handleShowSlots(waId, session, lang) {
  try {
    const dateEntry = (session.cached_dates || []).find((d) => d.dateStr === session.selected_date);
    const available = dateEntry?.slots || [];

    if (available.length === 0) {
      await sendWhatsAppMessage(waId, getMessage(lang, 'no_slots'));
      session.state = 'SHOW_DATES';
      await saveSession(waId, session);
      await handleShowDates(waId, session, lang);
      return;
    }
    let msg = getMessage(lang, 'slots_header');
    available.forEach((slot, idx) => {
      msg += getMessage(lang, 'slots_item', { index: String(idx + 1), time: slot.slot_label }) + '\n';
    });
    msg += getMessage(lang, 'pick_slot');
    session.cached_slots = available;
    session.state = 'PICK_SLOT';
    await saveSession(waId, session);
    try {
      await sendWhatsAppList(
        waId,
        getMessage(lang, 'slots_header'),
        getMessage(lang, 'list_choose'),
        [{
          title: getMessage(lang, 'list_title_slots'),
          rows: available.map((slot, idx) => ({
            id: String(idx + 1),
            title: short(slot.slot_label || `Slot ${idx + 1}`),
            description: short(getMessage(lang, 'list_desc_tap_select_time'), 72),
          }))
        }]
      );
    } catch (_err) {
      await sendWhatsAppMessage(waId, msg);
    }
  } catch (error) {
    console.error('❌ Show slots failed:', error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'generic_error'));
  }
}

// ==================== Confirmation & Booking ====================

async function sendConsultationConfirmation(waId, session, lang) {
  const concern = session.detail_answers?.concern || 'N/A';
  const timeLabel = session.selected_slot_label || (session.selected_slot != null ? formatTimeSlot(session.selected_slot) : 'N/A');
  let msg = getMessage(lang, 'confirm_consultation_details', {
    name: session.name, clinic: session.clinic_name || 'N/A',
    sub_category: session.sub_category_name || 'N/A',
    fee: session.fee || 'N/A', doctor: session.doctor_name || 'N/A',
    date: session.selected_date, time: timeLabel, concern
  });
  await sendWhatsAppMessage(waId, msg);
  await sendConfirmButtons(waId, lang);
}

async function sendProcedureConfirmation(waId, session, lang) {
  const concern = session.detail_answers?.concern || 'N/A';
  let msg = getMessage(lang, 'procedure_confirm_details', {
    name: session.name, clinic: session.clinic_name || 'N/A',
    type: session.visit_type || 'PROCEDURE',
    sub_category: session.sub_category_name || 'N/A',
    fee: session.fee || 'N/A', concern
  });
  await sendWhatsAppMessage(waId, msg);
  await sendConfirmButtons(waId, lang);
}

async function handleBooking(waId, session, lang) {
  try {
    const selectedSlot = session.cached_slots?.find((slot) => slot.slot_label === session.selected_slot_label)
      || session.cached_slots?.[session.selected_slot_index || 0];

    const visitType = session.visit_type?.toLowerCase() === 'procedure' ? 'procedure' : 'consultation';
    const timeLabel = selectedSlot?.slot_label || (session.selected_slot != null ? formatTimeSlot(session.selected_slot) : 'N/A');
    const concern = session.detail_answers?.concern || 'N/A';

    if (visitType === 'procedure') {
      await createProcedureBooking(
        session.clinic_id,
        session.patient_id,
        session.selected_date,
        timeLabel,
        session.detail_answers || {},
        session.sub_category_name || null,
      );

      let checkInCode = null;
      if (session.doctor_id) {
        try {
          const appointment = await createAppointment(
            session.patient_id,
            session.doctor_id,
            session.selected_date,
            session.selected_slot,
            undefined,
            {
              slotLabel: selectedSlot?.slot_label || session.selected_slot_label,
              visitType,
              intakeData: session.detail_answers || {},
            }
          );
          checkInCode = appointment.check_in_code || null;
        } catch (appointmentError) {
          console.warn('⚠️ Procedure appointment creation skipped/failed, procedure request saved:', appointmentError.response?.data || appointmentError.message || appointmentError);
        }
      }

      const qrUrl = checkInCode
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInCode)}`
        : null;
      const details = getMessage(lang, 'procedure_confirm_details', {
        name: session.name,
        clinic: session.clinic_name || 'N/A',
        sub_category: session.sub_category_name || 'N/A',
        fee: session.fee || 'N/A',
        concern,
      });

      const procedureDetails = `${details}\n📅 Preferred Date: ${session.selected_date}\n🕒 Preferred Time: ${timeLabel}`;
      if (checkInCode && qrUrl) {
        await sendWhatsAppMessage(waId, getMessage(lang, 'booking_success', {
          details: procedureDetails,
          check_in_code: checkInCode,
          qr_url: qrUrl,
        }));
      } else {
        await sendWhatsAppMessage(waId, getMessage(lang, 'procedure_confirmed', { details: procedureDetails }));
      }

      session.state = 'COMPLETE';
      await saveSession(waId, session);
      await clearUserData(waId);
      return;
    }

    const appointment = await createAppointment(
      session.patient_id, session.doctor_id,
      session.selected_date,
      session.selected_slot,
      undefined,
      {
        slotLabel: selectedSlot?.slot_label || session.selected_slot_label,
        visitType,
        intakeData: session.detail_answers || {},
      }
    );
    const checkInCode = appointment.check_in_code || 'N/A';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInCode)}`;
    const details = getMessage(lang, 'confirm_consultation_details', {
      name: session.name, clinic: session.clinic_name || 'N/A',
      sub_category: session.sub_category_name || 'N/A',
      fee: session.fee || 'N/A', doctor: session.doctor_name || 'N/A',
      date: session.selected_date, time: timeLabel, concern
    });
    await sendWhatsAppMessage(waId, getMessage(lang, 'booking_success', {
      details, check_in_code: checkInCode, qr_url: qrUrl
    }));
    session.state = 'COMPLETE';
    await saveSession(waId, session);
    await clearUserData(waId);
  } catch (error) {
    console.error('❌ Booking failed:', error.response?.data || error.message || error);
    await sendWhatsAppMessage(waId, getMessage(lang, 'booking_error'));
  }
}

module.exports = {
  handleShowSubCategories, sendDetailQuestion,
  handleShowDoctors, handleShowDates, handleShowSlots,
  sendConsultationConfirmation, sendProcedureConfirmation, handleBooking,
  formatTimeSlot
};
