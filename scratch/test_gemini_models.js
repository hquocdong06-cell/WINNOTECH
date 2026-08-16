require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testWorkingModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const modelNames = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash"];
  for (const mName of modelNames) {
    try {
      console.log("Trying model:", mName);
      const model = genAI.getGenerativeModel({ model: mName });
      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage("Chào bạn, tư vấn giúp mình PC gaming 15tr");
      console.log(`✅ SUCCESS WITH ${mName}:`, result.response.text().slice(0, 100));
      break;
    } catch (err) {
      console.log(`❌ FAILED ${mName}:`, err.message);
    }
  }
}

testWorkingModel();
