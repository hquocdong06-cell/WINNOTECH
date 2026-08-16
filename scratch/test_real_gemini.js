require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API KEY:", apiKey ? apiKey.slice(0, 10) + "..." : "MISSING");
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);

  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-pro"
  ];

  for (const mName of models) {
    try {
      console.log(`Trying model [${mName}]...`);
      const model = genAI.getGenerativeModel({ model: mName });
      const result = await model.generateContent("Cho mình xin 3 lý do nên mua card VGA RTX 4060?");
      console.log(`🎉 SUCCESS WITH MODEL [${mName}]:`);
      console.log(result.response.text());
      return mName;
    } catch (err) {
      console.log(`❌ ERROR with [${mName}]:`, err.message);
    }
  }
}

testAllGeminiModels();
