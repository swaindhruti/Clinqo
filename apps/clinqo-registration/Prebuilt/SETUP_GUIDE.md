# Quick Setup Guide for Natural Language Appointment Booking

## Overview
Your chatbot now supports natural language appointment booking using Google's Gemini AI. After patients provide basic info (name, age, sex) and see the doctor list, they can book appointments naturally.

## What Changed

### 1. New Files Created
- **gemini-ai.js** - AI module for natural language processing
- **.env.example** - Environment variables template
- **test-gemini.js** - Test script to verify AI functionality

### 2. Modified Files
- **chatbot.js** - Added NATURAL_LANGUAGE state and AI integration
- **package.json** - Added @google/generative-ai dependency
- **README.md** - Complete documentation
- **.gitignore** - Added modules directory

## Setup Steps

### 1. Get Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### 2. Configure Environment
Create a `.env` file in your project root:

```env
# Your existing WhatsApp config
PHONE_NUMBER_ID=your_phone_number_id
APP_SECRET=your_access_token
VERIFY_TOKEN=your_verify_token

# Add this new line for Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Your API endpoints
PATIENT_API_URL=https://your-api.com/api/v1/patients
DOCTORS_API_URL=https://your-api.com/api/v1/doctors
APPOINTMENTS_API_URL=https://your-api.com/api/v1/appointments
```

### 3. Test the Setup
Run the test script to verify Gemini AI is working:

```bash
node test-gemini.js
```

You should see test cases demonstrating natural language extraction.

### 4. Start Your Chatbot
```bash
# Start Redis (if not already running)
redis-server

# Start the chatbot
node index.js

# In another terminal, start ngrok
ngrok http 3000
```

## How It Works

### Old Flow
```
Patient provides sex → 
Bot shows doctor list → 
Patient enters doctor number → 
Bot asks for date → 
Patient enters date → 
Bot asks for time → 
Patient enters time → 
Appointment booked
```

### New Flow (Natural Language)
```
Patient provides sex → 
Bot shows doctor list → 
Patient says: "I want Dr. Sandeep tomorrow at 2pm" → 
Bot extracts: doctor=Sandeep, date=tomorrow, time=14:00 → 
Bot validates and confirms → 
Appointment booked
```

## Example Conversations

### Complete Information in One Message
```
User: I want an appointment with Dr. Sandeep tomorrow at 2pm
Bot: ✅ Appointment confirmed!
     Doctor: Sandeep Das
     Date: 2026-01-04
     Time: 14:00
```

### Partial Information (Bot Asks for Missing Fields)
```
User: I want to see Dr. Smith
Bot: What date would you like for your appointment?

User: Next Monday
Bot: What time would you prefer?

User: 10am
Bot: ✅ Appointment confirmed!
     Doctor: Dr. Smith
     Date: 2026-01-06
     Time: 10:00
```

### Flexible Language
```
User: Book me with Sandeep for tomorrow morning at 9
Bot: ✅ Appointment confirmed!
     Doctor: Sandeep Das
     Date: 2026-01-04
     Time: 09:00
```

## Supported Date Formats
- "tomorrow"
- "today"
- "next Monday", "next Tuesday", etc.
- "2026-01-15" (YYYY-MM-DD)

## Supported Time Formats
- "2pm", "10am"
- "14:00", "09:30" (HH:MM)
- "2:30pm"

## AI Features

### Intelligent Field Extraction
- Recognizes doctor names (partial match: "sandeep" → "Sandeep Das")
- Converts relative dates to YYYY-MM-DD format
- Normalizes time formats to 24-hour HH:MM
- Validates all extracted information

### Progressive Conversation
- Tracks already-filled fields
- Only asks for missing information
- Provides natural follow-up questions
- Confirms understood details

### Error Handling
- Validates dates (no past dates)
- Validates time format
- Handles ambiguous input gracefully
- Provides helpful error messages

## Testing Checklist

- [ ] Set GEMINI_API_KEY in .env
- [ ] Run `npm install` to get new packages
- [ ] Run `node test-gemini.js` to verify AI
- [ ] Start Redis server
- [ ] Start chatbot with `node index.js`
- [ ] Test with WhatsApp:
  - [ ] Complete info: "I want Dr. Smith tomorrow at 2pm"
  - [ ] Partial info: "I want Dr. Smith"
  - [ ] Only time/date: "Tomorrow at 10am"

## Troubleshooting

### "Error calling Gemini AI"
- Check GEMINI_API_KEY is set in .env
- Verify API key is valid at https://aistudio.google.com/
- Check internet connection

### "Invalid JSON response from Gemini"
- This is rare - the AI should always return valid JSON
- Check your prompt in gemini-ai.js
- Verify you're using gemini-2.0-flash-exp model

### AI Not Understanding
- The system falls back gracefully
- Bot will ask for fields step-by-step if AI fails
- Check console logs for detailed error messages

## Customization

### Change AI Model
Edit `gemini-ai.js` line 16:
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
```

Available models: 
- `gemini-2.0-flash-exp` (fastest, recommended)
- `gemini-1.5-flash` (alternative)
- `gemini-1.5-pro` (more accurate, slower)

### Customize Prompts
Edit the prompt in `gemini-ai.js` function `extractAppointmentFields()`

### Add More Fields
1. Add fields to `DEFAULT_COLLECTED_INFO` in chatbot.js
2. Update prompt in gemini-ai.js to extract new fields
3. Update validation functions

## Cost Considerations

Gemini AI API has a free tier:
- 15 requests per minute (RPM)
- 1 million tokens per minute (TPM)
- 1,500 requests per day (RPD)

For most appointment booking scenarios, you'll stay within free limits.

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test with test-gemini.js
3. ✅ Test end-to-end with WhatsApp
4. Consider: Add more sophisticated conversation context
5. Consider: Add appointment rescheduling with NLP
6. Consider: Add multiple language support

## Support

If you encounter issues:
1. Check console logs for detailed errors
2. Verify all environment variables are set
3. Test with test-gemini.js first
4. Check Redis is running
5. Verify WhatsApp webhook is configured

Happy coding! 🚀
