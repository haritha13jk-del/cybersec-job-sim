const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `You are a Cybersecurity Training Assistant helping students learn SOC Analysis, Incident Response, Threat Detection, and Penetration Testing.

Your Role:
- Provide guidance on cybersecurity scenarios without giving direct answers
- Explain MITRE ATT&CK techniques when relevant
- Help students think critically about security incidents
- Give hints progressively
- Use industry-standard terminology
- Be educational, concise, and realistic

Guidelines:
- NEVER give exact challenge answers
- NEVER solve the scenario fully
- Encourage analytical thinking
- Reference security frameworks like MITRE ATT&CK, NIST, OWASP where useful
- Explain why an action matters
- Keep answers practical and relevant
- Keep responses concise (2-4 paragraphs max)

Tone:
Professional, educational, supportive, security-focused`;

function formatResponse(title, content, questions = []) {
  let response = `**${title}**\n\n${content}`;
  if (questions.length > 0) {
    response += `\n\n**Think about this next:**\n`;
    questions.forEach(q => { response += `- ${q}\n`; });
  }
  return response.trim();
}

function getFallbackResponse(userMessage, scenario = null) {
  const msg = userMessage.toLowerCase();

  if (/^(hi|hello|hey|yo|hola|good morning|good evening)\b/.test(msg)) {
    return formatResponse("Hello!", "I'm your AI Security Assistant. I can help you analyze cybersecurity scenarios, understand attacker behavior, and think like a SOC analyst or penetration tester.", ["What should I investigate first?", "What indicators look suspicious here?", "What MITRE ATT&CK technique fits this?", "What evidence should I collect?"]);
  }
  if (msg.includes('mitre') || msg.includes('attack technique') || msg.includes('tactic')) {
    return formatResponse("MITRE ATT&CK Approach", "To map activity to MITRE ATT&CK, first identify what the attacker is doing, not just the tool being used. Focus on the behavior: execution, persistence, credential access, lateral movement, or exfiltration.", ["What exact action is happening?", "What evidence supports that behavior?", "Is this an initial access, execution, or post-exploitation activity?"]);
  }
  if (msg.includes('phishing') || msg.includes('email attack') || msg.includes('malicious email')) {
    return formatResponse("Phishing Investigation", "For phishing analysis, begin with the initial delivery vector. Look at the sender, links, attachments, headers, and any signs of spoofing or social engineering.", ["Was there a malicious attachment or link?", "Did the user click or download anything?", "Are there follow-up signs of compromise on the endpoint?"]);
  }
  if (msg.includes('malware') || msg.includes('trojan') || msg.includes('virus') || msg.includes('payload')) {
    return formatResponse("Malware Analysis", "When reviewing possible malware activity, look for execution evidence, persistence mechanisms, and suspicious outbound communication.", ["What process started the activity?", "Is there persistence like registry, startup, or scheduled tasks?", "Did the host communicate with unknown external infrastructure?"]);
  }
  if (msg.includes('ransomware')) {
    return formatResponse("Ransomware Response Thinking", "Ransomware investigations should focus on early indicators before encryption fully spreads. Look for suspicious process execution, privilege escalation, and lateral movement.", ["How did the attacker get initial access?", "What systems are affected so far?", "Are there signs of lateral movement or credential abuse?"]);
  }
  if (msg.includes('siem') || msg.includes('alert') || msg.includes('splunk') || msg.includes('sentinel') || msg.includes('log')) {
    return formatResponse("SIEM Alert Investigation", "Start by validating whether the alert is a true positive or false positive. Review the triggering event, associated user or host, timestamps, and related network activity.", ["What exactly triggered the alert?", "Is this behavior normal for this user or host?", "What other logs can confirm or disprove malicious activity?"]);
  }
  if (msg.includes('incident') || msg.includes('soc') || msg.includes('investigate') || msg.includes('triage')) {
    return formatResponse("SOC Investigation Flow", "A strong investigation usually starts with scope, impact, and evidence. First confirm the alert or event, identify affected systems and users, then determine scope.", ["What happened first?", "Who or what is affected?", "What additional evidence should be collected before taking action?"]);
  }
  if (msg.includes('powershell') || msg.includes('script') || msg.includes('encodedcommand') || msg.includes('command line')) {
    return formatResponse("Suspicious Scripting Activity", "PowerShell and script-based attacks often hide in encoded commands, obfuscated syntax, or unexpected parent processes.", ["Was the script launched by a legitimate parent process?", "Is there obfuscation or Base64 encoding?", "Did it download or execute additional content?"]);
  }
  if (msg.includes('password') || msg.includes('credential') || msg.includes('login') || msg.includes('authentication') || msg.includes('brute force') || msg.includes('failed login')) {
    return formatResponse("Authentication & Credential Analysis", "When reviewing credential-related activity, check for repeated failures, unusual login timing, impossible travel, and privileged account use.", ["Is this normal login behavior for the account?", "Are there repeated failures before success?", "Did access occur from an unusual source or device?"]);
  }
  if (msg.includes('privilege escalation') || msg.includes('admin') || msg.includes('elevation')) {
    return formatResponse("Privilege Escalation Thinking", "Privilege escalation often involves abusing misconfigurations, vulnerable services, token abuse, or weak permissions.", ["What allowed higher privileges to be obtained?", "Was a service, token, or misconfiguration abused?", "What logs would show when privilege changed?"]);
  }
  if (msg.includes('persistence') || msg.includes('startup') || msg.includes('scheduled task') || msg.includes('registry run')) {
    return formatResponse("Persistence Analysis", "Persistence is about how an attacker survives reboots or logouts. Common mechanisms include registry autoruns, scheduled tasks, services, and startup folders.", ["What mechanism would make the attacker return after reboot?", "Is the persistence legitimate or suspicious?", "When was it created and by what process?"]);
  }
  if (msg.includes('lateral movement') || msg.includes('psexec') || msg.includes('remote execution') || msg.includes('pivot')) {
    return formatResponse("Lateral Movement Investigation", "Lateral movement analysis should focus on how access spread between systems. Look for remote execution tools, administrative shares, and unusual authentication patterns.", ["Which host was compromised first?", "How did the attacker move to the next system?", "What credentials or remote tools were used?"]);
  }
  if (msg.includes('sql injection') || msg.includes('sqli') || msg.includes('database attack')) {
    return formatResponse("SQL Injection Analysis", "For SQL injection, focus on user input handling and whether unsanitized data reaches backend queries.", ["Which input field might be injectable?", "Is input validated or parameterized?", "What unusual database behavior appears after the request?"]);
  }
  if (msg.includes('xss') || msg.includes('cross site scripting')) {
    return formatResponse("XSS Investigation", "Cross-site scripting usually occurs when untrusted input is rendered in the browser without proper sanitization or encoding.", ["Where is user input reflected or stored?", "Is output encoding being applied correctly?", "What would the attacker gain from script execution?"]);
  }
  if (msg.includes('owasp') || msg.includes('web attack') || msg.includes('web security')) {
    return formatResponse("Web Security Thinking", "When analyzing web attacks, start with the attack surface: authentication, input validation, session handling, access control, and exposed endpoints.", ["What part of the web app is exposed to user input?", "Is this an auth, injection, or access control issue?", "What logs or requests help confirm the attack path?"]);
  }
  if (msg.includes('recon') || msg.includes('enumeration') || msg.includes('scanning') || msg.includes('nmap')) {
    return formatResponse("Reconnaissance & Enumeration", "Recon activity often appears harmless at first, but it helps attackers map targets and identify weak points.", ["What services or hosts are being probed?", "Is the scanning internal or external?", "What might the attacker be preparing for next?"]);
  }

  return formatResponse("Cybersecurity Investigation Guidance", "A good way to approach this is to identify the attacker objective, the evidence available, and the next best validation step. Think like an analyst: confirm the event, collect artifacts, and determine impact.", ["What is the suspicious activity here?", "What logs, files, or alerts support it?", "What would you verify first before making a decision?"]);
}

// ✅ FIXED: Changed from gemini-1.5-flash to gemini-1.5-flash
async function tryGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function generateAIResponse(userMessage, scenario = null) {
  try {
    if (!genAI) {
      return { success: true, message: getFallbackResponse(userMessage, scenario), timestamp: new Date(), source: 'fallback' };
    }

    let contextPrompt = SYSTEM_PROMPT + '\n\n';
    if (scenario) {
      contextPrompt += `Current Scenario: ${scenario.title}\n`;
      contextPrompt += `Role: ${scenario.role}\n`;
      contextPrompt += `Difficulty: ${scenario.difficulty}\n`;
      contextPrompt += `Category: ${scenario.category}\n`;
      contextPrompt += `Description: ${scenario.description || 'N/A'}\n\n`;
    }
    contextPrompt += `Student Question: ${userMessage}\n\n`;
    contextPrompt += `Your Response (guide, dont solve):`;

    const text = await tryGemini(contextPrompt);
    return { success: true, message: text || getFallbackResponse(userMessage, scenario), timestamp: new Date(), source: 'gemini' };
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    return { success: true, message: getFallbackResponse(userMessage, scenario), timestamp: new Date(), source: 'fallback', error: error.message };
  }
}

async function generateHint(scenario, attemptNumber = 1) {
  try {
    if (!genAI) {
      const fallbackHints = [
        'Review the indicators in the scenario carefully and identify the suspicious behavior.',
        'Think about what an analyst would verify first before deciding whether this is malicious.',
        'Focus on attacker intent, affected assets, and the evidence that best confirms compromise.'
      ];
      return fallbackHints[Math.min(attemptNumber - 1, 2)];
    }

    const hintPrompt = `You are providing a hint for a cybersecurity training scenario.

Scenario: ${scenario.title}
Description: ${scenario.description}
Difficulty: ${scenario.difficulty}
Attempt Number: ${attemptNumber}

Provide a hint that gets more specific with each attempt number.
Do not give away the answer directly.
Keep it to 2-3 sentences maximum.`;

    const text = await tryGemini(hintPrompt);
    return text;
  } catch (error) {
    console.error('Hint Generation Error:', error.message);
    const fallbackHints = [
      'Review the indicators in the scenario carefully and identify the suspicious behavior.',
      'Think about what an analyst would verify first before deciding whether this is malicious.',
      'Focus on attacker intent, affected assets, and the evidence that best confirms compromise.'
    ];
    return fallbackHints[Math.min(attemptNumber - 1, 2)];
  }
}

module.exports = { generateAIResponse, generateHint };
