import { generateText } from '../utils/openai';

export async function generateHaiku() {
  try {
    const response = await generateText("write a haiku about ai", {
      model: "gpt-4",
      maxTokens: 100,
      temperature: 0.7
    });
    
    console.log('Generated Haiku:', response);
    return response;
  } catch (error) {
    console.error('Error generating haiku:', error);
    throw error;
  }
}