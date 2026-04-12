const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// ==================== In-memory Database ====================

let clinics = [
  { id: 'c1', name: 'City Health Clinic', address: '123 Main St, Bhubaneswar', phone: '+91-9876543210', specialty: 'Dermatology', created_at: new Date().toISOString() },
  { id: 'c2', name: 'Sunshine Medical Center', address: '456 Park Ave, Cuttack', phone: '+91-9876543211', specialty: 'Pediatrics', created_at: new Date().toISOString() },
  { id: 'c3', name: 'Star Hospital', address: '789 Ring Rd, Bhubaneswar', phone: '+91-9876543212', specialty: 'Gynecology', created_at: new Date().toISOString() }
];

let serviceCategories = [
  // Derma clinic — Consultation
  { id: 'sc1', clinic_id: 'c1', visit_type: 'consultation', name: 'Skin', price: '₹500', emoji: '🧴', sort_order: 1, detail_questions: null },
  { id: 'sc2', clinic_id: 'c1', visit_type: 'consultation', name: 'Hair', price: '₹600', emoji: '💇', sort_order: 2, detail_questions: null },
  { id: 'sc3', clinic_id: 'c1', visit_type: 'consultation', name: 'Aesthetic', price: '₹800', emoji: '✨', sort_order: 3, detail_questions: null },
  // Derma clinic — Procedure
  { id: 'sc4', clinic_id: 'c1', visit_type: 'procedure', name: 'Skin', price: '₹1,500', emoji: '🧴', sort_order: 1, detail_questions: null },
  { id: 'sc5', clinic_id: 'c1', visit_type: 'procedure', name: 'Hair', price: '₹2,000', emoji: '💇', sort_order: 2, detail_questions: null },
  { id: 'sc6', clinic_id: 'c1', visit_type: 'procedure', name: 'Aesthetic', price: '₹3,000', emoji: '✨', sort_order: 3, detail_questions: null },
  // Pediatrics clinic
  { id: 'sc7', clinic_id: 'c2', visit_type: 'consultation', name: 'General Checkup', price: '₹400', emoji: '👶', sort_order: 1, detail_questions: null },
  { id: 'sc8', clinic_id: 'c2', visit_type: 'consultation', name: 'Vaccination', price: '₹300', emoji: '💉', sort_order: 2, detail_questions: null },
  { id: 'sc9', clinic_id: 'c2', visit_type: 'procedure', name: 'Vaccination', price: '₹800', emoji: '💉', sort_order: 1, detail_questions: null },
  // Gynecology clinic
  { id: 'sc10', clinic_id: 'c3', visit_type: 'consultation', name: 'Routine Checkup', price: '₹500', emoji: '📋', sort_order: 1, detail_questions: null },
  { id: 'sc11', clinic_id: 'c3', visit_type: 'consultation', name: 'Pregnancy Care', price: '₹700', emoji: '🤰', sort_order: 2, detail_questions: null },
  { id: 'sc12', clinic_id: 'c3', visit_type: 'procedure', name: 'Routine Checkup', price: '₹1,500', emoji: '📋', sort_order: 1, detail_questions: null },
];

let doctors = [
  { id: 'd1', name: 'Dr. Anil Kumar', code: 'ANK001', specialty: 'Dermatology', clinic_id: 'c1', created_at: new Date().toISOString() },
  { id: 'd2', name: 'Dr. Priya Das', code: 'PRD001', specialty: 'Dermatology', clinic_id: 'c1', created_at: new Date().toISOString() },
  { id: 'd3', name: 'Dr. Rajesh Patel', code: 'RAP001', specialty: 'Pediatrics', clinic_id: 'c2', created_at: new Date().toISOString() },
  { id: 'd4', name: 'Dr. Sunita Mohanty', code: 'SUM001', specialty: 'Gynecology', clinic_id: 'c3', created_at: new Date().toISOString() },
];

let patients = [];
let appointments = [];
let queries = [];
let patientIdCounter = 1;
let appointmentIdCounter = 1;
let queryIdCounter = 1;

// ==================== CORS ====================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// ==================== CLINICS ====================

app.get('/api/v1/clinics', (req, res) => {
  const { specialty } = req.query;
  let result = [...clinics];
  if (specialty) result = result.filter(c => c.specialty === specialty);
  console.log(`🏥 GET /clinics — ${result.length} clinics`);
  res.json(result);
});

app.get('/api/v1/clinics/:id', (req, res) => {
  const clinic = clinics.find(c => c.id === req.params.id);
  if (!clinic) return res.status(404).json({ error: 'NotFound', message: 'Clinic not found' });
  console.log(`🏥 GET /clinics/${req.params.id} — ${clinic.name}`);
  res.json(clinic);
});

app.post('/api/v1/clinics', (req, res) => {
  const { name, address, phone, specialty } = req.body;
  const clinic = { id: `c${clinics.length + 1}`, name, address: address || '', phone: phone || '', specialty: specialty || null, created_at: new Date().toISOString() };
  clinics.push(clinic);
  res.status(201).json(clinic);
});

// ==================== SERVICE CATEGORIES ====================

app.get('/api/v1/clinics/:clinicId/services', (req, res) => {
  const { visit_type } = req.query;
  let result = serviceCategories.filter(sc => sc.clinic_id === req.params.clinicId);
  if (visit_type) result = result.filter(sc => sc.visit_type === visit_type);
  result.sort((a, b) => a.sort_order - b.sort_order);
  console.log(`📂 GET /clinics/${req.params.clinicId}/services?visit_type=${visit_type || 'all'} — ${result.length}`);
  res.json(result);
});

app.post('/api/v1/clinics/:clinicId/services', (req, res) => {
  const data = { id: `sc${serviceCategories.length + 1}`, clinic_id: req.params.clinicId, ...req.body, created_at: new Date().toISOString() };
  serviceCategories.push(data);
  res.status(201).json(data);
});

// ==================== PATIENTS ====================

app.get('/api/v1/patients', (req, res) => { res.json(patients); });

app.get('/api/v1/patients/search', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'Missing phone' });
  const patient = patients.find(p => p.phone === phone || p.phone === `+${phone}`);
  console.log(`🔍 GET /patients/search?phone=${phone} — ${patient ? 'Found' : 'Not found'}`);
  return res.json(patient || null);
});

app.post('/api/v1/patients', (req, res) => {
  const { name, age, gender, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Missing fields' });
  const existing = patients.find(p => p.phone === phone && p.name === name);
  if (existing) return res.status(201).json(existing);
  const patient = { id: patientIdCounter++, name, age, gender, phone, created_at: new Date().toISOString() };
  patients.push(patient);
  console.log(`✅ POST /patients — ${patient.name} (ID: ${patient.id})`);
  res.status(201).json(patient);
});

// ==================== DOCTORS ====================

app.get('/api/v1/doctors', (req, res) => {
  const { specialty, clinic_id } = req.query;
  let result = [...doctors];
  if (specialty) result = result.filter(d => d.specialty === specialty);
  if (clinic_id) result = result.filter(d => d.clinic_id === clinic_id);
  result = result.map(d => ({ ...d, clinic: clinics.find(c => c.id === d.clinic_id) || null }));
  console.log(`👨‍⚕️ GET /doctors — ${result.length}`);
  res.json(result);
});

app.get('/api/v1/doctors/:id/availability', (req, res) => {
  const { date } = req.query;
  res.json({ doctor_id: req.params.id, date, is_present: true, notes: 'Available (local dev)' });
});

// ==================== APPOINTMENTS ====================

app.get('/api/v1/appointments', (req, res) => {
  const { patient_id, date, limit } = req.query;
  let result = [...appointments];
  if (patient_id) result = result.filter(a => String(a.patient_id) === String(patient_id));
  if (date) result = result.filter(a => a.date === date);
  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (limit) result = result.slice(0, parseInt(limit));
  res.json(result);
});

app.get('/api/v1/appointments/doctors/:doctorId/appointments', (req, res) => {
  const { date } = req.query;
  let result = appointments.filter(a => String(a.doctor_id) === req.params.doctorId);
  if (date) result = result.filter(a => a.date === date);
  res.json(result);
});

app.post('/api/v1/appointments', (req, res) => {
  const { patient_id, doctor_id, date, time_slot, idempotency_key } = req.body;
  if (!patient_id || !doctor_id || !date) return res.status(400).json({ error: 'Missing fields' });
  const patient = patients.find(p => String(p.id) === String(patient_id));
  const doctor = doctors.find(d => d.id === doctor_id);
  if (!patient || !doctor) return res.status(404).json({ error: 'Not found' });
  if (idempotency_key) {
    const existing = appointments.find(a => a.idempotency_key === idempotency_key);
    if (existing) return res.status(200).json(existing);
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let checkInCode = '';
  for (let i = 0; i < 6; i++) checkInCode += chars.charAt(Math.floor(Math.random() * chars.length));
  const appointment = {
    id: appointmentIdCounter++, patient_id: parseInt(patient_id) || patient_id,
    doctor_id, patient_name: patient.name, doctor_name: doctor.name,
    date, slot: appointments.filter(a => a.doctor_id === doctor_id && a.date === date).length + 1,
    time_slot: time_slot || null, status: 'booked', check_in_code: checkInCode,
    idempotency_key, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
  appointments.push(appointment);
  console.log(`✅ POST /appointments — ${patient.name} → ${doctor.name} | ${date}`);
  res.status(201).json(appointment);
});

// ==================== QUERIES ====================

app.post('/api/v1/queries', (req, res) => {
  const query = { id: queryIdCounter++, ...req.body, created_at: new Date().toISOString() };
  queries.push(query);
  console.log(`📝 POST /queries — ${query.query_text?.substring(0, 50)}`);
  res.status(201).json(query);
});

app.get('/api/v1/queries', (req, res) => {
  const { clinic_id, status } = req.query;
  let result = [...queries];
  if (clinic_id) result = result.filter(q => q.clinic_id === clinic_id);
  if (status) result = result.filter(q => q.status === status);
  res.json(result);
});

// ==================== SERVER ====================

const PORT = process.env.LOCAL_API_PORT || 3001;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🏥 Local Clinqo API — http://localhost:${PORT}`);
  console.log(`   Clinics: ${clinics.length} | Doctors: ${doctors.length} | Service Categories: ${serviceCategories.length}`);
  console.log('='.repeat(50));
});

module.exports = app;
