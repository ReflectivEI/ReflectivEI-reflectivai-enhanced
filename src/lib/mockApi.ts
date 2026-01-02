export const MOCK_API_ENABLED = false;

interface MockResponse {
  data?: any;
  error?: string;
  status: number;
}

let mockSessionId = '';

function getMockSessionId(): string {
  if (!mockSessionId) {
    mockSessionId = `mock-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return mockSessionId;
}

export async function mockApiRequest(
  endpoint: string,
  options?: RequestInit
): Promise<MockResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : null;

  // Status endpoint
  if (endpoint === '/api/status' && method === 'GET') {
    return {
      status: 200,
      data: {
        authenticated: true,
        sessionId: getMockSessionId(),
        user: {
          id: 'mock-user-1',
          name: 'Demo User',
          email: 'demo@reflectivei.com'
        }
      }
    };
  }

  // Health endpoint
  if (endpoint === '/api/health' && method === 'GET') {
    return {
      status: 200,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'up',
          api: 'up',
          ml: 'up'
        }
      }
    };
  }

  // Dashboard insights endpoint
  if (endpoint === '/api/dashboard/insights' && method === 'GET') {
    return {
      status: 200,
      data: {
        insights: [
          {
            id: '1',
            type: 'pattern',
            title: 'Communication Pattern Detected',
            description: 'You tend to ask more questions in the afternoon, showing increased curiosity during this time.',
            confidence: 0.85,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            type: 'emotion',
            title: 'Emotional Trend',
            description: 'Your recent conversations show a positive emotional trend, with increased expressions of satisfaction.',
            confidence: 0.78,
            timestamp: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            type: 'behavior',
            title: 'Engagement Insight',
            description: 'You engage more deeply with technical topics, spending 40% more time on these discussions.',
            confidence: 0.92,
            timestamp: new Date(Date.now() - 259200000).toISOString()
          }
        ],
        summary: {
          totalInsights: 3,
          newInsights: 1,
          lastUpdated: new Date().toISOString()
        }
      }
    };
  }

  // Chat endpoint
  if (endpoint === '/api/chat' && method === 'POST') {
    const userMessage = body?.message || '';
    
    // Simulate AI response based on input
    const responses = [
      "That's an interesting question. Based on your previous interactions, I can help you explore that further.",
      "I understand what you're asking. Let me provide some insights based on your patterns.",
      "That's a thoughtful point. Your conversation history shows you're particularly interested in this topic.",
      "Great question! Let me analyze that from multiple perspectives."
    ];
    
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      status: 200,
      data: {
        message: aiResponse,
        messageId: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        analysis: {
          sentiment: 0.7 + Math.random() * 0.3,
          topics: ['general', 'inquiry'],
          intent: 'question'
        }
      }
    };
  }

  // Roleplay endpoint
  if (endpoint === '/api/roleplay' && method === 'POST') {
    const scenario = body?.scenario || 'general';
    const userInput = body?.input || '';
    
    return {
      status: 200,
      data: {
        response: `[Roleplay Mode: ${scenario}] I'm engaging with you in this scenario. ${userInput ? 'Your input: ' + userInput : 'How would you like to proceed?'}`,
        scenarioId: `scenario-${Date.now()}`,
        timestamp: new Date().toISOString(),
        context: {
          scenario,
          turn: 1,
          participants: ['user', 'ai']
        }
      }
    };
  }

  // Default 404 response
  return {
    status: 404,
    error: 'Endpoint not found in mock API'
  };
}

export function isMockApiEnabled(): boolean {
  return MOCK_API_ENABLED && typeof window !== 'undefined' && window.location.hostname.includes('github.io');
}
