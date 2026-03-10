import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

console.log("API KEY:", process.env.GOOGLE_API_KEY); // <-- ADD THIS

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

async function main() {
  const model = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello Gemini"
  });
  console.log(model.text);
}

main();
