# Clinqo WhatsApp Chatbot

A conversational AI-powered WhatsApp chatbot for booking medical appointments. The chatbot uses Google's Gemini AI to understand natural language and extract appointment details intelligently.

## Features

- 📱 WhatsApp Business API integration
- 🤖 Natural language processing with Google Gemini AI
- 👤 Patient registration and management
- 👨‍⚕️ Doctor selection
- 📅 Intelligent appointment booking
- 💾 Redis-based session management
- 🔄 Queue-based message processing

## Natural Language Appointment Booking

After providing basic information (name, age, sex), patients can book appointments using natural language:

**Examples:**
- "I want an appointment with Dr. Sandeep tomorrow at 2pm"
- "Book me with Dr. Smith next Monday at 10am"
- "I need to see Sandeep Das on 2025-01-15 at 14:00"

The AI will:
1. Extract mentioned fields (doctor, date, time)
2. Validate the information
3. Ask for any missing details
4. Confirm and book the appointment

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- WhatsApp Business API account
- Google Gemini API key
- ngrok (for local development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clinqo-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# WhatsApp Business API
PHONE_NUMBER_ID=your_phone_number_id
APP_SECRET=your_whatsapp_access_token
VERIFY_TOKEN=your_webhook_verify_token

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# API Endpoints
PATIENT_API_URL=https://your-api.com/api/v1/patients
DOCTORS_API_URL=https://your-api.com/api/v1/doctors
APPOINTMENTS_API_URL=https://your-api.com/api/v1/appointments
```

## Getting API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### WhatsApp Business API
1. Create a Meta Developer account
2. Set up WhatsApp Business API
3. Get your Phone Number ID and Access Token
4. Configure webhook with your verify token

## Running the Chatbot

1. Start Redis server:
```bash
redis-server
```

2. Start the chatbot:
```bash
node index.js
```

3. In another terminal, start ngrok:
```bash
ngrok http 3000
```

4. Configure your WhatsApp webhook URL with the ngrok URL:
```
https://your-ngrok-url.ngrok.io/webhook
```

## Project Structure

```
clinqo-chatbot/
├── index.js              # Express server & webhook endpoints
├── chatbot.js            # Main chatbot logic & state machine
├── gemini-ai.js          # Gemini AI integration for NLP
├── redis-config.js       # Redis client configuration
├── package.json          # Dependencies
├── .env                  # Environment variables (create from .env.example)
└── README.md            # Documentation
```

## How It Works

### State Machine Flow

1. **NAME** → Collect patient name
2. **AGE** → Collect age
3. **SEX** → Collect gender
4. **PATIENT_CREATION** → Create patient record in backend
5. **DOCTOR** → Fetch and display doctor list
6. **NATURAL_LANGUAGE** → AI-powered natural language processing
   - User can say: "I want Dr. Smith tomorrow at 2pm"
   - AI extracts: doctor, date, time
   - System asks for missing fields
   - Validates all information
7. **COMPLETE** → Book appointment and confirm

### Natural Language Processing

The `gemini-ai.js` module handles:
- Parsing natural language input
- Extracting appointment fields
- Converting relative dates ("tomorrow", "next Monday")
- Converting time formats ("2pm" → "14:00")
- Identifying doctors from partial names
- Validating extracted data
- Generating follow-up questions

### Example Conversation

```
Bot: Welcome to Clinqo! 👋
     Let's collect your information for the appointment.
     Please enter your name:

User: John Doe

Bot: Please enter your age:

User: 30

Bot: Please enter your sex (Male/Female/Other):

User: Male

Bot: Please select a doctor by entering the serial number:
     1. Sandeep Das - Cardiology
     2. Dr. Smith - Neurology

Bot: Now you can tell me your appointment details in your own words.
     For example: 'I want an appointment with Dr. Sandeep tomorrow at 2pm'

User: I want to see Dr. Sandeep tomorrow at 2pm

Bot: Thank you! Your appointment has been confirmed! 🎉
     
     Appointment Details:
     📝 Name: John Doe
     🎂 Age: 30
     👤 Gender: Male
     🆔 Patient ID: 12345
     👨‍⚕️ Doctor: Sandeep Das
     📅 Date: 2026-01-04
     ⏰ Time: 14:00
     
     Your appointment is confirmed!
```

## Commands

- `end` - Terminate current appointment and start over

## Dependencies

- **express**: Web server framework
- **axios**: HTTP client for API calls
- **redis**: Session and state management
- **@google/generative-ai**: Google Gemini AI SDK
- **dotenv**: Environment variable management
- **body-parser**: Request body parsing
- **ngrok**: Local tunnel for webhook testing

## Error Handling

The chatbot includes comprehensive error handling:
- Duplicate message detection
- API failure recovery
- Invalid input validation
- Session timeout management
- Graceful degradation when AI fails

## Development

To clear all Redis data:
```bash
node clear-redis.js
```

To test with local API:
```bash
node local-api.js
```

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
