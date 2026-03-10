const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

// IMPORTANT: For signature validation you must capture raw body.
// We provide JSON parsing for convenience and raw for signature.
app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const APP_SECRET = process.env.APP_SECRET; // for signature validation
app.get('/', (req, res) => {
  res.send('Hello, this is the Clinqo webhook endpoint.');
});
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  // (2) handle message
  console.log('Incoming webhook:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200); // respond quickly
});

app.listen(3000, () => {
  console.log('Express server started on port 3000');
  console.log('🌐 Ngrok will be started separately via CLI');
  console.log('To expose this server, run in another terminal:');
  console.log('  ngrok http 3000');
});
