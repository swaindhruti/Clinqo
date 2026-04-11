/**
 * i18n.js - Internationalization module for Clinqo WhatsApp Chatbot
 * Supports: English (en), Hindi (hi), Odia (od)
 */

const MESSAGES = {
  welcome: {
    en: "Welcome to Clinqo! 👋\n\nPlease choose your language:",
    hi: "क्लिनक्यो में आपका स्वागत है! 👋\n\nकृपया अपनी भाषा चुनें:",
    od: "କ୍ଲିନକୋରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ! 👋\n\nଦୟାକରି ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ:"
  },
  // ========== QR Entry & Menu ==========
  clinic_verified: {
    en: "🏥 Welcome to *{clinic_name}*!\n\nPlease choose your language:",
    hi: "🏥 *{clinic_name}* में आपका स्वागत है!\n\nकृपया अपनी भाषा चुनें:",
    od: "🏥 *{clinic_name}* ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ!\n\nଦୟାକରି ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ:"
  },
  invalid_clinic: {
    en: "❌ Sorry, the clinic ID is not valid. Please scan the correct QR code.",
    hi: "❌ क्षमा करें, क्लिनिक आईडी मान्य नहीं है। कृपया सही QR कोड स्कैन करें।",
    od: "❌ କ୍ଷମା କରନ୍ତୁ, କ୍ଲିନିକ୍ ଆଇଡି ବୈଧ ନୁହେଁ। ଦୟାକରି ସଠିକ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ।"
  },
  menu_prompt: {
    en: "Hello! 👋 How can we help?\n\n1. 📋 View upcoming appointments\n2. 💉 View upcoming procedures\n\n_To book a new appointment, please scan the clinic QR code._",
    hi: "नमस्ते! 👋 हम कैसे मदद कर सकते हैं?\n\n1. 📋 आगामी अपॉइंटमेंट देखें\n2. 💉 आगामी प्रक्रियाएँ देखें\n\n_नई अपॉइंटमेंट बुक करने के लिए क्लिनिक QR कोड स्कैन करें।_",
    od: "ନମସ୍କାର! 👋 ଆମେ କିପରି ସାହାଯ୍ୟ କରିବା?\n\n1. 📋 ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ ଦେଖନ୍ତୁ\n2. 💉 ଆଗାମୀ ପ୍ରକ୍ରିୟା ଦେଖନ୍ତୁ\n\n_ନୂଆ ଆପଏଣ୍ଟମେଣ୍ଟ ବୁକ୍ କରିବା ପାଇଁ କ୍ଲିନିକ୍ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ।_"
  },
  invalid_menu: {
    en: "Please enter 1 or 2.",
    hi: "कृपया 1 या 2 दर्ज करें।",
    od: "ଦୟାକରି 1 ବା 2 ଲେଖନ୍ତୁ।"
  },
  no_patient_found_menu: {
    en: "No records found for your number. Please scan a clinic QR code to book your first appointment.",
    hi: "आपके नंबर के लिए कोई रिकॉर्ड नहीं मिला। पहली अपॉइंटमेंट बुक करने के लिए क्लिनिक QR कोड स्कैन करें।",
    od: "ଆପଣଙ୍କ ନମ୍ବର ପାଇଁ କୌଣସି ରେକର୍ଡ ମିଳିଲା ନାହିଁ। ପ୍ରଥମ ଆପଏଣ୍ଟମେଣ୍ଟ ବୁକ୍ କରିବା ପାଇଁ କ୍ଲିନିକ୍ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ।"
  },
  upcoming_header: {
    en: "📋 Your upcoming appointments:\n",
    hi: "📋 आपकी आगामी अपॉइंटमेंट:\n",
    od: "📋 ଆପଣଙ୍କର ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ:\n"
  },
  past_header: {
    en: "📜 Your recent appointments:\n",
    hi: "📜 आपकी हालिया अपॉइंटमेंट:\n",
    od: "📜 ଆପଣଙ୍କର ସାମ୍ପ୍ରତିକ ଆପଏଣ୍ଟମେଣ୍ଟ:\n"
  },
  appt_list_item: {
    en: "{index}. Dr. {doctor} — {date} ({status})",
    hi: "{index}. डॉ. {doctor} — {date} ({status})",
    od: "{index}. ଡାକ୍ତର {doctor} — {date} ({status})"
  },
  upcoming_with_code_item: {
    en: "{index}. 📅 {date} | ⏰ {time}\n🔑 Check-in Code: {code}",
    hi: "{index}. 📅 {date} | ⏰ {time}\n🔑 चेक-इन कोड: {code}",
    od: "{index}. 📅 {date} | ⏰ {time}\n🔑 ଚେକ୍-ଇନ୍ କୋଡ୍: {code}"
  },
  procedure_list_item: {
    en: "{index}. {sub_category} — {date} ({status})",
    hi: "{index}. {sub_category} — {date} ({status})",
    od: "{index}. {sub_category} — {date} ({status})"
  },
  no_upcoming: {
    en: "No upcoming appointments found.\n\nScan a clinic QR code to book one! 👋",
    hi: "कोई आगामी अपॉइंटमेंट नहीं मिली।\n\nबुक करने के लिए क्लिनिक QR कोड स्कैन करें! 👋",
    od: "କୌଣସି ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ ମିଳିଲା ନାହିଁ।\n\nବୁକ୍ କରିବା ପାଇଁ କ୍ଲିନିକ୍ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ! 👋"
  },
  upcoming_procedures_header: {
    en: "💉 Your upcoming procedures:\n",
    hi: "💉 आपकी आगामी प्रक्रियाएँ:\n",
    od: "💉 ଆପଣଙ୍କର ଆଗାମୀ ପ୍ରକ୍ରିୟା:\n"
  },
  no_upcoming_procedures: {
    en: "No upcoming procedures found.\n\nScan a clinic QR code to book one! 👋",
    hi: "कोई आगामी प्रक्रिया नहीं मिली।\n\nबुक करने के लिए क्लिनिक QR कोड स्कैन करें! 👋",
    od: "କୌଣସି ଆଗାମୀ ପ୍ରକ୍ରିୟା ମିଳିଲା ନାହିଁ।\n\nବୁକ୍ କରିବା ପାଇଁ କ୍ଲିନିକ୍ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ! 👋"
  },
  no_past: {
    en: "No past appointments found.\n\nScan a clinic QR code to book your first! 👋",
    hi: "कोई पास्ट अपॉइंटमेंट नहीं मिली।\n\nपहली बुकिंग के लिए QR कोड स्कैन करें! 👋",
    od: "କୌଣସି ପୂର୍ବ ଆପଏଣ୍ଟମେଣ୍ଟ ମିଳିଲା ନାହିଁ।\n\nପ୍ରଥମ ବୁକିଂ ପାଇଁ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ! 👋"
  },
  past_procedures_header: {
    en: "🧾 Your recent procedures:\n",
    hi: "🧾 आपकी हालिया प्रक्रियाएँ:\n",
    od: "🧾 ଆପଣଙ୍କର ସାମ୍ପ୍ରତିକ ପ୍ରକ୍ରିୟା:\n"
  },
  no_past_procedures: {
    en: "No past procedures found.\n\nScan a clinic QR code to book your first! 👋",
    hi: "कोई पिछली प्रक्रिया नहीं मिली।\n\nपहली बुकिंग के लिए QR कोड स्कैन करें! 👋",
    od: "କୌଣସି ପୂର୍ବ ପ୍ରକ୍ରିୟା ମିଳିଲା ନାହିଁ।\n\nପ୍ରଥମ ବୁକିଂ ପାଇଁ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ! 👋"
  },
  view_done: {
    en: "\nSend any message to see the menu again. 👋",
    hi: "\nमेनू फिर से देखने के लिए कोई भी मैसेज भेजें। 👋",
    od: "\nମେନୁ ପୁଣି ଦେଖିବା ପାଇଁ ଯେକୌଣସି ମେସେଜ୍ ପଠାନ୍ତୁ। 👋"
  },
  welcome_back: {
    en: "Welcome back, {name}! 👋",
    hi: "वापस स्वागत है, {name}! 👋",
    od: "ପୁଣି ସ୍ୱାଗତ, {name}! 👋"
  },
  language_options: {
    en: "1. English\n2. हिन्दी (Hindi)\n3. ଓଡ଼ିଆ (Odia)",
    hi: "1. English\n2. हिन्दी (Hindi)\n3. ଓଡ଼ିଆ (Odia)",
    od: "1. English\n2. हिन्दी (Hindi)\n3. ଓଡ଼ିଆ (Odia)"
  },
  invalid_language: {
    en: "Please enter 1, 2, or 3 to select a language.",
    hi: "कृपया भाषा चुनने के लिए 1, 2, या 3 दर्ज करें।",
    od: "ଦୟାକରି ଭାଷା ବାଛିବା ପାଇଁ 1, 2, ବା 3 ଲେଖନ୍ତୁ।"
  },
  patient_type_prompt: {
    en: "Are you a new or returning patient?\n\n1. 🆕 New Patient\n2. 🔄 Returning Patient",
    hi: "क्या आप नए या पुराने मरीज हैं?\n\n1. 🆕 नया मरीज\n2. 🔄 पुराना मरीज",
    od: "ଆପଣ ନୂଆ କି ପୁରୁଣା ରୋଗୀ?\n\n1. 🆕 ନୂଆ ରୋଗୀ\n2. 🔄 ପୁରୁଣା ରୋଗୀ"
  },
  btn_new_patient: {
    en: "🆕 New Patient",
    hi: "🆕 नया मरीज",
    od: "🆕 ନୂଆ ରୋଗୀ"
  },
  btn_returning_patient: {
    en: "🔄 Returning",
    hi: "🔄 पुराना मरीज",
    od: "🔄 ପୁରୁଣା ରୋଗୀ"
  },
  invalid_patient_type: {
    en: "Please enter 1 (New Patient) or 2 (Returning Patient).",
    hi: "कृपया 1 (नया मरीज) या 2 (पुराना मरीज) दर्ज करें।",
    od: "ଦୟାକରି 1 (ନୂଆ ରୋଗୀ) ବା 2 (ପୁରୁଣା ରୋଗୀ) ଲେଖନ୍ତୁ।"
  },
  ask_name: {
    en: "Please enter your full name:",
    hi: "कृपया अपना पूरा नाम दर्ज करें:",
    od: "ଦୟାକରି ଆପଣଙ୍କ ପୂରା ନାମ ଲେଖନ୍ତୁ:"
  },
  ask_age: {
    en: "Please enter your age:",
    hi: "कृपया अपनी उम्र दर्ज करें:",
    od: "ଦୟାକରି ଆପଣଙ୍କ ବୟସ ଲେଖନ୍ତୁ:"
  },
  ask_sex: {
    en: "Please choose your gender:",
    hi: "कृपया अपना लिंग चुनें:",
    od: "ଦୟାକରି ଆପଣଙ୍କ ଲିଙ୍ଗ ବାଛନ୍ତୁ:"
  },
  gender_male: {
    en: "Male",
    hi: "पुरुष",
    od: "ପୁରୁଷ"
  },
  gender_female: {
    en: "Female",
    hi: "महिला",
    od: "ମହିଳା"
  },
  invalid_sex: {
    en: "Please select 1 (Male) or 2 (Female).",
    hi: "कृपया 1 (पुरुष) या 2 (महिला) चुनें।",
    od: "ଦୟାକରି 1 (ପୁରୁଷ) ବା 2 (ମହିଳା) ବାଛନ୍ତୁ।"
  },
  patient_created: {
    en: "✅ Your profile has been created successfully!\n🆔 Patient ID: {patient_id}",
    hi: "✅ आपकी प्रोफ़ाइल सफलतापूर्वक बनाई गई!\n🆔 मरीज आईडी: {patient_id}",
    od: "✅ ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ସଫଳତାର ସହ ତିଆରି ହୋଇଛି!\n🆔 ରୋଗୀ ଆଇଡି: {patient_id}"
  },
  patient_not_found: {
    en: "❌ No records found for your phone number. Let's register you as a new patient.",
    hi: "❌ आपके फोन नंबर के लिए कोई रिकॉर्ड नहीं मिला। चलिए आपको नए मरीज के रूप में दर्ज करते हैं।",
    od: "❌ ଆପଣଙ୍କ ଫୋନ ନମ୍ବର ପାଇଁ କୌଣସି ରେକର୍ଡ ମିଳିଲା ନାହିଁ। ଆସନ୍ତୁ ଆପଣଙ୍କୁ ନୂଆ ରୋଗୀ ଭାବରେ ପଞ୍ଜୀକୃତ କରିବା।"
  },
  past_appointments_header: {
    en: "📋 Your recent appointments:\n",
    hi: "📋 आपकी हालिया अपॉइंटमेंट:\n",
    od: "📋 ଆପଣଙ୍କର ସାମ୍ପ୍ରତିକ ଆପଏଣ୍ଟମେଣ୍ଟ:\n"
  },
  past_appointments_item: {
    en: "{index}. Dr. {doctor} — {date} ({status})",
    hi: "{index}. डॉ. {doctor} — {date} ({status})",
    od: "{index}. ଡାକ୍ତର {doctor} — {date} ({status})"
  },
  choose_followup: {
    en: "\nWhich appointment would you like to follow up on? Enter the number:",
    hi: "\nकिस अपॉइंटमेंट का फॉलो-अप करना चाहेंगे? नंबर दर्ज करें:",
    od: "\nକେଉଁ ଆପଏଣ୍ଟମେଣ୍ଟର ଫଲୋ-ଅପ୍ କରିବାକୁ ଚାହୁଁଛନ୍ତି? ନମ୍ବର ଲେଖନ୍ତୁ:"
  },
  no_past_appointments: {
    en: "No past appointments found. Let's register you as a new patient.",
    hi: "कोई पुरानी अपॉइंटमेंट नहीं मिली। चलिए आपको नए मरीज के रूप में दर्ज करते हैं।",
    od: "କୌଣସି ପୁରୁଣା ଆପଏଣ୍ଟମେଣ୍ଟ ମିଳିଲା ନାହିଁ। ଆସନ୍ତୁ ଆପଣଙ୍କୁ ନୂଆ ରୋଗୀ ଭାବରେ ପଞ୍ଜୀକୃତ କରିବା।"
  },
  invalid_selection: {
    en: "Invalid selection. Please enter a valid number from the list.",
    hi: "अमान्य चयन। कृपया सूची से एक मान्य नंबर दर्ज करें।",
    od: "ଅବୈଧ ଚୟନ। ଦୟାକରି ତାଲିକାରୁ ଏକ ବୈଧ ନମ୍ବର ଲେଖନ୍ତୁ।"
  },
  appt_type_prompt: {
    en: "What type of appointment do you need?\n\n1. 👶 Pediatric\n2. 🩺 Gynecology\n3. 🦴 Orthopedic\n4. 🧴 Dermatology",
    hi: "आपको किस प्रकार की अपॉइंटमेंट चाहिए?\n\n1. 👶 बाल रोग\n2. 🩺 स्त्री रोग\n3. 🦴 हड्डी रोग\n4. 🧴 त्वचा रोग",
    od: "ଆପଣଙ୍କୁ କେଉଁ ପ୍ରକାରର ଆପଏଣ୍ଟମେଣ୍ଟ ଦରକାର?\n\n1. 👶 ଶିଶୁ ରୋଗ\n2. 🩺 ସ୍ତ୍ରୀ ରୋଗ\n3. 🦴 ହାଡ ରୋଗ\n4. 🧴 ଚର୍ମ ରୋଗ"
  },
  invalid_appt_type: {
    en: "Please enter a number between 1 and 4.",
    hi: "कृपया 1 से 4 के बीच एक नंबर दर्ज करें।",
    od: "ଦୟାକରି 1 ରୁ 4 ମଧ୍ୟରେ ଏକ ନମ୍ବର ଲେଖନ୍ତୁ।"
  },
  clinics_header: {
    en: "🏥 Available clinics for {type}:\n",
    hi: "🏥 {type} के लिए उपलब्ध क्लिनिक:\n",
    od: "🏥 {type} ପାଇଁ ଉପಲବ୍ଧ କ୍ଲିନିକ୍:\n"
  },
  clinics_item: {
    en: "{index}. {name} — {address}",
    hi: "{index}. {name} — {address}",
    od: "{index}. {name} — {address}"
  },
  pick_clinic: {
    en: "\nSelect a clinic by entering the number:",
    hi: "\nक्लिनिक चुनने के लिए नंबर दर्ज करें:",
    od: "\nକ୍ଲିନିକ୍ ବାଛିବା ପାଇଁ ନମ୍ବର ଲେଖନ୍ତୁ:"
  },
  no_clinics: {
    en: "Sorry, no clinics available for this specialty. Please try a different appointment type.",
    hi: "क्षमा करें, इस विशेषता के लिए कोई क्लिनिक उपलब्ध नहीं है। कृपया एक अलग अपॉइंटमेंट प्रकार चुनें।",
    od: "କ୍ଷମା କରନ୍ତୁ, ଏହି ବିଶେଷତା ପାଇଁ କୌଣସି କ୍ଲିନିକ୍ ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ଏକ ଭିନ୍ନ ଆପଏଣ୍ଟମେଣ୍ଟ ପ୍ରକାର ବାଛନ୍ତୁ।"
  },
  doctors_header: {
    en: "👨‍⚕️ Available doctors:\n",
    hi: "👨‍⚕️ उपलब्ध डॉक्टर:\n",
    od: "👨‍⚕️ ଉପଲବ୍ଧ ଡାକ୍ତର:\n"
  },
  doctors_item: {
    en: "{index}. Dr. {name} — {specialty}",
    hi: "{index}. डॉ. {name} — {specialty}",
    od: "{index}. ଡାକ୍ତର {name} — {specialty}"
  },
  pick_doctor: {
    en: "\nSelect a doctor by entering the number:",
    hi: "\nडॉक्टर चुनने के लिए नंबर दर्ज करें:",
    od: "\nଡାକ୍ତର ବାଛିବା ପାଇଁ ନମ୍ବର ଲେଖନ୍ତୁ:"
  },
  no_doctors: {
    en: "Sorry, no doctors available at this clinic for the selected specialty.",
    hi: "क्षमा करें, चयनित विशेषता के लिए इस क्लिनिक में कोई डॉक्टर उपलब्ध नहीं है।",
    od: "କ୍ଷମା କରନ୍ତୁ, ଚୟନିତ ବିଶେଷତା ପାଇଁ ଏହି କ୍ଲିନିକରେ କୌଣସି ଡାକ୍ତର ଉପଲବ୍ଧ ନାହିଁ।"
  },
  dates_header: {
    en: "📅 Next 14 available dates:\n",
    hi: "📅 अगले 14 उपलब्ध तिथियाँ:\n",
    od: "📅 ପରବର୍ତ୍ତୀ 14 ଉପଲବ୍ଧ ତାରିଖ:\n"
  },
  dates_item: {
    en: "{index}. {date} ({day})",
    hi: "{index}. {date} ({day})",
    od: "{index}. {date} ({day})"
  },
  pick_date: {
    en: "\nSelect a date by entering the number:",
    hi: "\nतिथि चुनने के लिए नंबर दर्ज करें:",
    od: "\nତାରିଖ ବାଛିବା ପାଇଁ ନମ୍ବର ଲେଖନ୍ତୁ:"
  },
  no_dates: {
    en: "Sorry, no available dates in the next 14 days for this doctor. Please try another doctor.",
    hi: "क्षमा करें, इस डॉक्टर के लिए अगले 14 दिनों में कोई उपलब्ध तिथि नहीं है। कृपया दूसरा डॉक्टर चुनें।",
    od: "କ୍ଷମା କରନ୍ତୁ, ଏହି ଡାକ୍ତରଙ୍କ ପାଇଁ ପରବର୍ତ୍ତୀ 14 ଦିନରେ କୌଣସି ଉପଲବ୍ଧ ତାରିଖ ନାହିଁ। ଦୟାକରି ଅନ୍ୟ ଡାକ୍ତର ବାଛନ୍ତୁ।"
  },
  slots_header: {
    en: "⏰ Available time slots:\n",
    hi: "⏰ उपलब्ध समय स्लॉट:\n",
    od: "⏰ ଉପಲବ୍ଧ ସମୟ ସ୍ଲଟ୍:\n"
  },
  slots_item: {
    en: "{index}. {time}",
    hi: "{index}. {time}",
    od: "{index}. {time}"
  },
  pick_slot: {
    en: "\nSelect a time slot by entering the number:",
    hi: "\nसमय स्लॉट चुनने के लिए नंबर दर्ज करें:",
    od: "\nସମୟ ସ୍ଲଟ୍ ବାଛିବା ପାଇଁ ନମ୍ବର ଲେଖନ୍ତୁ:"
  },
  list_open_menu: {
    en: "Open menu",
    hi: "मेनू खोलें",
    od: "ମେନୁ ଖୋଲନ୍ତୁ"
  },
  list_choose: {
    en: "Choose",
    hi: "चुनें",
    od: "ବାଛନ୍ତୁ"
  },
  main_menu_title: {
    en: "Main Menu",
    hi: "मुख्य मेनू",
    od: "ମୁଖ୍ୟ ମେନୁ"
  },
  menu_upcoming_appointments_title: {
    en: "Upcoming appointments",
    hi: "आगामी अपॉइंटमेंट",
    od: "ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ"
  },
  menu_upcoming_appointments_desc: {
    en: "View upcoming appointments",
    hi: "आगामी अपॉइंटमेंट देखें",
    od: "ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ ଦେଖନ୍ତୁ"
  },
  menu_upcoming_procedures_title: {
    en: "Upcoming procedures",
    hi: "आगामी प्रक्रियाएँ",
    od: "ଆଗାମୀ ପ୍ରକ୍ରିୟା"
  },
  menu_upcoming_procedures_desc: {
    en: "View upcoming procedures",
    hi: "आगामी प्रक्रियाएँ देखें",
    od: "ଆଗାମୀ ପ୍ରକ୍ରିୟା ଦେଖନ୍ତୁ"
  },
  list_title_subcategories: {
    en: "Sub-categories",
    hi: "उप-श्रेणियाँ",
    od: "ଉପ-ଶ୍ରେଣୀ"
  },
  list_title_doctors: {
    en: "Doctors",
    hi: "डॉक्टर",
    od: "ଡାକ୍ତର"
  },
  list_title_dates: {
    en: "Available dates",
    hi: "उपलब्ध तिथियाँ",
    od: "ଉପଲବ୍ଧ ତାରିଖ"
  },
  list_title_slots: {
    en: "Available slots",
    hi: "उपलब्ध स्लॉट",
    od: "ଉପଲବ୍ଧ ସ୍ଲଟ୍"
  },
  list_desc_fee: {
    en: "Fee: {fee}",
    hi: "शुल्क: {fee}",
    od: "ଶୁଳ୍କ: {fee}"
  },
  list_desc_tap_select_time: {
    en: "Tap to select this time",
    hi: "यह समय चुनने के लिए टैप करें",
    od: "ଏହି ସମୟ ବାଛିବାକୁ ଟାପ୍ କରନ୍ତୁ"
  },
  no_slots: {
    en: "Sorry, no time slots available on this date. Please try another date.",
    hi: "क्षमा करें, इस तिथि पर कोई समय स्लॉट उपलब्ध नहीं है। कृपया दूसरी तिथि चुनें।",
    od: "କ୍ଷମା କରନ୍ତୁ, ଏହି ତାରିଖରେ କୌଣସି ସମୟ ସ୍ଲଟ୍ ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ଅନ୍ୟ ତାରିଖ ବାଛନ୍ତୁ।"
  },
  confirm_header: {
    en: "📋 Appointment Summary:\n",
    hi: "📋 अपॉइंटमेंट सारांश:\n",
    od: "📋 ଆପଏଣ୍ଟମେଣ୍ଟ ସାରାଂଶ:\n"
  },
  confirm_details: {
    en: "📝 Name: {name}\n🎂 Age: {age}\n👤 Gender: {sex}\n🆔 Patient ID: {patient_id}\n🏥 Clinic: {clinic}\n👨‍⚕️ Doctor: {doctor}\n📅 Date: {date}\n⏰ Time: {time}",
    hi: "📝 नाम: {name}\n🎂 उम्र: {age}\n👤 लिंग: {sex}\n🆔 मरीज आईडी: {patient_id}\n🏥 क्लिनिक: {clinic}\n👨‍⚕️ डॉक्टर: {doctor}\n📅 तिथि: {date}\n⏰ समय: {time}",
    od: "📝 ନାମ: {name}\n🎂 ବୟସ: {age}\n👤 ଲିଙ୍ଗ: {sex}\n🆔 ରୋଗୀ ଆଇଡି: {patient_id}\n🏥 କ୍ଲିନିକ୍: {clinic}\n👨‍⚕️ ଡାକ୍ତର: {doctor}\n📅 ତାରିଖ: {date}\n⏰ ସମୟ: {time}"
  },
  confirm_prompt: {
    en: "\nConfirm this appointment?\n1. ✅ Yes\n2. ❌ No (start over from appointment type)",
    hi: "\nक्या आप इस अपॉइंटमेंट की पुष्टि करते हैं?\n1. ✅ हाँ\n2. ❌ नहीं (अपॉइंटमेंट प्रकार से फिर से शुरू करें)",
    od: "\nଏହି ଆପଏଣ୍ଟମେଣ୍ଟ ନିଶ୍ଚିତ କରନ୍ତି?\n1. ✅ ହଁ\n2. ❌ ନା (ଆପଏଣ୍ଟମେଣ୍ଟ ପ୍ରକାରରୁ ପୁନର୍ବାର ଆରମ୍ଭ)"
  },
  btn_yes: {
    en: "✅ Yes",
    hi: "✅ हाँ",
    od: "✅ ହଁ"
  },
  btn_no: {
    en: "❌ No",
    hi: "❌ नहीं",
    od: "❌ ନା"
  },
  confirm_action_text: {
    en: "Confirm this appointment",
    hi: "इस अपॉइंटमेंट की पुष्टि करें",
    od: "ଏହି ଆପଏଣ୍ଟମେଣ୍ଟ ନିଶ୍ଚିତ କରନ୍ତୁ"
  },
  invalid_confirm: {
    en: "Please enter 1 (Yes) or 2 (No).",
    hi: "कृपया 1 (हाँ) या 2 (नहीं) दर्ज करें।",
    od: "ଦୟାକରି 1 (ହଁ) ବା 2 (ନା) ଲେଖନ୍ତୁ।"
  },
  booking_success: {
    en: "🎉 Your appointment has been confirmed!\n\n{details}\n\n🔑 Check-in Code: *{check_in_code}*\n\nShow this QR code at the front desk to check in:\n{qr_url}\n\nSend any message to book another appointment. 👋",
    hi: "🎉 आपकी अपॉइंटमेंट की पुष्टि हो गई!\n\n{details}\n\n🔑 चेक-इन कोड: *{check_in_code}*\n\nचेक-इन करने के लिए फ्रंट डेस्क पर यह QR कोड दिखाएं:\n{qr_url}\n\nएक और अपॉइंटमेंट बुक करने के लिए कोई भी मैसेज भेजें। 👋",
    od: "🎉 ଆପଣଙ୍କ ଆପଏଣ୍ଟମେଣ୍ଟ ନିଶ୍ଚିତ ହୋଇଛି!\n\n{details}\n\n🔑 ଚେକ୍-ଇନ୍ କୋଡ୍: *{check_in_code}*\n\nଚେକ-ଇନ୍ କରିବା ପାଇଁ ଫ୍ରଣ୍ଟ ଡେସ୍କରେ ଏହି QR କୋଡ୍ ଦେଖାନ୍ତୁ:\n{qr_url}\n\nଆଉ ଏକ ଆପଏଣ୍ଟମେଣ୍ଟ ବୁକ୍ କରିବା ପାଇଁ ଯେକୌଣସି ମେସେଜ୍ ପଠାନ୍ତୁ। 👋"
  },
  booking_error: {
    en: "❌ Sorry, there was an error booking your appointment. Please try again by sending \"end\" and starting over.",
    hi: "❌ क्षमा करें, अपॉइंटमेंट बुक करने में एक त्रुटि हुई। कृपया \"end\" भेजकर फिर से शुरू करें।",
    od: "❌ କ୍ଷମା କରନ୍ତୁ, ଆପଏଣ୍ଟମେଣ୍ଟ ବୁକ୍ କରିବାରେ ଏକ ତ୍ରୁଟି ହୋଇଛି। ଦୟାକରି \"end\" ପଠାଇ ପୁନର୍ବାର ଆରମ୍ଭ କରନ୍ତୁ।"
  },
  end_message: {
    en: "Your ongoing appointment ended. 👋\n\nSend any message to start again.",
    hi: "आपकी चल रही अपॉइंटमेंट समाप्त हुई। 👋\n\nफिर से शुरू करने के लिए कोई भी मैसेज भेजें।",
    od: "ଆପଣଙ୍କ ଚାଲୁ ଆପଏଣ୍ଟମେଣ୍ଟ ସମାପ୍ତ ହୋଇଛି। 👋\n\nପୁନର୍ବାର ଆରମ୍ଭ କରିବା ପାଇଁ ଯେକୌଣସି ମେସେଜ୍ ପଠାନ୍ତୁ।"
  },
  already_complete: {
    en: "Your appointment information has been recorded. Thank you!",
    hi: "आपकी अपॉइंटमेंट की जानकारी दर्ज कर ली गई है। धन्यवाद!",
    od: "ଆପଣଙ୍କ ଆପଏଣ୍ଟମେଣ୍ଟର ସୂଚନା ରେକର୍ଡ କରାଯାଇଛି। ଧନ୍ୟବାଦ!"
  },
  generic_error: {
    en: "Sorry, something went wrong. Please try again or send \"end\" to restart.",
    hi: "क्षमा करें, कुछ गलत हो गया। कृपया फिर से कोशिश करें या \"end\" भेजकर पुनः शुरू करें।",
    od: "କ୍ଷମା କରନ୍ତୁ, କିଛି ଭୁଲ ହୋଇଛି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ ବା \"end\" ପଠାଇ ପୁନଃ ଆରମ୍ଭ କରନ୍ତୁ।"
  },
  type_questions_header: {
    en: "📝 A few more questions about your visit:\n",
    hi: "📝 आपकी यात्रा के बारे में कुछ और सवाल:\n",
    od: "📝 ଆପଣଙ୍କ ସାକ୍ଷାତ ବିଷୟରେ ଆଉ କିଛି ପ୍ରଶ୍ନ:\n"
  },
  // ========== Visit Type Branching ==========
  visit_type_prompt: {
    en: "How can we help you today?\n\n1. 🩺 Consultation\n2. 💉 Procedure\n3. ❓ General Query",
    hi: "आज हम आपकी कैसे मदद कर सकते हैं?\n\n1. 🩺 परामर्श\n2. 💉 प्रक्रिया\n3. ❓ सामान्य प्रश्न",
    od: "ଆଜି ଆମେ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବା?\n\n1. 🩺 ପରାମର୍ଶ\n2. 💉 ପ୍ରକ୍ରିୟା\n3. ❓ ସାଧାରଣ ପ୍ରଶ୍ନ"
  },
  btn_consultation: {
    en: "🩺 Consultation",
    hi: "🩺 परामर्श",
    od: "🩺 ପରାମର୍ଶ"
  },
  btn_procedure: {
    en: "💉 Procedure",
    hi: "💉 प्रक्रिया",
    od: "💉 ପ୍ରକ୍ରିୟା"
  },
  btn_general_query: {
    en: "❓ General Query",
    hi: "❓ सामान्य प्रश्न",
    od: "❓ ସାଧାରଣ ପ୍ରଶ୍ନ"
  },
  invalid_visit_type: {
    en: "Please enter 1, 2, or 3.",
    hi: "कृपया 1, 2, या 3 दर्ज करें।",
    od: "ଦୟାକରି 1, 2, ବା 3 ଲେଖନ୍ତୁ।"
  },
  sub_category_header: {
    en: "Choose a sub-category:\n",
    hi: "एक उप-श्रेणी चुनें:\n",
    od: "ଏକ ଉପ-ଶ୍ରେଣୀ ବାଛନ୍ତୁ:\n"
  },
  sub_category_item: {
    en: "{index}. {emoji} {name} — {price}",
    hi: "{index}. {emoji} {name} — {price}",
    od: "{index}. {emoji} {name} — {price}"
  },
  pick_sub_category: {
    en: "\nSelect by entering the number:",
    hi: "\nनंबर दर्ज करके चुनें:",
    od: "\nନମ୍ବର ଲେଖି ବାଛନ୍ତୁ:"
  },
  no_sub_categories: {
    en: "No sub-categories available. Going back to visit type selection.",
    hi: "कोई उप-श्रेणी उपलब्ध नहीं है। वापस विजिट प्रकार चयन पर जा रहे हैं।",
    od: "କୌଣସି ଉପ-ଶ୍ରେଣୀ ଉପଲବ୍ଧ ନାହିଁ। ଭିଜିଟ୍ ପ୍ରକାର ଚୟନକୁ ଫେରୁଛି।"
  },
  collect_details_header: {
    en: "📝 Please provide the following details:\n",
    hi: "📝 कृपया निम्नलिखित विवरण दें:\n",
    od: "📝 ଦୟାକରି ନିମ୍ନଲିଖିତ ବିବରଣ ଦିଅନ୍ତୁ:\n"
  },
  // --- Procedure confirmation (no doctor/date/slot) ---
  procedure_confirm_details: {
    en: "📋 Procedure Request Summary:\n\n📝 Name: {name}\n🏥 Clinic: {clinic}\n📂 Sub-category: {sub_category}\n💰 Fee: {fee}\n📄 Concern: {concern}",
    hi: "📋 प्रक्रिया अनुरोध सारांश:\n\n📝 नाम: {name}\n🏥 क्लिनिक: {clinic}\n📂 उप-श्रेणी: {sub_category}\n💰 शुल्क: {fee}\n📄 समस्या: {concern}",
    od: "📋 ପ୍ରକ୍ରିୟା ଅନୁରୋଧ ସାରାଂଶ:\n\n📝 ନାମ: {name}\n🏥 କ୍ଲିନିକ୍: {clinic}\n📂 ଉପ-ଶ୍ରେଣୀ: {sub_category}\n💰 ଶୁଳ୍କ: {fee}\n📄 ସମସ୍ୟା: {concern}"
  },
  procedure_confirmed: {
    en: "✅ Your procedure request has been submitted!\n\n{details}\n\nOur clinic team will contact you shortly to schedule your procedure.\n\nSend any message to book another appointment. 👋",
    hi: "✅ आपका प्रक्रिया अनुरोध सबमिट हो गया!\n\n{details}\n\nहमारी क्लिनिक टीम आपकी प्रक्रिया शेड्यूल करने के लिए जल्द ही संपर्क करेगी।\n\nएक और अपॉइंटमेंट बुक करने के लिए कोई भी मैसेज भेजें। 👋",
    od: "✅ ଆପଣଙ୍କ ପ୍ରକ୍ରିୟା ଅନୁରୋଧ ଦାଖଲ ହୋଇଛି!\n\n{details}\n\nଆମ କ୍ଲିନିକ୍ ଟିମ୍ ଆପଣଙ୍କ ପ୍ରକ୍ରିୟା ସମୟସୂଚୀ କରିବା ପାଇଁ ଶୀଘ୍ର ଯୋଗାଯୋଗ କରିବେ।\n\nଆଉ ଏକ ଆପଏଣ୍ଟମେଣ୍ଟ ବୁକ୍ କରିବା ପାଇଁ ଯେକୌଣସି ମେସେଜ୍ ପଠାନ୍ତୁ। 👋"
  },
  // --- General Query ---
  query_prompt: {
    en: "Please type your query below. Our team will get back to you shortly:",
    hi: "कृपया नीचे अपना प्रश्न लिखें। हमारी टीम जल्द ही आपसे संपर्क करेगी:",
    od: "ଦୟାକରି ନିମ୍ନରେ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ। ଆମ ଟିମ୍ ଶୀଘ୍ର ଆପଣଙ୍କ ସହ ଯୋଗାଯୋଗ କରିବେ:"
  },
  query_auto_reply: {
    en: "✅ Your query has been received! Our team will contact you shortly.\n\n📝 Query: \"{query}\"\n📞 Phone: {phone}\n👤 Name: {name}\n\nSend any message to start a new booking. 👋",
    hi: "✅ आपका प्रश्न प्राप्त हो गया! हमारी टीम जल्द ही आपसे संपर्क करेगी।\n\n📝 प्रश्न: \"{query}\"\n📞 फोन: {phone}\n👤 नाम: {name}\n\nएक नई बुकिंग शुरू करने के लिए कोई भी मैसेज भेजें। 👋",
    od: "✅ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଗ୍ରହଣ ହୋଇଛି! ଆମ ଟିମ୍ ଶୀଘ୍ର ଆପଣଙ୍କ ସହ ଯୋଗାଯୋଗ କରିବେ।\n\n📝 ପ୍ରଶ୍ନ: \"{query}\"\n📞 ଫୋନ: {phone}\n👤 ନାମ: {name}\n\nଏକ ନୂଆ ବୁକିଂ ଆରମ୍ଭ କରିବା ପାଇଁ ଯେକୌଣସି ମେସେଜ୍ ପଠାନ୍ତୁ। 👋"
  },
  // --- Updated confirmation with fee + visit type ---
  confirm_consultation_details: {
    en: "📋 Consultation Summary:\n\n📝 Name: {name}\n🏥 Clinic: {clinic}\n📂 Sub-category: {sub_category}\n💰 Fee: {fee}\n👨‍⚕️ Doctor: {doctor}\n📅 Date: {date}\n⏰ Time: {time}\n📄 Concern: {concern}",
    hi: "📋 परामर्श सारांश:\n\n📝 नाम: {name}\n🏥 क्लिनिक: {clinic}\n📂 उप-श्रेणी: {sub_category}\n💰 शुल्क: {fee}\n👨‍⚕️ डॉक्टर: {doctor}\n📅 तिथि: {date}\n⏰ समय: {time}\n📄 समस्या: {concern}",
    od: "📋 ପରାମର୍ଶ ସାରାଂଶ:\n\n📝 ନାମ: {name}\n🏥 କ୍ଲିନିକ୍: {clinic}\n📂 ଉପ-ଶ୍ରେଣୀ: {sub_category}\n💰 ଶୁଳ୍କ: {fee}\n👨‍⚕️ ଡାକ୍ତର: {doctor}\n📅 ତାରିଖ: {date}\n⏰ ସମୟ: {time}\n📄 ସମସ୍ୟା: {concern}"
  }
};

// Day names for date display
const DAY_NAMES = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  od: ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର']
};

// Gender map for number input
const GENDER_MAP = {
  en: { '1': 'Male', '2': 'Female' },
  hi: { '1': 'पुरुष', '2': 'महिला' },
  od: { '1': 'ପୁରୁଷ', '2': 'ମହିଳା' }
};

/**
 * Get a message in the specified language, with optional variable substitution.
 * @param {string} lang - Language code: 'en', 'hi', or 'od'
 * @param {string} key - Message key from MESSAGES
 * @param {Object} vars - Optional variables to substitute {key} placeholders
 * @returns {string}
 */
function getMessage(lang, key, vars = {}) {
  const msg = MESSAGES[key];
  if (!msg) {
    console.warn(`⚠️ i18n: Unknown message key "${key}"`);
    return key;
  }
  
  let text = msg[lang] || msg['en']; // Fallback to English
  
  // Substitute variables
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  
  return text;
}

/**
 * Get day name in the specified language.
 */
function getDayName(lang, dayIndex) {
  return (DAY_NAMES[lang] || DAY_NAMES['en'])[dayIndex];
}

/**
 * Get gender string from number input.
 */
function getGender(lang, input) {
  return (GENDER_MAP[lang] || GENDER_MAP['en'])[input] || null;
}

/**
 * Map language selection number to language code.
 */
function getLanguageCode(selection) {
  const map = { '1': 'en', '2': 'hi', '3': 'od' };
  return map[selection] || null;
}

module.exports = {
  getMessage,
  getDayName,
  getGender,
  getLanguageCode,
  MESSAGES,
  DAY_NAMES,
  GENDER_MAP
};
