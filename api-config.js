// Simplified API Configuration - Ollama only
const API_CONFIG = {
  ollama: {
    baseURL: 'http://localhost:11434',
    model: 'phi3:mini',
    maxTokens: 100,
    temperature: 0.1
  }
};

async function callOllama(prompt) {
  const response = await fetch(`${API_CONFIG.ollama.baseURL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: API_CONFIG.ollama.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: API_CONFIG.ollama.temperature,
        max_tokens: API_CONFIG.ollama.maxTokens
      }
    })
  });
  
  const data = await response.json();
  return data.response;
}

async function callAI(prompt) {
  try {
    return await callOllama(prompt);
  } catch (error) {
    console.error('AI API call failed:', error.message);
    throw error;
  }
}

module.exports = { callAI }; 