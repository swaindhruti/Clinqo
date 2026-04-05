/**
 * visit-types.js - Visit type definitions and detail questions only.
 * Sub-categories and prices are now fetched from the backend API.
 */

const VISIT_TYPES = [
  { key: 'CONSULTATION', label: { en: 'Consultation', hi: 'परामर्श', od: 'ପରାମର୍ଶ' }, emoji: '🩺', hasScheduling: true },
  { key: 'PROCEDURE', label: { en: 'Procedure', hi: 'प्रक्रिया', od: 'ପ୍ରକ୍ରିୟା' }, emoji: '💉', hasScheduling: false },
  { key: 'GENERAL_QUERY', label: { en: 'General Query', hi: 'सामान्य प्रश्न', od: 'ସାଧାରଣ ପ୍ରଶ୍ନ' }, emoji: '❓', hasScheduling: false }
];

const DETAIL_QUESTIONS = {
  CONSULTATION: [
    { key: 'concern', prompt: { en: "Please describe your concern:", hi: "कृपया अपनी समस्या बताएं:", od: "ଦୟାକରି ଆପଣଙ୍କ ସମସ୍ୟା ବର୍ଣ୍ଣନା କରନ୍ତୁ:" } }
  ],
  PROCEDURE: [
    { key: 'concern', prompt: { en: "Please describe your concern:", hi: "कृपया अपनी समस्या बताएं:", od: "ଦୟାକରି ଆପଣଙ୍କ ସମସ୍ୟା ବର୍ଣ୍ଣନା କରନ୍ତୁ:" } },
    { key: 'prior_reports', prompt: { en: "Do you have any prior reports? If yes, describe. If no, type 'none':", hi: "क्या पूर्व रिपोर्ट है? हाँ तो बताएं, नहीं तो 'none' लिखें:", od: "ପୂର୍ବ ରିପୋର୍ଟ ଅଛି? ହଁ ହେଲେ ବର୍ଣ୍ଣନା କରନ୍ତୁ, ନା ହେଲେ 'none' ଲେଖନ୍ତୁ:" } }
  ]
};

function getVisitTypeByIndex(index) { return VISIT_TYPES[index - 1] || null; }
function getVisitTypeByKey(key) { return VISIT_TYPES.find(v => v.key === key) || null; }
function getDetailQuestions(visitTypeKey) { return DETAIL_QUESTIONS[visitTypeKey] || []; }
function getVisitTypeLabel(key, lang) {
  const vt = getVisitTypeByKey(key);
  return vt ? (vt.label[lang] || vt.label['en']) : key;
}

module.exports = { VISIT_TYPES, DETAIL_QUESTIONS, getVisitTypeByIndex, getVisitTypeByKey, getDetailQuestions, getVisitTypeLabel };
