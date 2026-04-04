const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { processIncomingMessage } = require('./chatbot');

dotenv.config();
const app = express();

// IMPORTANT: For signature validation you must capture raw body.
app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const APP_SECRET = process.env.APP_SECRET;

app.get('/', (req, res) => {
  res.send('🤖 Clinqo WhatsApp Chatbot - Running');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Respond immediately to prevent timeout
    res.sendStatus(200);

    // Check the field type in changes
    if (body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0]) {
      const changeField = body.entry[0].changes[0].field;
      const changeValue = body.entry[0].changes[0].value;

      // Ignore status updates (delivery receipts, read receipts, etc.)
      if (changeField === 'messages' && changeValue.statuses) {
        console.log('⏭️  Ignoring status update (delivery/read receipt)');
        console.log(`   Status: ${changeValue.statuses[0]?.status}`);
        console.log(`   Phone ID: ${changeValue.metadata?.phone_number_id}\n`);
        return;
      }

      // Check if this is a message event (actual user messages)
      if (changeField === 'messages' && changeValue.messages) {
        const messages = changeValue.messages;
        console.log(`\n✅ Found ${messages.length} message(s) to process`);
        
        for (const message of messages) {
          console.log('\n' + '='.repeat(60));
          try {
            await processIncomingMessage(message);
          } catch (msgError) {
            console.error('Error processing individual message:', msgError);
          }
          console.log('='.repeat(60));
        }
      } else {
        console.log(`⚠️  Webhook field type: ${changeField} - No user messages to process`);
      }
    } else {
      console.log('⚠️  Invalid webhook structure');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

app.listen(8080, () => {
  console.log('\n🚀 Express server started on port 8080');
  console.log('📱 WhatsApp Chatbot initialized');
  console.log('🌐 Ngrok URL: Use ngrok http 8080 in another terminal');
  console.log('\n' + '='.repeat(60));
});
