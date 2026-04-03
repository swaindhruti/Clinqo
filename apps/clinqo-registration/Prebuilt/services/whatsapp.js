const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '248402908354623';
const ACCESS_TOKEN = process.env.APP_SECRET;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

/**
 * Send message via WhatsApp API
 * @param {string} to - Recipient phone number (wa_id)
 * @param {string} messageBody - Text message to send
 * @returns {Promise<Object>} - WhatsApp API response
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

module.exports = { sendWhatsAppMessage };
