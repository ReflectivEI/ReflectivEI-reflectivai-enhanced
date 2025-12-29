# ReflectivAI Cloudflare Worker - Production Backend

Complete AI-powered backend for the ReflectivAI sales enablement platform.

## Features

### 🧠 Core AI Integration
- **Multi-provider support**: Groq (primary) and OpenAI (fallback)
- **Key rotation**: Load balance across multiple API keys
- **Auto-detection**: Automatically detects provider based on key format
- **Error handling**: Comprehensive error handling with fallbacks

### 💬 Chat Coaching (4 endpoints)
- `POST /api/chat/send` - Send message with context-aware coaching
- `GET /api/chat/messages` - Get conversation history
- `POST /api/chat/clear` - Clear chat history
- `GET|POST /api/chat/summary` - Generate session summary

**Context support:**
- Disease state
- HCP specialty
- HCP category
- Influence driver

### 🎭 Roleplay Simulations (4 endpoints)
- `POST /api/roleplay/start` - Start roleplay with scenario
- `POST /api/roleplay/respond` - HCP response with EQ analysis
- `POST /api/roleplay/end` - Comprehensive feedback
- `GET /api/roleplay/session` - Get active session

**Features:**
- Realistic HCP responses
- Live EQ metrics (empathy, adaptability, curiosity, resilience)
- Signal Intelligence integration
- Comprehensive end-of-session analysis

### 📊 Dashboard & Insights (2 endpoints)
- `GET /api/dashboard/insights` - Daily coaching insights
- `GET /api/daily-focus` - Personalized daily focus

**Includes:**
- Daily tips
- Focus areas
- Suggested exercises
- Motivational quotes
- Rich preset fallbacks

### 💾 SQL Translation (2 endpoints)
- `POST /api/sql/translate` - Natural language to SQL
- `GET /api/sql/history` - Query history

**Database schema:**
- hcp_interactions
- hcps
- products
- prescriptions
- territories

### 📚 Knowledge & Frameworks (4 endpoints)
- `POST /api/knowledge/ask` - Knowledge base Q&A
- `POST /api/frameworks/advice` - Apply sales frameworks
- `POST /api/heuristics/customize` - Customize heuristics
- `POST /api/modules/exercise` - Generate training exercises

### 🎯 Coach Prompts (1 endpoint)
- `GET|POST /api/coach/prompts` - Context-aware conversation starters

### 🔍 Signal Intelligence Framework

**Observable interaction signals:**
- **Verbal**: tone shifts, pacing, certainty vs hesitation
- **Conversational**: deflection, repetition, topic avoidance
- **Engagement**: silence, reduced responsiveness, abrupt closure
- **Contextual**: urgency cues, alignment language, stakeholder presence

**Guardrails:**
- No emotional state inference
- No permanent trait labels
- Hypothesis-based ("may indicate...")
- Evidence-grounded (quotes from conversation)

### 💾 Session State Management

**KV Storage:**
- Chat message history (last 100 messages)
- SQL query history (last 50 queries)
- Active roleplay sessions
- Signal Intelligence data (last 50 signals)
- 24-hour TTL

---

## Deployment

### Prerequisites

1. **Cloudflare account** with Workers enabled
2. **Wrangler CLI** installed globally
3. **Groq API key** (or OpenAI API key)

### Quick Start

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create KV namespace
wrangler kv:namespace create "SESS"

# 4. Update wrangler.toml with KV namespace ID
# Replace YOUR_KV_NAMESPACE_ID with the ID from step 3

# 5. Set API key secret
wrangler secret put PROVIDER_KEY
# Paste your Groq API key when prompted

# 6. Deploy
wrangler deploy
```

### Environment Variables

#### Secrets (via `wrangler secret put`)

| Variable | Description | Required | Format |
|----------|-------------|----------|--------|
| `PROVIDER_KEY` | Single Groq API key | Yes* | `gsk_...` |
| `PROVIDER_KEYS` | Multiple Groq keys (semicolon separated) | Yes* | `gsk_key1;gsk_key2` |
| `OPENAI_API_KEY` | OpenAI fallback key | No | `sk-...` |

*Either `PROVIDER_KEY` or `PROVIDER_KEYS` is required

#### Public Variables (in `wrangler.toml`)

| Variable | Description | Default |
|----------|-------------|----------|
| `PROVIDER_URL` | API endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| `PROVIDER_MODEL` | Model name | `llama-3.3-70b-versatile` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | See wrangler.toml |

#### KV Namespace

| Binding | Description | Required |
|---------|-------------|----------|
| `SESS` | Session storage | Yes |

---

## API Reference

### Health & Status

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "status": "ok",
  "worker": "reflectivai-v2",
  "aiConfigured": true,
  "message": "AI provider configured"
}
```

#### `GET /api/status`

Detailed status with endpoint list.

**Response:**
```json
{
  "status": "operational",
  "version": "2.0.0",
  "endpoints": {
    "chat": [...],
    "roleplay": [...],
    "dashboard": [...],
    "sql": [...],
    "knowledge": [...],
    "frameworks": [...],
    "coach": [...]
  },
  "timestamp": "2025-12-29T23:00:00.000Z"
}
```

### Chat Endpoints

#### `POST /api/chat/send`

Send a coaching message.

**Request:**
```json
{
  "message": "How do I handle objections from HCPs?",
  "context": {
    "diseaseState": "Oncology",
    "specialty": "Medical Oncology",
    "hcpCategory": "Key Opinion Leader",
    "influenceDriver": "Clinical Evidence"
  }
}
```

**Response:**
```json
{
  "response": "Here's how to handle objections...",
  "signals": [
    {
      "type": "conversational",
      "observation": "HCP asked about safety data",
      "interpretation": "May indicate concern about adverse events",
      "coaching": "Address safety profile proactively",
      "timestamp": 1735516800000
    }
  ],
  "sessionId": "sess_1735516800_abc123"
}
```

#### `GET /api/chat/messages`

Get conversation history.

**Headers:**
- `X-Session-ID`: Session identifier

**Response:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "sessionId": "sess_1735516800_abc123"
}
```

#### `POST /api/chat/clear`

Clear conversation history.

**Headers:**
- `X-Session-ID`: Session identifier

**Response:**
```json
{
  "success": true,
  "sessionId": "sess_1735516800_abc123"
}
```

#### `GET|POST /api/chat/summary`

Generate session summary.

**Headers:**
- `X-Session-ID`: Session identifier

**Response:**
```json
{
  "summary": "This session focused on...",
  "keyTakeaways": [
    "Use SPIN questions for discovery",
    "Address objections with empathy"
  ],
  "skillsDiscussed": ["Active Listening", "Objection Handling"],
  "actionItems": [
    "Practice 3-second pause before responding",
    "Prepare data-to-impact statements"
  ],
  "signalIntelligenceHighlights": [...],
  "sessionId": "sess_1735516800_abc123"
}
```

### Roleplay Endpoints

#### `POST /api/roleplay/start`

Start a roleplay scenario.

**Request:**
```json
{
  "scenario": "Oncologist skeptical about new immunotherapy"
}
```

**Response:**
```json
{
  "hcpMessage": "Hello, thanks for coming by. I only have a few minutes—what did you want to discuss?",
  "scenario": "Oncologist skeptical about new immunotherapy",
  "sessionId": "sess_1735516800_abc123"
}
```

#### `POST /api/roleplay/respond`

Send rep message and get HCP response.

**Request:**
```json
{
  "message": "I wanted to share some new data on our immunotherapy..."
}
```

**Response:**
```json
{
  "hcpMessage": "I've seen the data. What makes this different from existing options?",
  "eqAnalysis": {
    "empathy": 3,
    "adaptability": 4,
    "curiosity": 3,
    "resilience": 4,
    "strengths": ["Good opening", "Confident delivery"],
    "improvements": ["Ask discovery questions first"]
  },
  "signals": [...],
  "turnCount": 1,
  "sessionId": "sess_1735516800_abc123"
}
```

#### `POST /api/roleplay/end`

End roleplay and get comprehensive feedback.

**Response:**
```json
{
  "overall": 3.5,
  "empathy": 4,
  "activeListening": 3,
  "adaptability": 4,
  "curiosity": 3,
  "valueCommunication": 4,
  "objectionHandling": 3,
  "resilience": 4,
  "assessment": "Strong opening and value communication...",
  "strengths": [
    "Confident delivery",
    "Good use of clinical data",
    "Maintained composure"
  ],
  "improvements": [
    "Ask more discovery questions",
    "Pause before responding to objections",
    "Connect data to patient outcomes"
  ],
  "actionItems": [
    "Practice SPIN questioning framework",
    "Prepare 3 data-to-impact statements",
    "Role-play objection handling scenarios"
  ],
  "duration": 180000,
  "turnCount": 5,
  "sessionId": "sess_1735516800_abc123"
}
```

### Dashboard Endpoints

#### `GET /api/dashboard/insights`

Get daily coaching insights.

**Response:**
```json
{
  "dailyTip": "Take time today to research your client's recent activities...",
  "focusArea": "Active Listening",
  "suggestedExercise": {
    "title": "5-Minute Sales Story Reflection",
    "description": "After each client interaction, jot down the main points..."
  },
  "motivationalQuote": "Success is not just about making sales—it's about making meaningful connections...",
  "timestamp": "2025-12-29T23:00:00.000Z"
}
```

#### `GET /api/daily-focus`

Get personalized daily focus.

**Query params:**
- `role` (optional)
- `specialty` (optional)

**Response:**
```json
{
  "title": "Active Listening",
  "focus": "Use open-ended questions and mirror one key phrase...",
  "microTask": "In your next interaction, mirror one key phrase...",
  "reflection": "Where did I assume instead of clarifying?",
  "role": "Sales Rep",
  "specialty": "Oncology",
  "timestamp": "2025-12-29T23:00:00.000Z"
}
```

### SQL Translation Endpoints

#### `POST /api/sql/translate`

Translate natural language to SQL.

**Request:**
```json
{
  "query": "Show me my top 10 HCPs by prescription volume last quarter"
}
```

**Response:**
```json
{
  "sql": "SELECT h.name, h.specialty, SUM(p.quantity) as total_prescriptions FROM hcps h JOIN prescriptions p ON h.id = p.hcp_id WHERE p.date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) GROUP BY h.id ORDER BY total_prescriptions DESC LIMIT 10",
  "explanation": "This query joins HCPs with prescriptions, filters for the last quarter, and returns the top 10 by volume.",
  "columns": ["name", "specialty", "total_prescriptions"],
  "queryId": "1735516800000",
  "sessionId": "sess_1735516800_abc123"
}
```

#### `GET /api/sql/history`

Get SQL query history.

**Response:**
```json
{
  "queries": [
    {
      "id": "1735516800000",
      "naturalLanguage": "Show me my top 10 HCPs...",
      "sqlQuery": "SELECT...",
      "explanation": "This query...",
      "timestamp": 1735516800000
    }
  ],
  "sessionId": "sess_1735516800_abc123"
}
```

### Knowledge & Frameworks Endpoints

#### `POST /api/knowledge/ask`

Ask knowledge base questions.

**Request:**
```json
{
  "question": "What is the FDA approval process for biologics?",
  "articleContext": "Optional context from article"
}
```

**Response:**
```json
{
  "answer": "The FDA approval process for biologics involves...",
  "relatedTopics": ["clinical trial", "FDA", "efficacy", "safety"]
}
```

#### `POST /api/frameworks/advice`

Apply sales framework to situation.

**Request:**
```json
{
  "framework": "SPIN Selling",
  "situation": "HCP is hesitant about switching patients to new therapy"
}
```

**Response:**
```json
{
  "advice": "Using SPIN Selling framework:\n\n1. Situation Questions: Understand current treatment approach...\n2. Problem Questions: Identify challenges with current therapy...\n3. Implication Questions: Explore consequences of not addressing problems...\n4. Need-Payoff Questions: Help HCP articulate benefits of switching...",
  "framework": "SPIN Selling",
  "situation": "HCP is hesitant about switching patients to new therapy"
}
```

#### `POST /api/heuristics/customize`

Customize sales heuristic.

**Request:**
```json
{
  "heuristic": "Always start with a question",
  "context": "Oncology KOL meetings"
}
```

**Response:**
```json
{
  "customized": "For Oncology KOL meetings: Start with a clinical question that demonstrates your understanding of their research interests and current treatment challenges...",
  "original": "Always start with a question",
  "context": "Oncology KOL meetings"
}
```

#### `POST /api/modules/exercise`

Generate training exercise.

**Request:**
```json
{
  "module": "Objection Handling",
  "skill": "Reframing objections as opportunities"
}
```

**Response:**
```json
{
  "exercise": "Exercise: Objection Reframing Practice\n\nObjective: Learn to reframe objections as opportunities for deeper discovery...\n\nInstructions:\n1. List 3 common objections...\n2. For each objection, identify the underlying concern...\n3. Write a reframing question...\n\nSuccess Criteria: You can reframe 80% of objections into discovery opportunities...\n\nEstimated Time: 20 minutes",
  "module": "Objection Handling",
  "skill": "Reframing objections as opportunities"
}
```

### Coach Prompts Endpoint

#### `GET|POST /api/coach/prompts`

Get context-aware conversation starters.

**Request (POST):**
```json
{
  "context": {
    "diseaseState": "Oncology",
    "specialty": "Medical Oncology",
    "hcpCategory": "Key Opinion Leader",
    "influenceDriver": "Clinical Evidence"
  }
}
```

**Response:**
```json
{
  "conversationStarters": [
    "What are your biggest challenges with [disease state] patients?",
    "How do you currently approach treatment decisions for [condition]?",
    "What would make the biggest difference in your patient outcomes?"
  ],
  "suggestedTopics": [
    "Clinical evidence review",
    "Patient case studies",
    "Formulary access strategies",
    "Treatment algorithms",
    "Safety considerations",
    "Real-world outcomes data"
  ],
  "context": {...},
  "timestamp": "2025-12-29T23:00:00.000Z"
}
```

---

## Testing

### Local Development

```bash
# Start local dev server
wrangler dev

# Test health endpoint
curl http://localhost:8787/health

# Test chat endpoint
curl -X POST http://localhost:8787/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I handle objections?"}'
```

### Production Testing

```bash
# Set worker URL
export WORKER_URL="https://reflectivai-worker.YOUR_SUBDOMAIN.workers.dev"

# Test health
curl "$WORKER_URL/health"

# Test status
curl "$WORKER_URL/api/status"

# Test dashboard insights
curl "$WORKER_URL/api/dashboard/insights"

# Test chat
curl -X POST "$WORKER_URL/api/chat/send" \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test-session-123" \
  -d '{"message":"How do I handle objections from HCPs?"}'
```

---

## Monitoring

### View Logs

```bash
# Real-time logs
wrangler tail

# Filter by status
wrangler tail --status error

# Filter by method
wrangler tail --method POST
```

### View Deployments

```bash
# List deployments
wrangler deployments list

# View specific deployment
wrangler deployments view <deployment-id>
```

### View KV Data

```bash
# List all session keys
wrangler kv:key list --namespace-id YOUR_KV_NAMESPACE_ID

# Get specific session
wrangler kv:key get "sess:SESSION_ID" --namespace-id YOUR_KV_NAMESPACE_ID
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** Browser shows CORS policy errors

**Solution:**
```bash
# Add your domain to CORS_ORIGINS in wrangler.toml
# Then redeploy
wrangler deploy
```

#### 2. 401 Unauthorized

**Symptom:** API returns 401 errors

**Solution:**
```bash
# Verify secrets are set
wrangler secret list

# Re-add API key
wrangler secret put PROVIDER_KEY
```

#### 3. KV Namespace Not Found

**Symptom:** Worker fails to load/save state

**Solution:**
```bash
# List KV namespaces
wrangler kv:namespace list

# Verify ID in wrangler.toml matches
grep "id =" wrangler.toml
```

#### 4. Worker Not Responding

**Symptom:** Requests timeout or fail

**Solution:**
```bash
# Check deployment status
wrangler deployments list

# View recent logs
wrangler tail --since 5m

# Redeploy
wrangler deploy
```

---

## Architecture

### Request Flow

```
Client Request
  ↓
CORS Check
  ↓
Route Matching
  ↓
Session ID Extraction/Generation
  ↓
Load State from KV
  ↓
Endpoint Handler
  ↓
AI Provider Call (if needed)
  ↓
Signal Parsing (if applicable)
  ↓
Save State to KV
  ↓
CORS Response
```

### State Management

```javascript
{
  chatMessages: [
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ],
  sqlQueries: [
    { id, naturalLanguage, sqlQuery, explanation, timestamp }
  ],
  roleplay: {
    scenario,
    conversationHistory,
    startTime,
    turnCount
  },
  signals: [
    { type, observation, interpretation, coaching, timestamp }
  ]
}
```

### AI Provider Selection

```javascript
// Key rotation logic
function selectKey(env) {
  // 1. Try PROVIDER_KEYS pool (random selection)
  // 2. Fall back to PROVIDER_KEY
  // 3. Fall back to OPENAI_API_KEY
  // 4. Throw error if none configured
}

// Provider detection
const isGroq = key.startsWith('gsk_');
const url = isGroq ? GROQ_URL : OPENAI_URL;
const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o';
```

---

## Performance

### Optimization Strategies

1. **Message History Limits**
   - Chat: Last 100 messages
   - Roleplay: Full conversation (limited by session duration)
   - SQL: Last 50 queries
   - Signals: Last 50 signals

2. **KV Storage**
   - 24-hour TTL on all sessions
   - Sanitized data (remove large content)
   - Efficient serialization

3. **AI Provider**
   - Key rotation for load balancing
   - Configurable timeouts
   - Error handling with retries

4. **CORS**
   - Preflight caching (86400 seconds)
   - Origin validation
   - Minimal headers

---

## Security

### Best Practices

1. **API Keys**
   - Store as secrets (never in code)
   - Use key rotation for load balancing
   - Monitor usage and costs

2. **CORS**
   - Whitelist specific origins
   - Validate origin on every request
   - Use secure headers

3. **Session Management**
   - Generate unique session IDs
   - 24-hour TTL
   - Sanitize stored data

4. **Input Validation**
   - Validate all request bodies
   - Limit message lengths
   - Sanitize user input

---

## License

Proprietary - ReflectivAI Platform

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Review deployment logs
3. Verify configuration
4. Contact platform support

---

**Version:** 2.0.0  
**Last Updated:** December 29, 2025  
**Status:** Production Ready
