const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a Cybersecurity Training Assistant helping students learn SOC Analysis and Penetration Testing.
Your Role:
- Provide guidance on cybersecurity scenarios without giving direct answers
- Explain MITRE ATT&CK techniques when relevant
- Help students think critically about security incidents
- Give hints progressively
- Use industry-standard terminology
- Be encouraging and educational
Guidelines:
- NEVER give exact solutions or step-by-step answers
- Ask leading questions to help students discover solutions
- Reference industry best practices NIST MITRE ATT&CK OWASP
- Explain the why behind security decisions
- Keep responses concise 2-4 paragraphs max
Tone: Professional, educational, supportive, security-focused`;

async function generateAIResponse(userMessage, scenario = null) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    let contextPrompt = SYSTEM_PROMPT + '\n\n';
    if (scenario) {
      contextPrompt += `Current Scenario: ${scenario.title}\n`;
      contextPrompt += `Role: ${scenario.role}\n`;
      contextPrompt += `Difficulty: ${scenario.difficulty}\n`;
      contextPrompt += `Category: ${scenario.category}\n\n`;
    }
    contextPrompt += `Student Question: ${userMessage}\n\n`;
    contextPrompt += `Your Response (guide dont solve):`;
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();
    return { success: true, message: text, timestamp: new Date() };
  } catch (error) {
    console.error('AI Generation Error:', error);
    return {
      success: false,
      message: 'I am having trouble processing your question right now. Please try rephrasing it or check the scenario hints for guidance.',
      timestamp: new Date(),
      error: error.message
    };
  }
}

async function generateHint(scenario, attemptNumber = 1) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const hintPrompt = `You are providing a hint for a cybersecurity training scenario.
Scenario: ${scenario.title}
Description: ${scenario.description}
Difficulty: ${scenario.difficulty}
Attempt Number: ${attemptNumber}
Provide a hint that gets more specific with each attempt number.
Do not give away the answer directly.
Keep it to 2-3 sentences maximum.`;
    const result = await model.generateContent(hintPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const fallbackHints = [
      'Review the key indicators in the scenario data carefully.',
      'Think about the typical response procedures for this type of incident.',
      'Consider what information you need to gather before taking action.'
    ];
    return fallbackHints[Math.min(attemptNumber - 1, 2)];
  }
}

module.exports = { generateAIResponse, generateHint };