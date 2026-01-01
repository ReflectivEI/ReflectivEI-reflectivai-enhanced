# ReflectivAI Enhanced Roleplay Integration Guide

This guide explains how to integrate the enhanced roleplay features with situational cues into your GitHub frontend and Cloudflare Worker backend.

## Overview

The enhanced roleplay system adds:
1. **Situational Cues** - Body language, environmental context, and micro-expressions wrapped in `*asterisks*`
2. **Real-time Signal Intelligence** - Extracted signals from cues with coaching suggestions
3. **Comprehensive Feedback** - 10 EI metrics + 5 Sales Skills rubrics after each session
4. **Enhanced Scenario Data** - New fields for initialCue, environmentalContext, hcpMood, potentialInterruptions

---

## Files to Update

### Cloudflare Worker (Backend)

Copy these functions into your worker's `index.ts`:

1. **roleplay-prompts.ts** - System prompts with cue generation instructions
2. **roleplay-functions.ts** - Enhanced roleplay reply and analysis functions  
3. **index-routes-update.ts** - Updated route handlers for `/api/roleplay/*`

### GitHub Frontend

1. **RoleplayCueParser.tsx** - Component to parse and render cues with amber styling
2. **enhanced-scenarios.ts** - Updated scenario data with new fields

---

## API Contract Changes

### POST /api/roleplay/start

**Request** (updated):
```json
{
  "scenarioId": "hiv-descovy-share",
  "difficulty": "intermediate",
  "scenario": {
    "id": "hiv-descovy-share",
    "title": "Descovy for PrEP Share Growth",
    "stakeholder": "Dr. Sarah Chen - ID Specialist",
    "environmentalContext": "Busy HIV clinic between patient appointments",
    "hcpMood": "Professional but time-conscious",
    "potentialInterruptions": ["Nurse with lab question", "Pager"],
    "challenges": ["Time constraints", "Established prescribing habits"],
    "initialCue": "*Dr. Chen is reviewing lab results as you enter*"
  }
}
```

**Response** (updated):
```json
{
  "session": {
    "id": "uuid",
    "scenarioId": "hiv-descovy-share",
    "difficulty": "intermediate",
    "scenario": { ... },
    "messages": [
      {
        "role": "stakeholder",
        "content": "*Dr. Chen is reviewing lab results as you enter* Good to see you. I have about 15 minutes. What would you like to discuss?",
        "timestamp": 1234567890
      }
    ]
  }
}
```

### POST /api/roleplay/respond

**Request** (unchanged):
```json
{
  "message": "Thank you for your time, Dr. Chen. I wanted to discuss some new data on bone and renal safety..."
}
```

**Response** (updated):
```json
{
  "session": { ... },
  "reply": "*Leans back slightly, sets down pen* That's interesting. We haven't had many issues with our current regimen, but I'm always interested in safety data. What did the trials show?",
  "eqAnalysis": {
    "empathy": 3,
    "clarity": 4,
    "compliance": 4,
    "discovery": 2,
    "objectionHandling": 3,
    "confidence": 4,
    "activeListening": 3,
    "adaptability": 3,
    "actionInsight": 3,
    "resilience": 4
  },
  "signals": [
    {
      "id": "uuid",
      "type": "engagement",
      "signal": "Leans back slightly, sets down pen",
      "interpretation": "HCP is showing openness to listen",
      "suggestedResponse": "Continue with the clinical data, maintain professional tone",
      "timestamp": "2024-12-28T10:00:00.000Z"
    }
  ]
}
```

### POST /api/roleplay/end

**Response** (updated with comprehensive feedback):
```json
{
  "analysis": {
    "overallScore": 82,
    "eqScore": 78,
    "technicalScore": 85,
    
    "eqScores": [
      {"metric": "empathy", "score": 4, "evidence": "Acknowledged HCP time constraints upfront"},
      {"metric": "clarity", "score": 4, "evidence": "Presented trial data clearly and concisely"},
      {"metric": "compliance", "score": 5, "evidence": "Stayed within approved messaging"},
      {"metric": "discovery", "score": 3, "evidence": "Asked 2 discovery questions"},
      {"metric": "objection-handling", "score": 4, "evidence": "Addressed cost concerns with PAP information"},
      {"metric": "confidence", "score": 4, "evidence": "Maintained professional demeanor"},
      {"metric": "active-listening", "score": 4, "evidence": "Referenced HCP's stated priorities"},
      {"metric": "adaptability", "score": 3, "evidence": "Adjusted pace when HCP seemed rushed"},
      {"metric": "action-insight", "score": 4, "evidence": "Provided specific trial endpoints"},
      {"metric": "resilience", "score": 4, "evidence": "Recovered well from initial skepticism"}
    ],
    
    "salesSkillScores": [
      {"skill": "Opening & Rapport", "score": 4, "feedback": "Strong opening that acknowledged HCP's time"},
      {"skill": "Needs Discovery", "score": 3, "feedback": "Asked about current practice but could probe deeper"},
      {"skill": "Value Presentation", "score": 4, "feedback": "Tied safety data to patient outcomes effectively"},
      {"skill": "Objection Handling", "score": 4, "feedback": "Addressed concerns with evidence and empathy"},
      {"skill": "Closing & Next Steps", "score": 3, "feedback": "Established follow-up but could be more specific"}
    ],
    
    "signalIntelligence": {
      "signalsNoticed": 5,
      "signalsActedOn": 4,
      "missedOpportunities": ["Could have addressed arm-crossing with a question"],
      "effectiveResponses": ["Paused when HCP checked phone", "Responded to leaning forward with detail"]
    },
    
    "topStrengths": [
      "Acknowledged HCP concerns before presenting solutions",
      "Used evidence-based language when discussing product",
      "Maintained professional composure throughout interaction"
    ],
    
    "priorityImprovements": [
      "Ask 2-3 discovery questions before presenting product benefits",
      "Confirm understanding of HCP's top priority explicitly",
      "Practice citing specific trial data points from memory"
    ],
    
    "nextSteps": [
      "Prepare 3 discovery questions for next HCP conversation",
      "Review key trial endpoints to cite when discussing efficacy",
      "Practice 20-second acknowledgment of common objections"
    ]
  },
  "session": { ... }
}
```

---

## Frontend Integration

### 1. Install the Cue Parser

Add `RoleplayCueParser.tsx` to your components directory.

### 2. Update Roleplay Message Rendering

```tsx
import { RoleplayMessageContent, extractSignalsFromCues } from './RoleplayCueParser';

function RoleplayChat({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg ${
            message.role === 'stakeholder' ? 'bg-muted' : 'bg-primary/10'
          }`}
        >
          <div className="font-medium mb-2">
            {message.role === 'stakeholder' ? 'HCP' : 'You'}
          </div>
          <RoleplayMessageContent content={message.content} />
        </div>
      ))}
    </div>
  );
}
```

### 3. Update Signal Intelligence Panel

When you receive the `signals` array from `/api/roleplay/respond`, pass them to your Signal Intelligence panel:

```tsx
function SignalIntelligencePanel({ signals }) {
  return (
    <div className="space-y-2">
      {signals.map((signal) => (
        <div key={signal.id} className="p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{signal.type}</Badge>
            <span className="text-amber-600 italic">{signal.signal}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {signal.interpretation}
          </p>
          <p className="text-sm text-primary mt-1">
            Suggested: {signal.suggestedResponse}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Update Scenario Selection

When starting a roleplay, include the full scenario context:

```tsx
import { getScenarioById, getScenarioContext } from './enhanced-scenarios';

async function startRoleplay(scenarioId, difficulty) {
  const scenario = getScenarioById(scenarioId);
  
  const response = await fetch('/api/roleplay/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenarioId,
      difficulty,
      scenario: scenario ? getScenarioContext(scenario) : undefined
    })
  });
  
  return response.json();
}
```

### 5. Update Feedback Dialog

Your `roleplay-feedback-dialog.tsx` should now display:
- 10 EI Metrics with scores and evidence
- 5 Sales Skills with scores and feedback
- Signal Intelligence summary
- Top Strengths, Priority Improvements, Next Steps

---

## Cue Styling

The cue parser renders situational cues with:
- **Background**: `bg-amber-500/10` (light amber)
- **Border**: `border-amber-500/20`
- **Text**: `text-amber-700 dark:text-amber-300` (italic)
- **Icon**: Eye icon from lucide-react

---

## Testing

1. Start a roleplay and verify the initial message includes a situational cue
2. Send a response and verify the HCP reply includes body language/environmental cues
3. Check that signals appear in the Signal Intelligence panel
4. End the roleplay and verify comprehensive feedback includes all metric scores

---

## Backward Compatibility

- The `scenario` field in `/api/roleplay/start` is optional
- If not provided, the system uses default cues and generic context
- Existing scenarios without new fields will still work
