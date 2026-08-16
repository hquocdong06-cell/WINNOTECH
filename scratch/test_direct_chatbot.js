require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testDirectChat() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const candidateModels = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"];
  let responseText = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Bạn là trợ lý WINNOTech."
      });
      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage("Tư vấn giúp mình CPU gaming 5 triệu");
      responseText = result.response.text();
      if (responseText) {
        console.log(`🎉 SUCCESS with ${modelName}:`);
        console.log(responseText);
        break;
      }
    } catch (err) {
      console.log(`❌ FAILED ${modelName}:`, err.message);
    }
  }
}

testDirectChat();
