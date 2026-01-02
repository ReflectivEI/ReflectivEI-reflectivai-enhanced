/**
 * ReflectivAI Cloudflare Worker - Production Backend
 * Complete AI-powered sales enablement platform
 * 
 * Features:
 * - Chat coaching with context awareness
 * - Roleplay simulations with EQ analysis
 * - Signal Intelligence framework
 * - SQL translation for pharma data
 * - Knowledge base Q&A
 * - Daily insights and coaching prompts
 * - Session state management with KV storage
 * 
 * @version 2.0.0
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALLOWED_ORIGINS = new Set([
  'https://reflectivei.github.io',
  'https://yxpzdb7o9z.preview.c24.airoapp.ai',
  'https://reflectivai-app-prod.pages.dev',
  'https://production.reflectivai-app-prod.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000'
]);

const DEFAULT_STATE = {
  chatMessages: [],
  sqlQueries: [],
  roleplay: null,
  signals: []
};

// ============================================================================
// CORS UTILITIES
// ============================================================================

function getCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : Array.from(ALLOWED_ORIGINS)[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':  'Content-Type, Authorization, X-Session-ID',  // ✅ ADDED X-Session-ID
    'Access-Control-Expose-Headers': 'X-Session-ID',  // ✅ ADDED - Allows frontend to read response header
    'Access-Control-Max-Age': '86400'
  };
}

function corsResponse(body, status = 200, origin = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(origin)
  };
  
  // Add X-Session-ID to response headers if present
  if (body.sessionId) {
    headers['X-Session-ID'] = body.sessionId;
  }
  
  return new Response(JSON.stringify(body), {
    status,
    headers
  });
}

function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('Origin') || '')
  });
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

async function loadState(env, sessionId) {
  if (!sessionId || !env.SESS) return { ...DEFAULT_STATE };
  try {
    const key = `sess:${sessionId}`;
    const data = await env.SESS.get(key, 'json');
    return data || { ...DEFAULT_STATE };
  } catch (err) {
    console.error('Error loading state:', err);
    return { ...DEFAULT_STATE };
  }
}

async function saveState(env, sessionId, state, ctx) {
  if (!sessionId || !env.SESS) return;
  try {
    const key = `sess:${sessionId}`;
    const sanitized = {
      chatMessages: sanitizeChatMessages(state.chatMessages || []),
      sqlQueries: (state.sqlQueries || []).slice(-50),
      roleplay: state.roleplay,
      signals: sanitizeSignals(state.signals || [])
    };
    ctx.waitUntil(env.SESS.put(key, JSON.stringify(sanitized), { expirationTtl: 86400 }));
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

function sanitizeChatMessages(messages) {
  return messages.slice(-100).map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content.slice(0, 10000) : ''
  }));
}

function sanitizeSignals(signals) {
  return signals.slice(-50).map(sig => ({
    type: sig.type,
    observation: sig.observation,
    interpretation: sig.interpretation,
    timestamp: sig.timestamp
  }));
}

// ============================================================================
// AI PROVIDER INTEGRATION
// ============================================================================

function selectKey(env) {
  const pool = (env.PROVIDER_KEYS || '')
    .split(/[;,]/)
    .map(s => s.trim())
    .filter(Boolean);
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  if (env.PROVIDER_KEY) return env.PROVIDER_KEY;
  if (env.OPENAI_API_KEY) return env.OPENAI_API_KEY;
  return null;
}

async function callAI(env, messages, options = {}) {
  const key = selectKey(env);
  if (!key) {
    throw new Error('No AI provider key configured');
  }

  const isGroq = key.startsWith('gsk_');
  const url = env.PROVIDER_URL || (isGroq 
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions');
  const model = env.PROVIDER_MODEL || (isGroq 
    ? 'llama-3.3-70b-versatile'
    : 'gpt-4o');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      ...options
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI provider error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================================================
// SIGNAL INTELLIGENCE FRAMEWORK
// ============================================================================

const SIGNAL_FRAMEWORK_PROMPT = `You are ReflectivAI — an AI Sales Coach for life sciences sales professionals.

Signal Intelligence (Core, Always On):
Signal Intelligence is the ability to notice, interpret, and respond appropriately to OBSERVABLE interaction signals during HCP conversations.

Valid signal types (strict):
- verbal: tone shifts, pacing, certainty vs hesitation, word choice
- conversational: deflection, repetition, topic avoidance, question patterns
- engagement: silence, reduced responsiveness, abrupt closure, time pressure
- contextual: urgency cues, alignment language, stakeholder presence, environmental factors

Hard guardrails (mandatory):
- Do NOT infer emotional state, intent, or personality traits
- Do NOT assign permanent labels or make character judgments
- Signals must be framed as hypotheses ("may indicate...") not truths
- Ground every signal in evidence: quote or closely paraphrase from the conversation
- Focus on observable, actionable patterns only

Signal format:
{
  "type": "verbal|conversational|engagement|contextual",
  "observation": "Direct quote or close paraphrase",
  "interpretation": "What this may indicate (hypothesis only)",
  "coaching": "Actionable response strategy"
}`;

function parseSignals(text) {
  const signals = [];
  const signalPattern = /\{[^}]*"type"[^}]*\}/g;
  const matches = text.match(signalPattern);
  
  if (matches) {
    for (const match of matches) {
      try {
        const signal = JSON.parse(match);
        if (signal.type && signal.observation) {
          signals.push({
            type: signal.type,
            observation: signal.observation,
            interpretation: signal.interpretation || '',
            coaching: signal.coaching || '',
            timestamp: Date.now()
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
  
  return signals;
}

// ============================================================================
// PRESET FALLBACK DATA
// ============================================================================

function getInsightPresets() {
  return [
    {
      dailyTip: "Take time today to research your client's recent activities, publications, or clinical interests. Personalized preparation builds trust and demonstrates genuine partnership.",
      focusArea: "Active Listening",
      suggestedExercise: {
        title: "5-Minute Sales Story Reflection",
        description: "After each client interaction, jot down the main points they emphasized. What mattered most to them? What questions did they ask? Use this to refine your next conversation."
      },
      motivationalQuote: "Success is not just about making sales—it's about making meaningful connections that drive better patient outcomes."
    },
    {
      dailyTip: "Practice the 3-second pause before responding to objections. This brief moment helps you respond thoughtfully rather than react defensively.",
      focusArea: "Objection Handling",
      suggestedExercise: {
        title: "Objection Reframing Practice",
        description: "List 3 common objections you hear. For each, write down: (1) The underlying concern, (2) A clarifying question, (3) A value-based response that addresses their real need."
      },
      motivationalQuote: "Every objection is an opportunity to understand your client's priorities more deeply."
    },
    {
      dailyTip: "Focus on asking one powerful question today that helps your HCP articulate their biggest challenge. Listen more than you speak.",
      focusArea: "Curiosity & Discovery",
      suggestedExercise: {
        title: "Question Quality Audit",
        description: "Review your last 3 conversations. How many questions did you ask vs. statements you made? Aim for a 60/40 question-to-statement ratio."
      },
      motivationalQuote: "The quality of your questions determines the quality of your relationships."
    },
    {
      dailyTip: "When presenting clinical data, connect each data point to a specific patient outcome or clinical workflow improvement. Make the science tangible.",
      focusArea: "Value Communication",
      suggestedExercise: {
        title: "Data-to-Impact Translation",
        description: "Take 3 key data points from your product. For each, write: (1) The clinical metric, (2) What it means for patient care, (3) How it impacts the HCP's practice."
      },
      motivationalQuote: "Data informs, but stories inspire action."
    },
    {
      dailyTip: "Build resilience by celebrating small wins. Did an HCP ask a follow-up question? That's engagement. Did they share a patient case? That's trust building.",
      focusArea: "Resilience & Adaptability",
      suggestedExercise: {
        title: "Win Recognition Journal",
        description: "At the end of each day, write down 3 small wins—moments of progress, connection, or learning. Review weekly to see patterns of growth."
      },
      motivationalQuote: "Resilience isn't about never facing setbacks—it's about learning and adapting from each one."
    }
  ];
}

function getFocusPresets() {
  return [
    {
      title: "Active Listening",
      focus: "Use open-ended questions and mirror one key phrase from your HCP's response to show you're truly hearing them.",
      microTask: "In your next interaction, mirror one key phrase the HCP uses and ask a follow-up question about it.",
      reflection: "Where did I assume instead of clarifying?"
    },
    {
      title: "Objection Handling",
      focus: "Pause 3 seconds before responding to objections. Use that time to identify the underlying concern.",
      microTask: "When you hear an objection today, pause, then ask: 'Help me understand what's driving that concern?'",
      reflection: "Did I address the real concern or just the surface objection?"
    },
    {
      title: "Value Communication",
      focus: "Connect every clinical data point to a specific patient outcome or workflow improvement.",
      microTask: "Before your next meeting, prepare 3 'data-to-impact' statements that link your product's evidence to real-world clinical benefits.",
      reflection: "Did my HCP see how this impacts their patients?"
    },
    {
      title: "Curiosity & Discovery",
      focus: "Ask questions that help HCPs articulate their challenges. Aim for 60% questions, 40% statements.",
      microTask: "Start your next conversation with: 'What's the biggest challenge you're facing with [condition] patients right now?'",
      reflection: "Did I learn something new about my HCP's priorities?"
    },
    {
      title: "Resilience & Adaptability",
      focus: "Recognize small wins and learn from setbacks. Every interaction is data for improvement.",
      microTask: "After each call, write down: (1) One thing that went well, (2) One thing to adjust next time.",
      reflection: "What did I learn from today's challenges?"
    }
  ];
}

// ============================================================================
// ENDPOINT HANDLERS
// ============================================================================

// Health & Status
async function handleHealth(env) {
  const hasKey = !!(env.PROVIDER_KEY || env.PROVIDER_KEYS || env.OPENAI_API_KEY);
  return {
    ok: true,
    status: 'ok',
    worker: 'reflectivai-v2',
    aiConfigured: hasKey,
    message: hasKey ? 'AI provider configured' : 'No AI provider key configured'
  };
}

async function handleStatus(env) {
  return {
    status: 'operational',
    version: '2.0.0',
    endpoints: {
      chat: ['POST /api/chat/send', 'GET /api/chat/messages', 'POST /api/chat/clear', 'GET|POST /api/chat/summary'],
      roleplay: ['POST /api/roleplay/start', 'POST /api/roleplay/respond', 'POST /api/roleplay/end', 'GET /api/roleplay/session'],
      dashboard: ['GET /api/dashboard/insights', 'GET /api/daily-focus'],
      sql: ['POST /api/sql/translate', 'GET /api/sql/history'],
      knowledge: ['POST /api/knowledge/ask'],
      frameworks: ['POST /api/frameworks/advice', 'POST /api/heuristics/customize', 'POST /api/modules/exercise'],
      coach: ['GET|POST /api/coach/prompts']
    },
    timestamp: new Date().toISOString()
  };
}

// Chat Endpoints
async function handleChatSend(env, ctx, body, sessionId) {
  const { message, context } = body;
  if (!message) {
    throw new Error('Message is required');
  }

  const state = await loadState(env, sessionId);
  
  // Build context-aware system prompt
  let systemPrompt = `You are ReflectivAI, an expert AI Sales Coach for life sciences sales professionals.

${SIGNAL_FRAMEWORK_PROMPT}

Your role:
- Provide actionable, evidence-based coaching
- Help sales reps improve their HCP interactions
- Focus on emotional intelligence, active listening, and value communication
- Use frameworks like SPIN Selling, Challenger Sale, and consultative selling
- Be supportive but direct—prioritize growth over comfort`;

  if (context) {
    const { diseaseState, specialty, hcpCategory, influenceDriver } = context;
    if (diseaseState) systemPrompt += `\n\nDisease State Context: ${diseaseState}`;
    if (specialty) systemPrompt += `\nHCP Specialty: ${specialty}`;
    if (hcpCategory) systemPrompt += `\nHCP Category: ${hcpCategory}`;
    if (influenceDriver) systemPrompt += `\nInfluence Driver: ${influenceDriver}`;
  }

  state.chatMessages.push({ role: 'user', content: message });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...state.chatMessages.slice(-20)
  ];

  const response = await callAI(env, messages);
  
  state.chatMessages.push({ role: 'assistant', content: response });
  
  // Extract signals
  const signals = parseSignals(response);
  if (signals.length > 0) {
    state.signals.push(...signals);
  }

  await saveState(env, sessionId, state, ctx);

  return {
    response,
    signals: signals.length > 0 ? signals : undefined,
    sessionId
  };
}

async function handleChatMessages(env, sessionId) {
  const state = await loadState(env, sessionId);
  return {
    messages: state.chatMessages || [],
    sessionId
  };
}

async function handleChatClear(env, ctx, sessionId) {
  const state = await loadState(env, sessionId);
  state.chatMessages = [];
  await saveState(env, sessionId, state, ctx);
  return { success: true, sessionId };
}

async function handleChatSummary(env, sessionId) {
  const state = await loadState(env, sessionId);
  const messages = state.chatMessages || [];
  
  if (messages.length === 0) {
    return {
      summary: 'No conversation history to summarize.',
      keyTakeaways: [],
      skillsDiscussed: [],
      actionItems: []
    };
  }

  const summaryPrompt = `Analyze this coaching conversation and provide:
1. A brief summary (2-3 sentences)
2. Key takeaways (3-5 bullet points)
3. Skills discussed (list)
4. Action items for the sales rep (3-5 specific actions)
5. Signal Intelligence highlights (if any)

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`;

  const summaryText = await callAI(env, [
    { role: 'system', content: 'You are a coaching session summarizer. Provide structured, actionable summaries.' },
    { role: 'user', content: summaryPrompt }
  ]);

  return {
    summary: summaryText,
    keyTakeaways: extractBulletPoints(summaryText, 'takeaways'),
    skillsDiscussed: extractBulletPoints(summaryText, 'skills'),
    actionItems: extractBulletPoints(summaryText, 'action'),
    signalIntelligenceHighlights: state.signals.slice(-5),
    sessionId
  };
}

function extractBulletPoints(text, keyword) {
  const lines = text.split('\n');
  const bullets = [];
  let inSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword)) {
      inSection = true;
      continue;
    }
    if (inSection && (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line))) {
      bullets.push(line.replace(/^[-•\d.\s]+/, '').trim());
    } else if (inSection && line.trim() === '') {
      break;
    }
  }
  
  return bullets;
}

// Roleplay Endpoints
async function handleRoleplayStart(env, ctx, body, sessionId) {
  const { scenario } = body;
  if (!scenario) {
    throw new Error('Scenario is required');
  }

  const state = await loadState(env, sessionId);
  
  const greetings = [
    "Hello, thanks for coming by. I only have a few minutes—what did you want to discuss?",
    "Hi there. I'm between patients right now. What can I help you with?",
    "Good morning. I've heard about your product before. What's new?",
    "Come in. I'm curious what brings you here today.",
    "Hi. I'm pretty busy, but I can give you a few minutes. What's this about?"
  ];

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  state.roleplay = {
    scenario,
    conversationHistory: [
      { role: 'hcp', content: greeting }
    ],
    startTime: Date.now(),
    turnCount: 0
  };

  await saveState(env, sessionId, state, ctx);

  return {
    hcpMessage: greeting,
    scenario,
    sessionId
  };
}

async function handleRoleplayRespond(env, ctx, body, sessionId) {
  const { message } = body;
  if (!message) {
    throw new Error('Message is required');
  }

  const state = await loadState(env, sessionId);
  
  if (!state.roleplay) {
    throw new Error('No active roleplay session');
  }

  state.roleplay.conversationHistory.push({ role: 'rep', content: message });
  state.roleplay.turnCount++;

  const systemPrompt = `You are roleplaying as an HCP (Healthcare Professional) in a sales conversation.

${SIGNAL_FRAMEWORK_PROMPT}

Scenario: ${state.roleplay.scenario}

Your role:
- Respond realistically as an HCP would
- Show varying levels of interest, skepticism, or engagement
- Ask relevant clinical questions
- Raise realistic objections
- Include 1-2 observable signals in your response (verbal, conversational, engagement, or contextual)
- Keep responses concise (2-4 sentences)

After your HCP response, provide EQ analysis in this format:

EQ_ANALYSIS:
{
  "empathy": <0-5>,
  "adaptability": <0-5>,
  "curiosity": <0-5>,
  "resilience": <0-5>,
  "strengths": ["..."],
  "improvements": ["..."]
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...state.roleplay.conversationHistory.map(m => ({
      role: m.role === 'hcp' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  const response = await callAI(env, messages, { temperature: 0.8 });
  
  // Parse HCP message and EQ analysis
  const parts = response.split('EQ_ANALYSIS:');
  const hcpMessage = parts[0].trim();
  let eqAnalysis = null;
  
  if (parts[1]) {
    try {
      eqAnalysis = JSON.parse(parts[1].trim());
    } catch (e) {
      console.error('Failed to parse EQ analysis:', e);
    }
  }

  state.roleplay.conversationHistory.push({ role: 'hcp', content: hcpMessage });
  
  // Extract signals
  const signals = parseSignals(response);
  if (signals.length > 0) {
    state.signals.push(...signals);
  }

  await saveState(env, sessionId, state, ctx);

  return {
    hcpMessage,
    eqAnalysis,
    signals: signals.length > 0 ? signals : undefined,
    turnCount: state.roleplay.turnCount,
    sessionId
  };
}

async function handleRoleplayEnd(env, ctx, sessionId) {
  const state = await loadState(env, sessionId);
  
  if (!state.roleplay) {
    throw new Error('No active roleplay session');
  }

  const conversation = state.roleplay.conversationHistory
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const analysisPrompt = `Analyze this roleplay conversation and provide comprehensive feedback.

Provide scores (0-5 scale) for:
1. Empathy - Understanding and acknowledging HCP concerns
2. Active Listening - Asking clarifying questions, building on HCP responses
3. Adaptability - Adjusting approach based on HCP signals
4. Curiosity - Asking insightful discovery questions
5. Value Communication - Connecting product to HCP/patient needs
6. Objection Handling - Addressing concerns effectively
7. Resilience - Maintaining composure and professionalism

Also provide:
- Overall assessment (2-3 sentences)
- Top 3 strengths
- Top 3 areas for improvement
- Specific action items (3-5)

Conversation:
${conversation}

Format your response as JSON:
{
  "overall": <0-5>,
  "empathy": <0-5>,
  "activeListening": <0-5>,
  "adaptability": <0-5>,
  "curiosity": <0-5>,
  "valueCommunication": <0-5>,
  "objectionHandling": <0-5>,
  "resilience": <0-5>,
  "assessment": "...",
  "strengths": [...],
  "improvements": [...],
  "actionItems": [...]
}`;

  const analysisText = await callAI(env, [
    { role: 'system', content: 'You are an expert sales coach providing detailed roleplay feedback.' },
    { role: 'user', content: analysisPrompt }
  ]);

  let analysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch (e) {
    analysis = {
      overall: 3,
      assessment: analysisText,
      strengths: [],
      improvements: [],
      actionItems: []
    };
  }

  // Clear roleplay session
  state.roleplay = null;
  await saveState(env, sessionId, state, ctx);

  return {
    ...analysis,
    duration: Date.now() - state.roleplay?.startTime || 0,
    turnCount: state.roleplay?.turnCount || 0,
    sessionId
  };
}

async function handleRoleplaySession(env, sessionId) {
  const state = await loadState(env, sessionId);
  return {
    active: !!state.roleplay,
    session: state.roleplay || null,
    sessionId
  };
}

// Dashboard Endpoints
async function handleDashboardInsights(env) {
  const presets = getInsightPresets();
  const selected = presets[Math.floor(Math.random() * presets.length)];
  
  return {
    ...selected,
    timestamp: new Date().toISOString()
  };
}

async function handleDailyFocus(env, url) {
  const params = new URL(url).searchParams;
  const role = params.get('role');
  const specialty = params.get('specialty');
  
  const presets = getFocusPresets();
  const selected = presets[Math.floor(Math.random() * presets.length)];
  
  return {
    ...selected,
    role,
    specialty,
    timestamp: new Date().toISOString()
  };
}

// SQL Translation Endpoints
async function handleSqlTranslate(env, ctx, body, sessionId) {
  const { query } = body;
  if (!query) {
    throw new Error('Query is required');
  }

  const state = await loadState(env, sessionId);

  const sqlPrompt = `Convert this natural language query to SQL for a pharma sales database.

Database schema:
- hcp_interactions (id, hcp_id, rep_id, date, duration, outcome, notes)
- hcps (id, name, specialty, institution, tier)
- products (id, name, therapeutic_area, launch_date)
- prescriptions (id, hcp_id, product_id, date, quantity)
- territories (id, name, region, rep_id)

Query: ${query}

Provide:
1. SQL query
2. Brief explanation
3. Expected result columns

Format as JSON:
{
  "sql": "...",
  "explanation": "...",
  "columns": [...]
}`;

  const response = await callAI(env, [
    { role: 'system', content: 'You are a SQL expert for pharma sales analytics.' },
    { role: 'user', content: sqlPrompt }
  ]);

  let result;
  try {
    result = JSON.parse(response);
  } catch (e) {
    result = {
      sql: response,
      explanation: 'SQL query generated',
      columns: []
    };
  }

  const queryRecord = {
    id: Date.now().toString(),
    naturalLanguage: query,
    sqlQuery: result.sql,
    explanation: result.explanation,
    timestamp: Date.now()
  };

  state.sqlQueries = state.sqlQueries || [];
  state.sqlQueries.push(queryRecord);
  await saveState(env, sessionId, state, ctx);

  return {
    ...result,
    queryId: queryRecord.id,
    sessionId
  };
}

async function handleSqlHistory(env, sessionId) {
  const state = await loadState(env, sessionId);
  return {
    queries: state.sqlQueries || [],
    sessionId
  };
}

// Knowledge & Frameworks Endpoints
async function handleKnowledgeAsk(env, body) {
  const { question, articleContext } = body;
  if (!question) {
    throw new Error('Question is required');
  }

  let prompt = `Answer this question about life sciences sales with factual rigor and practical advice.

Question: ${question}`;

  if (articleContext) {
    prompt += `\n\nContext: ${articleContext}`;
  }

  const answer = await callAI(env, [
    { role: 'system', content: 'You are a knowledgeable expert in pharmaceutical sales, clinical research, and healthcare systems.' },
    { role: 'user', content: prompt }
  ]);

  return {
    answer,
    relatedTopics: extractRelatedTopics(answer)
  };
}

function extractRelatedTopics(text) {
  const topics = [];
  const keywords = ['clinical trial', 'FDA', 'formulary', 'prior authorization', 'value-based care', 'outcomes', 'efficacy', 'safety'];
  
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      topics.push(keyword);
    }
  }
  
  return topics.slice(0, 5);
}

async function handleFrameworksAdvice(env, body) {
  const { framework, situation } = body;
  if (!framework || !situation) {
    throw new Error('Framework and situation are required');
  }

  const prompt = `Apply the ${framework} framework to this sales situation:

${situation}

Provide:
1. Framework overview (2-3 sentences)
2. How to apply it to this situation (step-by-step)
3. Example dialogue
4. Key takeaways`;

  const advice = await callAI(env, [
    { role: 'system', content: 'You are an expert in sales frameworks and methodologies.' },
    { role: 'user', content: prompt }
  ]);

  return { advice, framework, situation };
}

async function handleHeuristicsCustomize(env, body) {
  const { heuristic, context } = body;
  if (!heuristic) {
    throw new Error('Heuristic is required');
  }

  const prompt = `Customize this sales heuristic for the given context:

Heuristic: ${heuristic}
Context: ${context || 'General pharmaceutical sales'}

Provide:
1. Customized version
2. When to use it
3. Example application`;

  const customized = await callAI(env, [
    { role: 'system', content: 'You are a sales training expert specializing in practical heuristics.' },
    { role: 'user', content: prompt }
  ]);

  return { customized, original: heuristic, context };
}

async function handleModulesExercise(env, body) {
  const { module, skill } = body;
  if (!module || !skill) {
    throw new Error('Module and skill are required');
  }

  const prompt = `Create a training exercise for:

Module: ${module}
Skill: ${skill}

Provide:
1. Exercise name
2. Objective (what the rep will learn)
3. Instructions (step-by-step)
4. Success criteria
5. Estimated time`;

  const exercise = await callAI(env, [
    { role: 'system', content: 'You are a training designer for pharmaceutical sales teams.' },
    { role: 'user', content: prompt }
  ]);

  return { exercise, module, skill };
}

// Coach Prompts Endpoint
async function handleCoachPrompts(env, body) {
  const { context } = body || {};
  const { diseaseState, specialty, hcpCategory, influenceDriver } = context || {};

  let prompt = 'Generate 3 conversation starters and 6 suggested coaching topics for a pharmaceutical sales rep.';
  
  if (diseaseState) prompt += `\nDisease State: ${diseaseState}`;
  if (specialty) prompt += `\nHCP Specialty: ${specialty}`;
  if (hcpCategory) prompt += `\nHCP Category: ${hcpCategory}`;
  if (influenceDriver) prompt += `\nInfluence Driver: ${influenceDriver}`;

  prompt += '\n\nFormat as JSON:\n{\n  "conversationStarters": [...],\n  "suggestedTopics": [...]\n}';

  const response = await callAI(env, [
    { role: 'system', content: 'You are a sales coaching expert providing conversation guidance.' },
    { role: 'user', content: prompt }
  ]);

  let result;
  try {
    result = JSON.parse(response);
  } catch (e) {
    result = {
      conversationStarters: [
        'What are your biggest challenges with [disease state] patients?',
        'How do you currently approach treatment decisions for [condition]?',
        'What would make the biggest difference in your patient outcomes?'
      ],
      suggestedTopics: [
        'Clinical evidence review',
        'Patient case studies',
        'Formulary access strategies',
        'Treatment algorithms',
        'Safety considerations',
        'Real-world outcomes data'
      ]
    };
  }

  return {
    ...result,
    context,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Extract session ID from header or generate new one
    const sessionId = request.headers.get('X-Session-ID') || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      let result;

      // Health & Status
      if (path === '/health' && method === 'GET') {
        result = await handleHealth(env);
      }
      else if ((path === '/status' || path === '/api/status') && method === 'GET') {
        result = await handleStatus(env);
      }
      
      // Chat Endpoints
      else if (path === '/api/chat/send' && method === 'POST') {
        const body = await request.json();
        result = await handleChatSend(env, ctx, body, sessionId);
      }
      else if (path === '/api/chat/messages' && method === 'GET') {
        result = await handleChatMessages(env, sessionId);
      }
      else if (path === '/api/chat/clear' && method === 'POST') {
        result = await handleChatClear(env, ctx, sessionId);
      }
      else if ((path === '/api/chat/summary' || path === '/summary') && (method === 'GET' || method === 'POST')) {
        result = await handleChatSummary(env, sessionId);
      }
      
      // Roleplay Endpoints
      else if (path === '/api/roleplay/start' && method === 'POST') {
        const body = await request.json();
        result = await handleRoleplayStart(env, ctx, body, sessionId);
      }
      else if (path === '/api/roleplay/respond' && method === 'POST') {
        const body = await request.json();
        result = await handleRoleplayRespond(env, ctx, body, sessionId);
      }
      else if (path === '/api/roleplay/end' && method === 'POST') {
        result = await handleRoleplayEnd(env, ctx, sessionId);
      }
      else if (path === '/api/roleplay/session' && method === 'GET') {
        result = await handleRoleplaySession(env, sessionId);
      }
      
      // Dashboard Endpoints
      else if (path === '/api/dashboard/insights' && method === 'GET') {
        result = await handleDashboardInsights(env);
      }
      else if (path === '/api/daily-focus' && method === 'GET') {
        result = await handleDailyFocus(env, request.url);
      }
      
      // SQL Translation Endpoints
      else if (path === '/api/sql/translate' && method === 'POST') {
        const body = await request.json();
        result = await handleSqlTranslate(env, ctx, body, sessionId);
      }
      else if (path === '/api/sql/history' && method === 'GET') {
        result = await handleSqlHistory(env, sessionId);
      }
      
      // Knowledge & Frameworks Endpoints
      else if (path === '/api/knowledge/ask' && method === 'POST') {
        const body = await request.json();
        result = await handleKnowledgeAsk(env, body);
      }
      else if (path === '/api/frameworks/advice' && method === 'POST') {
        const body = await request.json();
        result = await handleFrameworksAdvice(env, body);
      }
      else if (path === '/api/heuristics/customize' && method === 'POST') {
        const body = await request.json();
        result = await handleHeuristicsCustomize(env, body);
      }
      else if (path === '/api/modules/exercise' && method === 'POST') {
        const body = await request.json();
        result = await handleModulesExercise(env, body);
      }
      
      // Coach Prompts Endpoint
      else if (path === '/api/coach/prompts' && (method === 'GET' || method === 'POST')) {
        const body = method === 'POST' ? await request.json() : {};
        result = await handleCoachPrompts(env, body);
      }
      
      // 404 Not Found
      else {
        return corsResponse({ error: 'Not found', path, method }, 404, origin);
      }

      return corsResponse(result, 200, origin);

    } catch (error) {
      console.error('Error:', error);
      return corsResponse(
        { 
          error: error.message || 'Internal server error',
          path,
          method
        },
        500,
        origin
      );
    }
  }
};
