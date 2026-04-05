const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '248402908354623';
const ACCESS_TOKEN = process.env.APP_SECRET;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  };
}

function truncate(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

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
      headers: getHeaders()
    });

    console.log(`✅ Message sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

async function sendWhatsAppButtons(to, bodyText, buttons) {
  try {
    const replyButtons = (buttons || []).slice(0, 3).map((btn) => ({
      type: 'reply',
      reply: {
        id: String(btn.id),
        title: truncate(btn.title, 20),
      }
    }));

    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: truncate(bodyText, 1024) },
          action: { buttons: replyButtons }
        }
      },
      { headers: getHeaders() }
    );

    console.log(`✅ Interactive buttons sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp buttons:', error.response?.data || error.message);
    throw error;
  }
}

async function sendWhatsAppList(to, bodyText, buttonText, sections, options = {}) {
  try {
    const normalizedSections = (sections || []).slice(0, 10).map((section) => ({
      title: truncate(section.title || 'Options', 24),
      rows: (section.rows || []).slice(0, 10).map((row) => ({
        id: String(row.id),
        title: truncate(row.title, 24),
        description: truncate(row.description || '', 72),
      }))
    }));

    const interactive = {
      type: 'list',
      body: { text: truncate(bodyText, 1024) },
      action: {
        button: truncate(buttonText || 'View options', 20),
        sections: normalizedSections,
      }
    };

    if (options.headerText) {
      interactive.header = { type: 'text', text: truncate(options.headerText, 60) };
    }
    if (options.footerText) {
      interactive.footer = { text: truncate(options.footerText, 60) };
    }

    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive,
      },
      { headers: getHeaders() }
    );

    console.log(`✅ Interactive list sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp list:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppMessage, sendWhatsAppButtons, sendWhatsAppList };
