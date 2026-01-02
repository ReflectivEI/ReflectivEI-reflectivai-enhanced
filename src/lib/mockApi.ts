// Mock API configuration
// Set to false to use real API endpoints
// Set to true to use mock data
export const MOCK_API_ENABLED = false;

// Mock delay in milliseconds
export const MOCK_DELAY = 500;

// Mock user data
export const mockUser = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
};

// Mock reflection data
export const mockReflections = [
  {
    id: '1',
    userId: '1',
    content: 'Today I learned about the importance of regular reflection in personal growth.',
    mood: 'positive',
    tags: ['learning', 'growth'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    content: 'Feeling grateful for the support of my team during challenging times.',
    mood: 'grateful',
    tags: ['gratitude', 'teamwork'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Mock insights
export const mockInsights = {
  weeklyTrend: {
    positive: 5,
    neutral: 2,
    negative: 1,
  },
  topTags: ['learning', 'growth', 'gratitude', 'teamwork'],
  reflectionCount: 24,
  currentStreak: 7,
};