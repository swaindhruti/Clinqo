/**
 * gemini-ai.js - Utility functions (formerly Gemini AI extraction)
 * 
 * NLP-based date/time/doctor extraction has been removed.
 * The chatbot now uses structured selection (pick from lists) instead.
 * 
 * This file retains utility validators that may be useful elsewhere.
 */

const dotenv = require('dotenv');
dotenv.config();

/**
 * Validate and format date string.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Object} - { valid: boolean, formatted?: string, message?: string }
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
 * Validate and format time string.
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {Object} - { valid: boolean, formatted?: string, message?: string }
 */
function validateTime(timeStr) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(timeStr)) {
    return { valid: false, message: 'Invalid time format. Please use HH:MM (e.g., 14:00 or 09:30).' };
  }

  return { valid: true, formatted: timeStr };
}

module.exports = {
  validateDate,
  validateTime
};
