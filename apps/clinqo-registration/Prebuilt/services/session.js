const redisClient = require('../redis-config');

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

// ==================== USER LOCKING ====================

/**
 * Acquire a distributed lock for a specific user.
 * Prevents two messages from the same user being processed simultaneously.
 * Uses Redis SET NX EX for atomic lock acquisition.
 * 
 * @param {string} waId - User's WhatsApp ID
 * @param {number} ttlSeconds - Lock expiry time (safety net for crashes)
 * @returns {Promise<boolean>} - true if lock acquired, false if already locked
 */
async function acquireUserLock(waId, ttlSeconds = 30) {
  const lockKey = `lock:${waId}`;
  // SET NX = only set if key doesn't exist; EX = auto-expire
  const result = await redisClient.set(lockKey, Date.now().toString(), {
    NX: true,
    EX: ttlSeconds
  });
  return result === 'OK';
}

/**
 * Release the distributed lock for a specific user.
 * @param {string} waId - User's WhatsApp ID
 */
async function releaseUserLock(waId) {
  const lockKey = `lock:${waId}`;
  await redisClient.del(lockKey);
}

// ==================== DUPLICATE DETECTION ====================

/**
 * Check if message is already processed (duplicate check)
 * @param {string} waId - User's WhatsApp ID
 * @param {string} messageId - Unique message ID from WhatsApp
 * @returns {Promise<boolean>} - true if already processed
 */
async function isMessageProcessed(waId, messageId) {
  const key = `processed:${waId}:${messageId}`;
  const exists = await redisClient.exists(key);
  return exists === 1;
}

/**
 * Mark message as processed to prevent duplicate handling
 * @param {string} waId - User's WhatsApp ID
 * @param {string} messageId - Unique message ID from WhatsApp
 */
async function markMessageProcessed(waId, messageId) {
  const key = `processed:${waId}:${messageId}`;
  await redisClient.setEx(key, 86400, '1'); // Expire after 24 hours
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Get existing user session from Redis
 * @param {string} waId - User's WhatsApp ID
 * @returns {Promise<Object|null>} - Session object or null
 */
async function getSession(waId) {
  const sessionKey = `session:${waId}`;
  const sessionData = await redisClient.get(sessionKey);
  return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * Create a new session for a user
 * @param {string} waId - User's WhatsApp ID
 * @returns {Promise<Object>} - New session object
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
 * @param {string} waId - User's WhatsApp ID
 * @param {string} newState - New state to transition to
 * @returns {Promise<Object|null>} - Updated session
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

// ==================== COLLECTED INFO ====================

/**
 * Get collected appointment info for a user
 * @param {string} waId - User's WhatsApp ID
 * @returns {Promise<Object>} - Collected info object
 */
async function getCollectedInfo(waId) {
  const collectedKey = `collected:${waId}`;
  const data = await redisClient.get(collectedKey);
  return data ? JSON.parse(data) : { ...DEFAULT_COLLECTED_INFO };
}

/**
 * Update a single field in collected info
 * @param {string} waId - User's WhatsApp ID
 * @param {string} field - Field name to update
 * @param {*} value - New value
 * @returns {Promise<Object>} - Updated collected info
 */
async function updateCollectedInfo(waId, field, value) {
  const collectedKey = `collected:${waId}`;
  const collected = await getCollectedInfo(waId);
  collected[field] = value;
  collected.last_updated = new Date().toISOString();
  await redisClient.setEx(collectedKey, 86400 * 7, JSON.stringify(collected));
  return collected;
}

// ==================== CLEANUP ====================

/**
 * Clear all user data from Redis (session, collected info, processed messages)
 * @param {string} waId - User's WhatsApp ID
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
    
    // Release any lingering lock
    await releaseUserLock(waId);
    
    console.log(`✅ All user data cleared for ${waId}\n`);
  } catch (error) {
    console.error(`❌ Error clearing user data for ${waId}:`, error);
  }
}

module.exports = {
  DEFAULT_COLLECTED_INFO,
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
};
