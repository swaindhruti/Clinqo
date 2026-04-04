/**
 * appointment-types.js - Appointment type definitions and type-specific questions
 * Each appointment type maps to a doctor specialty and has its own set of questions.
 */

const APPOINTMENT_TYPES = [
  {
    key: 'PEDIATRIC',
    specialty: 'Pediatrics',
    label: { en: 'Pediatric', hi: 'बाल रोग', od: 'ଶିଶୁ ରୋଗ' },
    emoji: '👶',
    questions: [
      {
        key: 'child_age',
        prompt: {
          en: "What is the child's age?",
          hi: "बच्चे की उम्र क्या है?",
          od: "ପିଲାଙ୍କ ବୟସ କେତେ?"
        }
      },
      {
        key: 'symptoms',
        prompt: {
          en: "What are the symptoms?\n1. Fever\n2. Cough\n3. Rash\n4. Growth concern\n5. Vaccination\n6. Other",
          hi: "लक्षण क्या हैं?\n1. बुखार\n2. खांसी\n3. दाने\n4. विकास संबंधी चिंता\n5. टीकाकरण\n6. अन्य",
          od: "ଲକ୍ଷଣ କ'ଣ?\n1. ଜ୍ୱର\n2. କାଶ\n3. ଦାନା\n4. ବୃଦ୍ଧି ସମ୍ପର୍କିତ\n5. ଟୀକାକରଣ\n6. ଅନ୍ୟ"
        }
      },
      {
        key: 'emergency',
        prompt: {
          en: "Is this an emergency?\n1. Yes\n2. No",
          hi: "क्या यह आपातकाल है?\n1. हाँ\n2. नहीं",
          od: "ଏହା ଜରୁରୀକାଳୀନ କି?\n1. ହଁ\n2. ନା"
        }
      }
    ]
  },
  {
    key: 'GYNECOLOGY',
    specialty: 'Gynecology',
    label: { en: 'Gynecology', hi: 'स्त्री रोग', od: 'ସ୍ତ୍ରୀ ରୋଗ' },
    emoji: '🩺',
    questions: [
      {
        key: 'reason',
        prompt: {
          en: "What is the reason for your visit?\n1. Routine checkup\n2. Pregnancy\n3. Menstrual issues\n4. Other",
          hi: "आपकी यात्रा का कारण क्या है?\n1. नियमित जांच\n2. गर्भावस्था\n3. मासिक धर्म की समस्या\n4. अन्य",
          od: "ଆପଣଙ୍କ ସାକ୍ଷାତର କାରଣ କ'ଣ?\n1. ନିୟମିତ ଯାଞ୍ଚ\n2. ଗର୍ଭାବସ୍ଥା\n3. ଋତୁସ୍ରାବ ସମସ୍ୟା\n4. ଅନ୍ୟ"
        }
      },
      {
        key: 'weeks_pregnant',
        prompt: {
          en: "If pregnant, how many weeks? (Enter 0 if not applicable)",
          hi: "यदि गर्भवती हैं, तो कितने सप्ताह? (लागू नहीं होने पर 0 दर्ज करें)",
          od: "ଯଦି ଗର୍ଭବତୀ, କେତେ ସପ୍ତାହ? (ଲାଗୁ ନ ହେଲେ 0 ଲେଖନ୍ତୁ)"
        }
      },
      {
        key: 'medications',
        prompt: {
          en: "Are you taking any current medications? If yes, please list them. If no, type 'none'.",
          hi: "क्या आप वर्तमान में कोई दवा ले रहे हैं? यदि हाँ, तो उन्हें लिखें। यदि नहीं, तो 'none' लिखें।",
          od: "ଆପଣ ବର୍ତ୍ତମାନ କୌଣସି ଔଷଧ ଖାଉଛନ୍ତି କି? ହଁ ହେଲେ ସେଗୁଡ଼ିକୁ ଲେଖନ୍ତୁ। ନା ହେଲେ 'none' ଲେଖନ୍ତୁ।"
        }
      }
    ]
  },
  {
    key: 'ORTHOPEDIC',
    specialty: 'Orthopedics',
    label: { en: 'Orthopedic', hi: 'हड्डी रोग', od: 'ହାଡ ରୋଗ' },
    emoji: '🦴',
    questions: [
      {
        key: 'pain_area',
        prompt: {
          en: "Where is the pain?\n1. Back\n2. Knee\n3. Shoulder\n4. Hip\n5. Other",
          hi: "दर्द कहाँ है?\n1. पीठ\n2. घुटना\n3. कंधा\n4. कूल्हा\n5. अन्य",
          od: "ଯନ୍ତ୍ରଣା କେଉଁଠାରେ?\n1. ପିଠି\n2. ଆଣ୍ଠୁ\n3. କାନ୍ଧ\n4. ନିତମ୍ବ\n5. ଅନ୍ୟ"
        }
      },
      {
        key: 'duration',
        prompt: {
          en: "How long have you had this pain? (e.g., 2 days, 1 week, 3 months)",
          hi: "यह दर्द कब से है? (जैसे, 2 दिन, 1 सप्ताह, 3 महीने)",
          od: "ଏହି ଯନ୍ତ୍ରଣା କେବେଠାରୁ? (ଯେପରି, 2 ଦିନ, 1 ସପ୍ତାହ, 3 ମାସ)"
        }
      },
      {
        key: 'previous_surgery',
        prompt: {
          en: "Have you had any previous surgery in this area?\n1. Yes\n2. No",
          hi: "क्या इस क्षेत्र में पहले कोई सर्जरी हुई है?\n1. हाँ\n2. नहीं",
          od: "ଏହି ଅଞ୍ଚଳରେ ପୂର୍ବରୁ କୌଣସି ଅସ୍ତ୍ରୋପଚାର ହୋଇଛି କି?\n1. ହଁ\n2. ନା"
        }
      }
    ]
  },
  {
    key: 'DERMATOLOGY',
    specialty: 'Dermatology',
    label: { en: 'Dermatology', hi: 'त्वचा रोग', od: 'ଚର୍ମ ରୋଗ' },
    emoji: '🧴',
    questions: [
      {
        key: 'skin_concern',
        prompt: {
          en: "What is your skin concern?\n1. Acne\n2. Rash\n3. Hair loss\n4. Pigmentation\n5. Other",
          hi: "आपकी त्वचा संबंधी चिंता क्या है?\n1. मुँहासे\n2. दाने\n3. बालों का झड़ना\n4. पिगमेंटेशन\n5. अन्य",
          od: "ଆପଣଙ୍କ ଚର୍ମ ସମ୍ପର୍କିତ ସମସ୍ୟା କ'ଣ?\n1. ବ୍ରଣ\n2. ଦାନା\n3. କେଶ ଝଡ଼ା\n4. ପିଗମେଣ୍ଟେସନ\n5. ଅନ୍ୟ"
        }
      },
      {
        key: 'duration',
        prompt: {
          en: "How long have you had this condition? (e.g., 2 days, 1 week, 3 months)",
          hi: "यह समस्या कब से है? (जैसे, 2 दिन, 1 सप्ताह, 3 महीने)",
          od: "ଏହି ସମସ୍ୟା କେବେଠାରୁ? (ଯେପରି, 2 ଦିନ, 1 ସପ୍ତାହ, 3 ମାସ)"
        }
      },
      {
        key: 'allergies',
        prompt: {
          en: "Do you have any known allergies? If yes, please list them. If no, type 'none'.",
          hi: "क्या आपको कोई ज्ञात एलर्जी है? यदि हाँ, तो उन्हें लिखें। यदि नहीं, तो 'none' लिखें।",
          od: "ଆପଣଙ୍କର କୌଣସି ଜଣାଶୁଣା ଆଲର୍ଜି ଅଛି କି? ହଁ ହେଲେ ସେଗୁଡ଼ିକୁ ଲେଖନ୍ତୁ। ନା ହେଲେ 'none' ଲେଖନ୍ତୁ।"
        }
      }
    ]
  }
];

/**
 * Get appointment type by index (1-based).
 */
function getTypeByIndex(index) {
  return APPOINTMENT_TYPES[index - 1] || null;
}

/**
 * Get appointment type by key.
 */
function getTypeByKey(key) {
  return APPOINTMENT_TYPES.find(t => t.key === key) || null;
}

/**
 * Get the label for an appointment type in the given language.
 */
function getTypeLabel(typeKey, lang) {
  const type = getTypeByKey(typeKey);
  if (!type) return typeKey;
  return type.label[lang] || type.label['en'];
}

module.exports = {
  APPOINTMENT_TYPES,
  getTypeByIndex,
  getTypeByKey,
  getTypeLabel
};
