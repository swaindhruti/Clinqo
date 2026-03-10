const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// In-memory database
let patients = [];
let doctors = [
  { id: 1, name: 'Sandeep Das', specialization: 'General Physician', phone: '+1234567890' },
  { id: 2, name: 'Dr. Smith', specialization: 'Cardiologist', phone: '+1234567891' }
];
let appointments = [];

// Auto-increment IDs
let patientIdCounter = 1;
let appointmentIdCounter = 1;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Local Clinqo API Server',
    endpoints: {
      patients: '/api/v1/patients',
      doctors: '/api/v1/doctors',
      appointments: '/api/v1/appointments'
    }
  });
});

// ==================== PATIENTS ====================

// Get all patients
app.get('/api/v1/patients', (req, res) => {
  console.log('📋 GET /api/v1/patients - Retrieved patients:', patients.length);
  res.json(patients);
});

// Get patient by ID
app.get('/api/v1/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === parseInt(req.params.id));
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  console.log('📋 GET /api/v1/patients/:id - Found patient:', patient.name);
  res.json(patient);
});

// Create patient
app.post('/api/v1/patients', (req, res) => {
  const { name, age, gender, phone } = req.body;
  
  if (!name || !age || !gender || !phone) {
    return res.status(400).json({ error: 'Missing required fields: name, age, gender, phone' });
  }

  const patient = {
    id: patientIdCounter++,
    name,
    age,
    gender,
    phone,
    created_at: new Date().toISOString()
  };

  patients.push(patient);
  console.log('✅ POST /api/v1/patients - Created patient:', patient.name, `(ID: ${patient.id})`);
  res.status(201).json(patient);
});

// ==================== DOCTORS ====================

// Get all doctors
app.get('/api/v1/doctors', (req, res) => {
  console.log('👨‍⚕️ GET /api/v1/doctors - Retrieved doctors:', doctors.length);
  res.json(doctors);
});

// Get doctor by ID
app.get('/api/v1/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  console.log('👨‍⚕️ GET /api/v1/doctors/:id - Found doctor:', doctor.name);
  res.json(doctor);
});

// Create doctor (optional)
app.post('/api/v1/doctors', (req, res) => {
  const { name, specialization, phone } = req.body;
  
  if (!name || !specialization) {
    return res.status(400).json({ error: 'Missing required fields: name, specialization' });
  }

  const maxId = Math.max(...doctors.map(d => d.id), 0);
  const doctor = {
    id: maxId + 1,
    name,
    specialization,
    phone: phone || 'N/A',
    created_at: new Date().toISOString()
  };

  doctors.push(doctor);
  console.log('✅ POST /api/v1/doctors - Created doctor:', doctor.name, `(ID: ${doctor.id})`);
  res.status(201).json(doctor);
});

// ==================== APPOINTMENTS ====================

// Get all appointments
app.get('/api/v1/appointments', (req, res) => {
  console.log('📅 GET /api/v1/appointments - Retrieved appointments:', appointments.length);
  res.json(appointments);
});

// Get appointment by ID
app.get('/api/v1/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  console.log('📅 GET /api/v1/appointments/:id - Found appointment ID:', appointment.id);
  res.json(appointment);
});

// Create appointment
app.post('/api/v1/appointments', (req, res) => {
  const { patient_id, doctor_id, date, idempotency_key } = req.body;
  
  if (!patient_id || !doctor_id || !date) {
    return res.status(400).json({ error: 'Missing required fields: patient_id, doctor_id, date' });
  }

  // Check if patient exists
  const patient = patients.find(p => p.id === parseInt(patient_id));
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  // Check if doctor exists
  const doctor = doctors.find(d => d.id === parseInt(doctor_id));
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Check for duplicate (idempotency)
  if (idempotency_key) {
    const existing = appointments.find(a => a.idempotency_key === idempotency_key);
    if (existing) {
      console.log('⚠️ POST /api/v1/appointments - Duplicate appointment detected');
      return res.status(200).json(existing);
    }
  }

  const appointment = {
    id: appointmentIdCounter++,
    patient_id: parseInt(patient_id),
    doctor_id: parseInt(doctor_id),
    patient_name: patient.name,
    doctor_name: doctor.name,
    date,
    status: 'scheduled',
    idempotency_key,
    created_at: new Date().toISOString()
  };

  appointments.push(appointment);
  console.log('✅ POST /api/v1/appointments - Created appointment ID:', appointment.id);
  console.log(`   Patient: ${patient.name} | Doctor: ${doctor.name} | Date: ${date}`);
  res.status(201).json(appointment);
});

// ==================== SERVER ====================

const PORT = process.env.LOCAL_API_PORT || 3001;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🏥 Local Clinqo API Server Running');
  console.log('='.repeat(50));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`👥 Patients: http://localhost:${PORT}/api/v1/patients`);
  console.log(`👨‍⚕️ Doctors: http://localhost:${PORT}/api/v1/doctors`);
  console.log(`📅 Appointments: http://localhost:${PORT}/api/v1/appointments`);
  console.log('='.repeat(50));
  console.log(`📊 Initial Data:`);
  console.log(`   Doctors: ${doctors.length}`);
  console.log(`   Patients: ${patients.length}`);
  console.log(`   Appointments: ${appointments.length}`);
  console.log('='.repeat(50));
});

module.exports = app;
