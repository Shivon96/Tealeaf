
import { GoogleGenAI } from "@google/genai";
import { CollectionRecord, TeaGrade } from '../types';

export const getTeaInsights = async (history: CollectionRecord[], query: string) => {
  // Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: Use farmer_name instead of farmerName to match the CollectionRecord interface definition
  const historyContext = history.map(h => 
    `- Date: ${h.timestamp}, Farmer: ${h.farmer_name}, Weight: ${h.weight}kg, Grade: ${h.grade}`
  ).join('\n');

  const systemInstruction = `
    You are an expert agricultural consultant specializing in tea production. 
    You have access to a tea collection center's recent data. 
    Your goal is to provide insights on quality trends, yield predictions, and advice for farmers to improve their tea grade.
    
    Current Data Context:
    ${historyContext}
    
    Keep responses professional, concise, and focused on helping the center manager or farmers improve productivity and quality.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Directly access the .text property from the response.
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "I'm having trouble analyzing the data right now. Please try again later.";
  }
};
