const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // There isn't a direct listModels on the genAI object in this version usually 
    // but we can try a dummy call or check the docs
    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    // In newer versions we use the fetching logic or check supported models
    // But let's just try to hit gemini-1.5-flash and gemini-1.5-pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash!");
  } catch (e) {
    console.error("Failed with gemini-1.5-flash:", e.message);
  }
}

list();
