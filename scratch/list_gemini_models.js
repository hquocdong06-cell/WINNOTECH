require('dotenv').config();

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods?.includes("generateContent")) {
        console.log(" -", m.name);
      }
    });
  } else {
    console.log("API Result:", data);
  }
}

listGeminiModels();
