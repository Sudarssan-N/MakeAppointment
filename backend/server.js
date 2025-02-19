require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Custom services
const { authenticateUser, getCustomerByUsername, getAppointmentsByCustomerId, addAppointment } = require('./services/csvService');
const { getChatGPTResponse } = require('./services/llmService');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1) Sign On ---
app.post('/api/signon', async (req, res) => {
  const { username, password } = req.body;
  
  // Simple CSV-based authentication
  const isValid = await authenticateUser(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Get customer info
  const customer = await getCustomerByUsername(username);
  return res.json({ 
    success: true,
    customerId: customer.customerId,
    customerName: customer.customerName 
  });
});

// --- 2) Get Appointments for a Customer ---
app.get('/api/appointments/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const appointments = await getAppointmentsByCustomerId(customerId);
  return res.json({ appointments });
});

// --- 3) Create a New Appointment ---
app.post('/api/appointments', async (req, res) => {
  const { customerId, date, time, reason, branch, banker } = req.body;

  try {
    await addAppointment(customerId, date, time, reason, branch, banker);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- 4) LLM Integration (Optional Endpoint) ---
app.post('/api/chat', async (req, res) => {
  const { prompt, context } = req.body; 
  // 'context' can be the user's appointment history or other data

  try {
    const llmResponse = await getChatGPTResponse(prompt, context);
    return res.json({ response: llmResponse });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Serve frontend (if you're hosting both on same server)
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});