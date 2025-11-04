// AI Configuration
export const AI_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
  }
};

export function validateAIConfig(): boolean {
  console.log(AI_CONFIG)
  if (!AI_CONFIG.openai.apiKey) {
    console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
    return false;
  }
  return true;
}