# Appointment Booking Flow with Natural Language Processing

## Complete State Machine Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER STARTS                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   STATE: NAME   │
                        │  "Enter name"   │
                        └────────┬────────┘
                                 │ User: "John Doe"
                                 ▼
                        ┌─────────────────┐
                        │   STATE: AGE    │
                        │  "Enter age"    │
                        └────────┬────────┘
                                 │ User: "30"
                                 ▼
                        ┌─────────────────┐
                        │   STATE: SEX    │
                        │  "Enter sex"    │
                        └────────┬────────┘
                                 │ User: "Male"
                                 ▼
                    ┌─────────────────────────┐
                    │ STATE: PATIENT_CREATION │
                    │  (Internal - No User    │
                    │   Interaction)          │
                    │  • Call API             │
                    │  • Create patient       │
                    │  • Store patient_id     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ STATE: DOCTOR   │
                        │ • Fetch doctors │
                        │ • Show list     │
                        └────────┬────────┘
                                 │
                                 ▼
         ┌───────────────────────────────────────────────────────┐
         │         STATE: NATURAL_LANGUAGE                        │
         │                                                        │
         │  Bot: "Tell me your appointment details in your       │
         │        own words. For example:                        │
         │        'I want Dr. Sandeep tomorrow at 2pm'"          │
         │                                                        │
         └────────────────────────┬──────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────────┐
         │                                                      │
         │  User can provide info in many ways:                │
         │  • "I want Dr. Sandeep tomorrow at 2pm"            │
         │  • "Book with Dr. Smith"                            │
         │  • "Tomorrow at 10am"                               │
         │  • "I need to see Sandeep Das on 2026-01-15"       │
         │                                                      │
         └────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   GEMINI AI PROCESSING   │
                    │                          │
                    │  1. Parse user message   │
                    │  2. Extract fields:      │
                    │     • doctor            │
                    │     • doctor_id         │
                    │     • date              │
                    │     • hour              │
                    │  3. Validate data        │
                    │  4. Return JSON          │
                    └──────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌────────────────────┐      ┌────────────────────┐
    │  ALL FIELDS FOUND  │      │ MISSING FIELDS     │
    │                    │      │                    │
    │  • doctor ✓        │      │  • doctor ✓        │
    │  • date ✓          │      │  • date ?          │
    │  • hour ✓          │      │  • hour ?          │
    └────────┬───────────┘      └────────┬───────────┘
             │                           │
             │                           │ Ask for missing
             │                           │ field
             │                           │
             │                           ▼
             │                  ┌──────────────────┐
             │                  │ Bot: "What date  │
             │                  │  would you like?"│
             │                  └────────┬─────────┘
             │                           │
             │                           │ User provides
             │                           │ more info
             │                           │
             │                           ▼
             │                  ┌──────────────────┐
             │                  │ Process with AI  │
             │                  │ again            │
             │                  └────────┬─────────┘
             │                           │
             └───────────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ STATE: COMPLETE │
                        │                 │
                        │ • Validate all  │
                        │ • Create appt   │
                        │ • Send confirm  │
                        └────────┬────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   APPOINTMENT BOOKED    │
                    │                         │
                    │  📝 Name: John Doe      │
                    │  🎂 Age: 30             │
                    │  👤 Gender: Male        │
                    │  🆔 ID: 12345           │
                    │  👨‍⚕️ Doctor: Sandeep   │
                    │  📅 Date: 2026-01-04    │
                    │  ⏰ Time: 14:00         │
                    └────────┬────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Clear session  │
                    │  & user data    │
                    └─────────────────┘
```

## AI Processing Detail

```
┌───────────────────────────────────────────────────────────────┐
│                  NATURAL LANGUAGE INPUT                        │
│  "I want an appointment with Dr. Sandeep tomorrow at 2pm"     │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  GEMINI AI MODEL    │
                    │  (gemini-2.0-flash) │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   AI EXTRACTS:      │
                    │                     │
                    │  "Dr. Sandeep"     │
                    │    ↓ Match doctor  │
                    │  doctor: "Sandeep  │
                    │          Das"      │
                    │  doctor_id: "1"    │
                    │                     │
                    │  "tomorrow"        │
                    │    ↓ Convert date  │
                    │  date: "2026-01-04"│
                    │                     │
                    │  "2pm"             │
                    │    ↓ Convert time  │
                    │  hour: "14:00"     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   JSON RESPONSE:    │
                    │  {                  │
                    │    doctor: "..."    │
                    │    doctor_id: 1     │
                    │    date: "..."      │
                    │    hour: "..."      │
                    │    confidence: {...}│
                    │    missing: []      │
                    │  }                  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   VALIDATION        │
                    │                     │
                    │  ✓ Date valid?      │
                    │  ✓ Time valid?      │
                    │  ✓ Doctor exists?   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  UPDATE SESSION     │
                    │  Store in Redis     │
                    └─────────────────────┘
```

## Example Scenarios

### Scenario 1: Complete Information
```
User: "I want Dr. Sandeep tomorrow at 2pm"
  ↓
AI Extracts:
  • doctor: "Sandeep Das" ✓
  • doctor_id: 1 ✓
  • date: "2026-01-04" ✓
  • hour: "14:00" ✓
  ↓
Bot: "✅ Appointment confirmed!"
```

### Scenario 2: Partial Information (Doctor Only)
```
User: "I want Dr. Smith"
  ↓
AI Extracts:
  • doctor: "Dr. Smith" ✓
  • doctor_id: 2 ✓
  • date: null ✗
  • hour: null ✗
  ↓
Bot: "What date would you like for your appointment?"
  ↓
User: "Tomorrow"
  ↓
AI Extracts:
  • date: "2026-01-04" ✓
  • hour: null ✗
  ↓
Bot: "What time would you prefer?"
  ↓
User: "10am"
  ↓
AI Extracts:
  • hour: "10:00" ✓
  ↓
Bot: "✅ Appointment confirmed!"
```

### Scenario 3: Date and Time Only
```
(Assume doctor already selected in previous conversation)

User: "Tomorrow at 3pm"
  ↓
AI Extracts:
  • doctor: null (already set) ✓
  • date: "2026-01-04" ✓
  • hour: "15:00" ✓
  ↓
Bot: "✅ Appointment confirmed!"
```

## Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   WhatsApp   │      │   Express    │      │    Redis     │
│    User      │─────▶│   Webhook    │─────▶│   Session    │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   Chatbot    │
                      │   Logic      │
                      └──────┬───────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Gemini   │      │ Patient  │      │ Doctor   │
    │   AI     │      │   API    │      │   API    │
    └──────────┘      └──────────┘      └──────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Appointment  │
                      │     API      │
                      └──────────────┘
```

## Redis Data Structure

```
session:{wa_id}
{
  "wa_id": "1234567890",
  "state": "NATURAL_LANGUAGE",
  "created_at": "2026-01-03T...",
  "updated_at": "2026-01-03T..."
}

collected:{wa_id}
{
  "name": "John Doe",
  "age": "30",
  "sex": "Male",
  "patient_id": "12345",
  "doctor": "Sandeep Das",
  "doctor_id": "1",
  "date": "2026-01-04",
  "hour": "14:00",
  "doctors_list": "[{...}]",
  "last_updated": "2026-01-03T..."
}

processed:{wa_id}:{message_id}
"1"  (expires after 24 hours)
```

## Key Benefits of Natural Language Flow

1. **Faster Booking** - Users can provide all info at once
2. **Natural Conversation** - Feels like talking to a person
3. **Flexible Input** - Multiple ways to say the same thing
4. **Progressive Enhancement** - Falls back gracefully if AI fails
5. **Context Aware** - Remembers what's already collected
6. **Intelligent Validation** - Catches errors early
7. **Better UX** - Less rigid, more conversational

## Technical Stack

```
┌─────────────────────────────────────────────────┐
│                Frontend Layer                    │
│             WhatsApp Business API                │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│              Application Layer                   │
│  • Express.js (Webhook Server)                  │
│  • Chatbot Logic (State Machine)                │
│  • Queue Processor                               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│              AI & Services Layer                 │
│  • Google Gemini AI (NLP)                       │
│  • Patient API                                   │
│  • Doctor API                                    │
│  • Appointment API                               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│               Data Layer                         │
│  • Redis (Session & State)                      │
│  • Backend Database (via APIs)                   │
└──────────────────────────────────────────────────┘
```
