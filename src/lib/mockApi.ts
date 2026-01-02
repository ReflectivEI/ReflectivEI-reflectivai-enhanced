// Mock API configuration
// Set to false in production to use the actual Cloudflare Worker
// Set to true during development if you want to use mock data
export const MOCK_API_ENABLED = false;

// Mock delay to simulate network latency (in ms)
export const MOCK_DELAY = 500;

// Mock user data
export const MOCK_USER = {
  id: 'mock-user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date('2024-01-01'),
};

// Mock conversation data
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    userId: 'mock-user-123',
    title: 'Introduction to AI',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'conv-2',
    userId: 'mock-user-123',
    title: 'Machine Learning Basics',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
];

// Mock message data
export const MOCK_MESSAGES = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'What is artificial intelligence?',
      createdAt: new Date('2024-01-15T10:00:00'),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines...',
      createdAt: new Date('2024-01-15T10:00:05'),
    },
  ],
  'conv-2': [
    {
      id: 'msg-3',
      conversationId: 'conv-2',
      role: 'user',
      content: 'Explain machine learning',
      createdAt: new Date('2024-01-14T15:30:00'),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-2',
      role: 'assistant',
      content: 'Machine Learning is a subset of AI that enables systems to learn and improve from experience...',
      createdAt: new Date('2024-01-14T15:30:08'),
    },
  ],
};
