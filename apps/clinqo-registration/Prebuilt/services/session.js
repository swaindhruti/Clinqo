/**
 * services/session.js - Redis session management (v6)
 */
const redisClient = require('../redis-config');

// ==================== User Locking ====================

async function acquireUserLock(waId, ttlSeconds = 30) {
  const lockKey = `lock:${waId}`;
  const result = await redisClient.set(lockKey, Date.now().toString(), { NX: true, EX: ttlSeconds });
  return result === 'OK';
}

async function releaseUserLock(waId) {
  await redisClient.del(`lock:${waId}`);
}

// ==================== Duplicate Detection ====================

async function isMessageProcessed(waId, messageId) {
  const key = `processed:${waId}:${messageId}`;
  return (await redisClient.exists(key)) === 1;
}

async function markMessageProcessed(waId, messageId) {
  const key = `processed:${waId}:${messageId}`;
  await redisClient.setEx(key, 86400, '1');
}

// ==================== Session CRUD ====================

async function getSession(waId) {
  const data = await redisClient.get(`session:${waId}`);
  return data ? JSON.parse(data) : null;
}

async function saveSession(waId, session) {
  session.updated_at = new Date().toISOString();
  await redisClient.setEx(`session:${waId}`, 86400 * 7, JSON.stringify(session));
}

async function createSession(waId) {
  const session = {
    wa_id: waId,
    state: 'INIT',  // Start at INIT — parse QR or show menu
    language: 'en',
    patient_type: null,
    // Clinic (set from QR code)
    clinic_id: '', clinic_name: '', clinic_specialty: '',
    // Patient info
    name: '', age: '', sex: '', patient_id: '',
    // Visit type branching
    visit_type: null,
    sub_category: null, sub_category_name: '', fee: '',
    detail_question_index: 0, detail_answers: {},
    query_text: '',
    // Doctor & scheduling (consultation only)
    doctor_id: '', doctor_name: '',
    selected_date: '', selected_slot: null,
    // Cached lists
    cached_doctors: null, cached_dates: null,
    cached_slots: null, cached_sub_categories: null,
    cached_appointments: null,
    created_at: new Date().toISOString()
  };
  await saveSession(waId, session);
  return session;
}

// ==================== Cleanup & Reset ====================

async function clearUserData(waId) {
  try {
    await redisClient.del(`session:${waId}`);
    await redisClient.del(`collected:${waId}`);
    const processedKeys = await redisClient.keys(`processed:${waId}:*`);
    if (processedKeys.length > 0) await redisClient.del(processedKeys);
    await releaseUserLock(waId);
    console.log(`✅ All user data cleared for ${waId}`);
  } catch (error) {
    console.error(`❌ Error clearing user data for ${waId}:`, error);
  }
}

function resetBookingFields(session) {
  session.visit_type = null;
  session.sub_category = null;
  session.sub_category_name = '';
  session.fee = '';
  session.detail_question_index = 0;
  session.detail_answers = {};
  session.query_text = '';
  session.doctor_id = '';
  session.doctor_name = '';
  session.selected_date = '';
  session.selected_slot = null;
  session.cached_doctors = null;
  session.cached_dates = null;
  session.cached_slots = null;
  session.cached_sub_categories = null;
}

module.exports = {
  acquireUserLock, releaseUserLock,
  isMessageProcessed, markMessageProcessed,
  getSession, saveSession, createSession,
  clearUserData, resetBookingFields, redisClient
};
