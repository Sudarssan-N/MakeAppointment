const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const CUSTOMERS_CSV = path.join(__dirname, '../data/customers.csv');
const APPOINTMENTS_CSV = path.join(__dirname, '../data/appointments.csv');

// Helper to read CSV into array of objects
async function readCSV(filepath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filepath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Helper to write array of objects back to CSV
function writeCSV(filepath, data, headers) {
  // data: array of objects
  // headers: array of column names in correct order
  const lines = [headers.join(',')];

  data.forEach(row => {
    const line = headers.map(h => row[h]).join(',');
    lines.push(line);
  });

  fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
}

// 1) Authenticate user
async function authenticateUser(username, password) {
  const customers = await readCSV(CUSTOMERS_CSV);
  const found = customers.find(c => c.username === username && c.password === password);
  return !!found;
}

// 2) Get customer by username
async function getCustomerByUsername(username) {
  const customers = await readCSV(CUSTOMERS_CSV);
  return customers.find(c => c.username === username);
}

// 3) Get appointments for a given customer ID
async function getAppointmentsByCustomerId(customerId) {
  const appointments = await readCSV(APPOINTMENTS_CSV);
  return appointments.filter(a => a.customerId === customerId);
}

// 4) Add new appointment
async function addAppointment(customerId, date, time, reason, branch, banker) {
  // read existing appointments
  const appointments = await readCSV(APPOINTMENTS_CSV);

  // push new appointment record
  appointments.push({ customerId, date, time, reason, branch, banker });

  // write back
  writeCSV(APPOINTMENTS_CSV, appointments, ['customerId','date','time','reason','branch','banker']);
}

module.exports = {
  authenticateUser,
  getCustomerByUsername,
  getAppointmentsByCustomerId,
  addAppointment
};