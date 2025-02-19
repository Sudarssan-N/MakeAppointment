const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');

// Use your API key here
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const APPOINTMENTS_CSV = path.join(__dirname, '../data/appointments.csv');

async function getChatGPTResponse(prompt, context = '') {
  // Read the CSV file and convert it to a string
  const csvData = fs.readFileSync(APPOINTMENTS_CSV, 'utf8');

  // Combine prompt with any relevant context (e.g., appointment history).
  const systemMessage = `You are a helpful appointment scheduling assistant. Use the context to inform your answers. Context: ${csvData}`;
  const userMessage = prompt;

  const response = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.data.choices[0].message.content;
}

module.exports = { getChatGPTResponse };