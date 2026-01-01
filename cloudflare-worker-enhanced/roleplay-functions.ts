// Enhanced roleplay functions for Cloudflare Worker with situational cues
// Copy these functions to replace the existing roleplay functions in your worker

import { 
  roleplaySystemPrompt, 
  roleplayWithScenarioPrompt, 
  comprehensiveFeedbackPrompt,
  liveEqAnalysisPrompt,
  ScenarioContext 
} from './roleplay-prompts';

// Type definitions
interface RoleplayMessage {
  role: 'user' | 'assistant' | 'stakeholder';
  content: string;
  timestamp: number;
}

interface RoleplaySession {
  id: string;
  scenarioId: string;
  difficulty: string;
  messages: RoleplayMessage[];
  scenario?: ScenarioContext;
}

interface EqScore {
  metric: string;
  score: number;
  evidence: string;
}

interface SalesSkillScore {
  skill: string;
  score: number;
  feedback: string;
}

interface SignalIntelligence {
  signalsNoticed: number;
  signalsActedOn: number;
  missedOpportunities: string[];
  effectiveResponses: string[];
}

interface ComprehensiveFeedback {
  overallScore: number;
  eqScore: number;
  technicalScore: number;
  eqScores: EqScore[];
  salesSkillScores: SalesSkillScore[];
  signalIntelligence: SignalIntelligence;
  topStrengths: string[];
  priorityImprovements: string[];
  nextSteps: string[];
  strengths: string[];
  areasForImprovement: string[];
  frameworksApplied: string[];
  recommendations: string[];
}

// Enhanced roleplay start with scenario context and initial cue
export async function startRoleplayWithScenario(
  env: any,
  scenarioId: string,
  difficulty: string,
  scenario?: ScenarioContext
): Promise<RoleplaySession> {
  const initialCue = scenario?.initialCue || 
    '*The HCP looks up from reviewing patient charts as you enter the office*';
  
  const openingMessage = scenario?.environmentalContext 
    ? `${initialCue} Good to see you. I have about 15 minutes before my next patient. What would you like to discuss?`
    : `${initialCue} Good to see you. What would you like to discuss today?`;

  return {
    id: crypto.randomUUID(),
    scenarioId,
    difficulty,
    scenario,
    messages: [
      { 
        role: 'stakeholder', 
        content: openingMessage, 
        timestamp: Date.now() 
      }
    ]
  };
}

// Enhanced roleplay reply with situational cues
export async function roleplayReplyWithCues(
  env: any,
  messages: RoleplayMessage[],
  scenario?: ScenarioContext,
  difficulty: string = 'intermediate'
): Promise<{ reply: string; eqAnalysis: any; signals: any[] }> {
  try {
    // Build conversation history for the AI
    const conversationHistory = messages.map(m => ({
      role: m.role === 'stakeholder' ? 'assistant' : 'user',
      content: m.content
    }));

    // Use scenario-aware prompt if scenario context is available
    const systemPrompt = scenario 
      ? roleplayWithScenarioPrompt({ ...scenario, difficulty })
      : `${roleplaySystemPrompt}\n\nDifficulty: ${difficulty}`;

    // Generate HCP response with situational cues
    const response = await providerChat(env, [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ], { maxTokens: 400, temperature: 0.7 });

    // Parse any signals from the response for Signal Intelligence panel
    const signals = extractSignalsFromCues(response);

    // Get live EQ analysis
    const eqAnalysis = await liveEqAnalysisEnhanced(env, messages);

    return {
      reply: response,
      eqAnalysis,
      signals
    };
  } catch (error) {
    // Fallback response with basic cue
    return {
      reply: `*Pauses thoughtfully* I appreciate you sharing that. Can you tell me more about the clinical evidence supporting this approach?`,
      eqAnalysis: { empathy: 3, adaptability: 3, curiosity: 3, resilience: 3 },
      signals: []
    };
  }
}

// Extract observable signals from cues for Signal Intelligence panel
function extractSignalsFromCues(response: string): any[] {
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

// Interpret a cue and provide coaching context
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
  if (cueLower.includes('nurse') || cueLower.includes('staff') || cueLower.includes('enter')) {
    return {
      type: 'contextual',
      interpretation: 'Clinical environment interruption',
      suggestedResponse: 'Remain patient, acknowledge the demands of their role'
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
  if (cueLower.includes('eyebrow') || cueLower.includes('raise')) {
    return {
      type: 'verbal',
      interpretation: 'Curiosity or skepticism signal',
      suggestedResponse: 'Provide evidence or ask what specifically prompted the reaction'
    };
  }
  if (cueLower.includes('smile') || cueLower.includes('laugh')) {
    return {
      type: 'engagement',
      interpretation: 'Positive rapport signal',
      suggestedResponse: 'Good moment to reinforce relationship or transition topics'
    };
  }

  // Generic signal for unmatched cues
  return {
    type: 'contextual',
    interpretation: 'Observable behavior that may provide context',
    suggestedResponse: 'Continue observing and adapt approach as needed'
  };
}

// Enhanced live EQ analysis with 10 metrics
export async function liveEqAnalysisEnhanced(env: any, messages: RoleplayMessage[]): Promise<any> {
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

    const parsed = await providerChatJson(env, [
      { role: 'system', content: liveEqAnalysisPrompt },
      { role: 'user', content: transcript }
    ], { maxTokens: 300, temperature: 0.3 });

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
      resilience: clampScore(parsed?.resilience),
      summary: parsed?.summary || ''
    };
  } catch (e) {
    return {
      empathy: 3, clarity: 3, compliance: 3, discovery: 3,
      objectionHandling: 3, confidence: 3, activeListening: 3,
      adaptability: 3, actionInsight: 3, resilience: 3
    };
  }
}

// Enhanced conversation analysis for end of roleplay
export async function analyzeConversationComprehensive(
  env: any, 
  messages: RoleplayMessage[]
): Promise<ComprehensiveFeedback> {
  try {
    const transcript = messages.map((m, idx) => 
      `${idx + 1}. ${m.role}: ${m.content}`
    ).join('\n');

    const content = await providerChat(env, [
      { role: 'system', content: comprehensiveFeedbackPrompt },
      { role: 'user', content: `Analyze this conversation:\n\n${transcript}` }
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

// Normalize and validate comprehensive feedback
function normalizeComprehensiveFeedback(parsed: any): ComprehensiveFeedback {
  const defaultEqScores: EqScore[] = [
    { metric: 'empathy', score: 3, evidence: 'Demonstrated understanding of HCP perspective' },
    { metric: 'clarity', score: 3, evidence: 'Communication was generally clear' },
    { metric: 'compliance', score: 4, evidence: 'Maintained appropriate professional boundaries' },
    { metric: 'discovery', score: 3, evidence: 'Asked relevant questions' },
    { metric: 'objection-handling', score: 3, evidence: 'Addressed concerns adequately' },
    { metric: 'confidence', score: 3, evidence: 'Showed professional assurance' },
    { metric: 'active-listening', score: 3, evidence: 'Responded to HCP statements' },
    { metric: 'adaptability', score: 3, evidence: 'Adjusted approach during conversation' },
    { metric: 'action-insight', score: 3, evidence: 'Provided useful information' },
    { metric: 'resilience', score: 3, evidence: 'Maintained composure throughout' }
  ];

  const defaultSalesSkillScores: SalesSkillScore[] = [
    { skill: 'Opening & Rapport', score: 3, feedback: 'Established basic rapport' },
    { skill: 'Needs Discovery', score: 3, feedback: 'Gathered some relevant information' },
    { skill: 'Value Presentation', score: 3, feedback: 'Communicated product value' },
    { skill: 'Objection Handling', score: 3, feedback: 'Addressed objections adequately' },
    { skill: 'Closing & Next Steps', score: 3, feedback: 'Attempted to establish next steps' }
  ];

  return {
    overallScore: typeof parsed?.overallScore === 'number' ? parsed.overallScore : 75,
    eqScore: typeof parsed?.eqScore === 'number' ? parsed.eqScore : 72,
    technicalScore: typeof parsed?.technicalScore === 'number' ? parsed.technicalScore : 78,
    
    eqScores: Array.isArray(parsed?.eqScores) && parsed.eqScores.length > 0
      ? parsed.eqScores.map((s: any) => ({
          metric: String(s.metric || 'unknown'),
          score: typeof s.score === 'number' ? Math.min(5, Math.max(0, s.score)) : 3,
          evidence: String(s.evidence || 'No specific evidence cited')
        }))
      : defaultEqScores,
    
    salesSkillScores: Array.isArray(parsed?.salesSkillScores) && parsed.salesSkillScores.length > 0
      ? parsed.salesSkillScores.map((s: any) => ({
          skill: String(s.skill || 'Unknown'),
          score: typeof s.score === 'number' ? Math.min(5, Math.max(0, s.score)) : 3,
          feedback: String(s.feedback || 'No specific feedback')
        }))
      : defaultSalesSkillScores,
    
    signalIntelligence: parsed?.signalIntelligence && typeof parsed.signalIntelligence === 'object'
      ? {
          signalsNoticed: parsed.signalIntelligence.signalsNoticed || 0,
          signalsActedOn: parsed.signalIntelligence.signalsActedOn || 0,
          missedOpportunities: Array.isArray(parsed.signalIntelligence.missedOpportunities)
            ? parsed.signalIntelligence.missedOpportunities.filter((x: any) => typeof x === 'string')
            : [],
          effectiveResponses: Array.isArray(parsed.signalIntelligence.effectiveResponses)
            ? parsed.signalIntelligence.effectiveResponses.filter((x: any) => typeof x === 'string')
            : []
        }
      : { signalsNoticed: 0, signalsActedOn: 0, missedOpportunities: [], effectiveResponses: [] },
    
    topStrengths: normalizeStringArray(parsed?.topStrengths, [
      'Acknowledged HCP concerns before presenting solutions',
      'Used evidence-based language when discussing product',
      'Maintained professional composure throughout interaction'
    ]),
    
    priorityImprovements: normalizeStringArray(parsed?.priorityImprovements, [
      'Ask 2-3 discovery questions before presenting product benefits',
      'Confirm understanding of HCP\'s top priority explicitly',
      'Practice citing specific trial data points'
    ]),
    
    nextSteps: normalizeStringArray(parsed?.nextSteps, [
      'Prepare 3 discovery questions for next HCP conversation',
      'Review key trial endpoints to cite when discussing efficacy',
      'Practice 20-second acknowledgment of common objections'
    ]),
    
    strengths: normalizeStringArray(parsed?.strengths, ['Clear value communication', 'Good rapport']),
    areasForImprovement: normalizeStringArray(parsed?.areasForImprovement, ['Ask more open-ended questions']),
    frameworksApplied: normalizeStringArray(parsed?.frameworksApplied, ['active-listening', 'value-based-messaging']),
    recommendations: normalizeStringArray(parsed?.recommendations, ['Practice discovery questions', 'Review clinical data'])
  };
}

function normalizeStringArray(arr: any, fallback: string[]): string[] {
  if (!Array.isArray(arr)) return fallback;
  return arr
    .filter((x: any) => typeof x === 'string' && x.trim())
    .map((s: string) => s.trim())
    .slice(0, 8);
}

function getDefaultFeedback(): ComprehensiveFeedback {
  return {
    overallScore: 75,
    eqScore: 72,
    technicalScore: 78,
    eqScores: [
      { metric: 'empathy', score: 3, evidence: 'Demonstrated understanding of HCP perspective' },
      { metric: 'clarity', score: 3, evidence: 'Communication was generally clear' },
      { metric: 'compliance', score: 4, evidence: 'Maintained appropriate professional boundaries' },
      { metric: 'discovery', score: 3, evidence: 'Asked relevant questions' },
      { metric: 'objection-handling', score: 3, evidence: 'Addressed concerns adequately' },
      { metric: 'confidence', score: 3, evidence: 'Showed professional assurance' },
      { metric: 'active-listening', score: 3, evidence: 'Responded to HCP statements' },
      { metric: 'adaptability', score: 3, evidence: 'Adjusted approach during conversation' },
      { metric: 'action-insight', score: 3, evidence: 'Provided useful information' },
      { metric: 'resilience', score: 3, evidence: 'Maintained composure throughout' }
    ],
    salesSkillScores: [
      { skill: 'Opening & Rapport', score: 3, feedback: 'Established basic rapport' },
      { skill: 'Needs Discovery', score: 3, feedback: 'Gathered some relevant information' },
      { skill: 'Value Presentation', score: 3, feedback: 'Communicated product value' },
      { skill: 'Objection Handling', score: 3, feedback: 'Addressed objections adequately' },
      { skill: 'Closing & Next Steps', score: 3, feedback: 'Attempted to establish next steps' }
    ],
    signalIntelligence: {
      signalsNoticed: 0,
      signalsActedOn: 0,
      missedOpportunities: [],
      effectiveResponses: []
    },
    topStrengths: ['Maintained professional tone', 'Showed understanding of product'],
    priorityImprovements: ['Lead with discovery questions', 'Cite specific trial data'],
    nextSteps: ['Practice active listening', 'Review key clinical endpoints'],
    strengths: ['Clear communication'],
    areasForImprovement: ['Ask more open-ended questions'],
    frameworksApplied: ['active-listening'],
    recommendations: ['Practice discovery-first approach']
  };
}

// Helper function placeholder - use your existing providerChat implementation
declare function providerChat(env: any, messages: any[], opts?: any): Promise<string>;
declare function providerChatJson(env: any, messages: any[], opts?: any): Promise<any>;
declare function safeJsonParse(raw: string): any;
