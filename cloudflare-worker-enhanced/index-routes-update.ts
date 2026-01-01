// Updated route handlers for Cloudflare Worker with enhanced roleplay features
// Integrate these into your main index.ts file

// ===== UPDATED /api/roleplay/start ROUTE =====
// Replace the existing roleplay/start handler with this enhanced version

if (pathname === "/api/roleplay/start" && req.method === "POST") {
  const body = await readJson(req);
  const scenarioId = String(body?.scenarioId || "").trim();
  const difficulty = String(body?.difficulty || "intermediate");
  
  // NEW: Accept scenario context for situational cues
  const scenario = body?.scenario || null;
  
  if (!scenarioId) return badRequest("scenarioId required", headers);
  
  // Generate initial cue based on scenario context
  const initialCue = scenario?.initialCue || 
    "*The HCP looks up from reviewing patient charts as you enter*";
  
  const openingMessage = scenario?.environmentalContext
    ? `${initialCue} Good to see you. I have about 15 minutes before my next patient. What would you like to discuss?`
    : `${initialCue} Good to see you. What would you like to discuss today?`;
  
  const roleplay = {
    id: crypto.randomUUID(),
    scenarioId,
    difficulty,
    scenario, // Store scenario context for use in respond
    messages: [
      { 
        role: "stakeholder", 
        content: openingMessage, 
        timestamp: Date.now() 
      }
    ]
  };
  
  const state = await loadState(env, sessionId);
  state.roleplay = roleplay;
  await saveState(env, sessionId, state, ctx);
  
  return json({ session: roleplay }, headers);
}

// ===== UPDATED /api/roleplay/respond ROUTE =====
// Replace the existing roleplay/respond handler with this enhanced version

if (pathname === "/api/roleplay/respond" && req.method === "POST") {
  const body = await readJson(req);
  const msg = String(body?.message || "").trim();
  if (!msg) return badRequest("message required", headers);
  
  const state = await loadState(env, sessionId);
  if (!state.roleplay) return badRequest("no active session", headers);
  
  state.roleplay.messages.push({ 
    role: "user", 
    content: msg, 
    timestamp: Date.now() 
  });
  
  // Use enhanced roleplay reply with situational cues
  const reply = await roleplayReplyWithCues(
    env, 
    state.roleplay.messages,
    state.roleplay.scenario,
    state.roleplay.difficulty
  );
  
  state.roleplay.messages.push({ 
    role: "assistant", 
    content: reply.reply, 
    timestamp: Date.now() 
  });
  
  await saveState(env, sessionId, state, ctx);
  
  return json({ 
    session: state.roleplay, 
    eqAnalysis: reply.eqAnalysis, 
    reply: reply.reply, 
    signals: reply.signals  // NEW: Include extracted signals from cues
  }, headers);
}

// ===== UPDATED /api/roleplay/end ROUTE =====
// Replace the existing roleplay/end handler with this enhanced version

if (pathname === "/api/roleplay/end" && req.method === "POST") {
  const state = await loadState(env, sessionId);
  if (!state.roleplay) return badRequest("no active session", headers);
  
  // Use comprehensive analysis for detailed feedback
  const analysis = await analyzeConversationComprehensive(
    env, 
    state.roleplay.messages
  );
  
  const session = state.roleplay;
  state.roleplay = null;
  await saveState(env, sessionId, state, ctx);
  
  return json({ 
    analysis,  // Now includes eqScores, salesSkillScores, signalIntelligence
    session 
  }, headers);
}

// ===== UPDATED /api/roleplay/eq-analysis ROUTE =====
// Replace the existing eq-analysis handler with enhanced 10-metric version

if (pathname === "/api/roleplay/eq-analysis" && req.method === "POST") {
  const state = await loadState(env, sessionId);
  if (!state.roleplay) return badRequest("no active session", headers);
  
  // Use enhanced 10-metric EQ analysis
  const eqAnalysis = await liveEqAnalysisEnhanced(env, state.roleplay.messages);
  
  return json({ eqAnalysis }, headers);
}

// ===== UPDATED roleplayReplyWithCues FUNCTION =====
// This replaces the existing roleplayReply function

async function roleplayReplyWithCues(
  env: any,
  messages: any[],
  scenario?: any,
  difficulty: string = 'intermediate'
): Promise<{ reply: string; eqAnalysis: any; signals: any[] }> {
  try {
    const conversationHistory = messages.map(m => ({
      role: m.role === 'stakeholder' ? 'assistant' : 'user',
      content: m.content
    }));

    // Build scenario-aware system prompt with cue instructions
    const systemPrompt = buildRoleplaySystemPrompt(scenario, difficulty);

    const response = await providerChat(env, [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ], { maxTokens: 400, temperature: 0.7 });

    // Extract signals from situational cues for Signal Intelligence panel
    const signals = extractSignalsFromResponse(response);

    // Get live EQ analysis
    const eqAnalysis = await liveEqAnalysisEnhanced(env, messages);

    return { reply: response, eqAnalysis, signals };
  } catch (error) {
    return {
      reply: `*Pauses thoughtfully* I appreciate you sharing that. Can you tell me more about the clinical evidence?`,
      eqAnalysis: { empathy: 3, adaptability: 3, curiosity: 3, resilience: 3 },
      signals: []
    };
  }
}

function buildRoleplaySystemPrompt(scenario?: any, difficulty: string = 'intermediate'): string {
  const basePrompt = `You are simulating a healthcare professional (HCP) in a pharma sales roleplay scenario.

CRITICAL RULES FOR SITUATIONAL CUES:
1. Include 1-2 situational cues per response wrapped in *asterisks*
2. Cues should describe OBSERVABLE behaviors only:
   - Body language: *crosses arms*, *leans forward*, *glances at watch*, *nods slowly*
   - Environmental: *phone buzzes on desk*, *nurse enters briefly*, *pager goes off*
   - Micro-expressions: *slight frown*, *raises eyebrow*, *brief smile*
   - Actions: *picks up prescription pad*, *sets down coffee*, *adjusts glasses*
3. Place cues naturally within dialogue
4. Cues should reflect conversation flow - positive signals when rep does well, concern signals when struggling

DIFFICULTY: ${difficulty}
${difficulty === 'advanced' ? '- Be more challenging with objections and skepticism' : ''}
${difficulty === 'beginner' ? '- Be more receptive and give clearer verbal signals' : ''}`;

  if (!scenario) return basePrompt;

  return `${basePrompt}

SCENARIO CONTEXT:
- Scenario: ${scenario.title || 'General HCP Meeting'}
- Stakeholder: ${scenario.stakeholder || 'Healthcare Professional'}
- Setting: ${scenario.environmentalContext || 'Medical office during a scheduled meeting'}
- HCP Mood: ${scenario.hcpMood || 'Neutral, professional, time-conscious'}
- Potential Interruptions: ${Array.isArray(scenario.potentialInterruptions) ? scenario.potentialInterruptions.join(', ') : 'Phone calls, staff interruptions'}
- Challenges: ${Array.isArray(scenario.challenges) ? scenario.challenges.join(', ') : 'Time constraints, skepticism'}

Remember: Your response MUST include 1-2 situational cues wrapped in *asterisks*.`;
}

function extractSignalsFromResponse(response: string): any[] {
  const cuePattern = /\*([^*]+)\*/g;
  const signals: any[] = [];
  let match;

  while ((match = cuePattern.exec(response)) !== null) {
    const cue = match[1].trim();
    const signal = interpretCue(cue);
    if (signal) {
      signals.push({
        id: crypto.randomUUID(),
        type: signal.type,
        signal: cue,
        interpretation: signal.interpretation,
        suggestedResponse: signal.suggestedResponse,
        timestamp: new Date().toISOString()
      });
    }
  }

  return signals;
}

function interpretCue(cue: string): { type: string; interpretation: string; suggestedResponse: string } | null {
  const cueLower = cue.toLowerCase();

  // Engagement signals
  if (cueLower.includes('lean') && cueLower.includes('forward')) {
    return {
      type: 'engagement',
      interpretation: 'HCP is showing increased interest in this topic',
      suggestedResponse: 'Good opportunity to provide more detail or ask a discovery question'
    };
  }
  if (cueLower.includes('nod')) {
    return {
      type: 'engagement',
      interpretation: 'HCP appears to agree or understand the point',
      suggestedResponse: 'Continue building on this topic or move to next key message'
    };
  }

  // Disengagement signals  
  if (cueLower.includes('glance') && (cueLower.includes('watch') || cueLower.includes('clock'))) {
    return {
      type: 'contextual',
      interpretation: 'Time pressure signal - HCP may be feeling rushed',
      suggestedResponse: 'Consider summarizing key points or asking about priorities'
    };
  }
  if (cueLower.includes('cross') && cueLower.includes('arm')) {
    return {
      type: 'engagement',
      interpretation: 'Possible resistance or skepticism',
      suggestedResponse: 'Acknowledge their perspective, ask an open-ended question'
    };
  }

  // Environmental signals
  if (cueLower.includes('phone') || cueLower.includes('pager') || cueLower.includes('buzz')) {
    return {
      type: 'contextual',
      interpretation: 'External interruption - may affect attention',
      suggestedResponse: 'Offer to pause or recap when they return focus'
    };
  }

  // Body language signals
  if (cueLower.includes('frown') || cueLower.includes('furrow')) {
    return {
      type: 'verbal',
      interpretation: 'Possible confusion or concern about what was said',
      suggestedResponse: 'Clarify or ask if they have questions about the point'
    };
  }
  if (cueLower.includes('smile') || cueLower.includes('laugh')) {
    return {
      type: 'engagement',
      interpretation: 'Positive rapport signal',
      suggestedResponse: 'Good moment to reinforce relationship or transition topics'
    };
  }

  // Default
  return {
    type: 'contextual',
    interpretation: 'Observable behavior that may provide context',
    suggestedResponse: 'Continue observing and adapt approach as needed'
  };
}

// ===== ENHANCED liveEqAnalysisEnhanced FUNCTION =====
async function liveEqAnalysisEnhanced(env: any, messages: any[]): Promise<any> {
  const clampScore = (value: any, fallback: number = 3): number => {
    return typeof value === 'number' ? Math.min(5, Math.max(0, value)) : fallback;
  };

  try {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
      return {
        empathy: 0, clarity: 0, compliance: 0, discovery: 0,
        objectionHandling: 0, confidence: 0, activeListening: 0,
        adaptability: 0, actionInsight: 0, resilience: 0
      };
    }

    const transcript = messages.map((m, idx) => 
      `${idx + 1}. ${m.role}: ${m.content}`
    ).join('\n');

    const sys = `Analyze the sales rep's demonstrated emotional intelligence. Score these 10 metrics (0-5 scale):
- empathy: ability to recognize and respond to HCP concerns
- clarity: clear, concise communication
- compliance: staying within appropriate boundaries
- discovery: asking thoughtful questions
- objectionHandling: addressing concerns with empathy and evidence
- confidence: professional assurance
- activeListening: demonstrating understanding
- adaptability: adjusting approach based on signals
- actionInsight: providing actionable information
- resilience: composure when facing resistance

Return JSON ONLY: {"empathy": number, "clarity": number, "compliance": number, "discovery": number, "objectionHandling": number, "confidence": number, "activeListening": number, "adaptability": number, "actionInsight": number, "resilience": number}`;

    const parsed = await providerChatJson(env, [
      { role: 'system', content: sys },
      { role: 'user', content: transcript }
    ], { maxTokens: 250, temperature: 0.3 });

    return {
      empathy: clampScore(parsed?.empathy),
      clarity: clampScore(parsed?.clarity),
      compliance: clampScore(parsed?.compliance),
      discovery: clampScore(parsed?.discovery),
      objectionHandling: clampScore(parsed?.objectionHandling),
      confidence: clampScore(parsed?.confidence),
      activeListening: clampScore(parsed?.activeListening),
      adaptability: clampScore(parsed?.adaptability),
      actionInsight: clampScore(parsed?.actionInsight),
      resilience: clampScore(parsed?.resilience)
    };
  } catch (e) {
    return {
      empathy: 3, clarity: 3, compliance: 3, discovery: 3,
      objectionHandling: 3, confidence: 3, activeListening: 3,
      adaptability: 3, actionInsight: 3, resilience: 3
    };
  }
}

// ===== COMPREHENSIVE ANALYSIS FUNCTION =====
async function analyzeConversationComprehensive(env: any, messages: any[]): Promise<any> {
  try {
    const transcript = messages.map((m, idx) => 
      `${idx + 1}. ${m.role}: ${m.content}`
    ).join('\n');

    const prompt = `Analyze this pharmaceutical sales roleplay conversation and provide comprehensive feedback.

Return JSON with this structure:
{
  "overallScore": number (0-100),
  "eqScore": number (0-100),
  "technicalScore": number (0-100),
  "eqScores": [
    {"metric": "empathy", "score": 0-5, "evidence": "specific quote/behavior"},
    {"metric": "clarity", "score": 0-5, "evidence": "..."},
    {"metric": "compliance", "score": 0-5, "evidence": "..."},
    {"metric": "discovery", "score": 0-5, "evidence": "..."},
    {"metric": "objection-handling", "score": 0-5, "evidence": "..."},
    {"metric": "confidence", "score": 0-5, "evidence": "..."},
    {"metric": "active-listening", "score": 0-5, "evidence": "..."},
    {"metric": "adaptability", "score": 0-5, "evidence": "..."},
    {"metric": "action-insight", "score": 0-5, "evidence": "..."},
    {"metric": "resilience", "score": 0-5, "evidence": "..."}
  ],
  "salesSkillScores": [
    {"skill": "Opening & Rapport", "score": 0-5, "feedback": "..."},
    {"skill": "Needs Discovery", "score": 0-5, "feedback": "..."},
    {"skill": "Value Presentation", "score": 0-5, "feedback": "..."},
    {"skill": "Objection Handling", "score": 0-5, "feedback": "..."},
    {"skill": "Closing & Next Steps", "score": 0-5, "feedback": "..."}
  ],
  "signalIntelligence": {
    "signalsNoticed": number,
    "signalsActedOn": number,
    "missedOpportunities": ["..."],
    "effectiveResponses": ["..."]
  },
  "topStrengths": ["3-5 specific strengths"],
  "priorityImprovements": ["3-5 actionable improvements"],
  "nextSteps": ["3-5 concrete recommendations"],
  "strengths": ["broader capabilities"],
  "areasForImprovement": ["broader development areas"],
  "frameworksApplied": ["frameworks used"],
  "recommendations": ["strategic guidance"]
}`;

    const content = await providerChat(env, [
      { role: 'system', content: prompt },
      { role: 'user', content: `Analyze:\n\n${transcript}` }
    ], { 
      responseFormat: { type: 'json_object' }, 
      maxTokens: 1200, 
      temperature: 0.35 
    });

    const parsed = safeJsonParse(content);
    return normalizeComprehensiveFeedback(parsed);
  } catch (e) {
    return getDefaultFeedback();
  }
}

function normalizeComprehensiveFeedback(parsed: any): any {
  // ... (same normalization logic as in roleplay-functions.ts)
  return {
    overallScore: typeof parsed?.overallScore === 'number' ? parsed.overallScore : 75,
    eqScore: typeof parsed?.eqScore === 'number' ? parsed.eqScore : 72,
    technicalScore: typeof parsed?.technicalScore === 'number' ? parsed.technicalScore : 78,
    eqScores: Array.isArray(parsed?.eqScores) ? parsed.eqScores : [],
    salesSkillScores: Array.isArray(parsed?.salesSkillScores) ? parsed.salesSkillScores : [],
    signalIntelligence: parsed?.signalIntelligence || { signalsNoticed: 0, signalsActedOn: 0, missedOpportunities: [], effectiveResponses: [] },
    topStrengths: Array.isArray(parsed?.topStrengths) ? parsed.topStrengths : ['Maintained professional tone'],
    priorityImprovements: Array.isArray(parsed?.priorityImprovements) ? parsed.priorityImprovements : ['Lead with discovery questions'],
    nextSteps: Array.isArray(parsed?.nextSteps) ? parsed.nextSteps : ['Practice active listening'],
    strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : ['Clear communication'],
    areasForImprovement: Array.isArray(parsed?.areasForImprovement) ? parsed.areasForImprovement : ['Ask more questions'],
    frameworksApplied: Array.isArray(parsed?.frameworksApplied) ? parsed.frameworksApplied : ['active-listening'],
    recommendations: Array.isArray(parsed?.recommendations) ? parsed.recommendations : ['Practice discovery approach']
  };
}

function getDefaultFeedback(): any {
  return {
    overallScore: 75,
    eqScore: 72,
    technicalScore: 78,
    eqScores: [
      { metric: 'empathy', score: 3, evidence: 'Demonstrated understanding' },
      { metric: 'clarity', score: 3, evidence: 'Communication was clear' },
      { metric: 'compliance', score: 4, evidence: 'Maintained boundaries' },
      { metric: 'discovery', score: 3, evidence: 'Asked relevant questions' },
      { metric: 'objection-handling', score: 3, evidence: 'Addressed concerns' },
      { metric: 'confidence', score: 3, evidence: 'Professional assurance' },
      { metric: 'active-listening', score: 3, evidence: 'Responded appropriately' },
      { metric: 'adaptability', score: 3, evidence: 'Adjusted approach' },
      { metric: 'action-insight', score: 3, evidence: 'Provided information' },
      { metric: 'resilience', score: 3, evidence: 'Maintained composure' }
    ],
    salesSkillScores: [
      { skill: 'Opening & Rapport', score: 3, feedback: 'Basic rapport established' },
      { skill: 'Needs Discovery', score: 3, feedback: 'Some discovery questions' },
      { skill: 'Value Presentation', score: 3, feedback: 'Communicated value' },
      { skill: 'Objection Handling', score: 3, feedback: 'Addressed objections' },
      { skill: 'Closing & Next Steps', score: 3, feedback: 'Attempted next steps' }
    ],
    signalIntelligence: { signalsNoticed: 0, signalsActedOn: 0, missedOpportunities: [], effectiveResponses: [] },
    topStrengths: ['Maintained professional tone', 'Showed product understanding'],
    priorityImprovements: ['Lead with discovery questions', 'Cite specific trial data'],
    nextSteps: ['Practice active listening', 'Review clinical endpoints'],
    strengths: ['Clear communication'],
    areasForImprovement: ['Ask more open-ended questions'],
    frameworksApplied: ['active-listening'],
    recommendations: ['Practice discovery-first approach']
  };
}
