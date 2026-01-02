// Mock API for demonstration purposes
// This simulates backend API calls

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Session {
  id: string;
  userId: string;
  timestamp: Date;
  duration: number;
  reflections: Reflection[];
}

export interface Reflection {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user'
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  }
];

// Mock session data
let mockSessions: Session[] = [
  {
    id: '1',
    userId: '1',
    timestamp: new Date('2024-01-15'),
    duration: 1800,
    reflections: [
      {
        id: '1',
        content: 'Today I learned about the importance of continuous reflection in personal growth.',
        timestamp: new Date('2024-01-15T10:00:00'),
        tags: ['learning', 'growth'],
        sentiment: 'positive'
      }
    ]
  }
];

export const mockApi = {
  // Authentication
  async login(email: string, password: string): Promise<User> {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      return user;
    }
    throw new Error('Invalid credentials');
  },

  async logout(): Promise<void> {
    await delay(300);
  },

  // User management
  async getCurrentUser(): Promise<User> {
    await delay(300);
    return mockUsers[0];
  },

  // Session management
  async getSessions(userId: string): Promise<Session[]> {
    await delay(500);
    return mockSessions.filter(s => s.userId === userId);
  },

  async createSession(userId: string): Promise<Session> {
    await delay(500);
    const newSession: Session = {
      id: String(mockSessions.length + 1),
      userId,
      timestamp: new Date(),
      duration: 0,
      reflections: []
    };
    mockSessions.push(newSession);
    return newSession;
  },

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    await delay(500);
    const sessionIndex = mockSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }
    mockSessions[sessionIndex] = { ...mockSessions[sessionIndex], ...updates };
    return mockSessions[sessionIndex];
  },

  // Reflection management
  async addReflection(sessionId: string, reflection: Omit<Reflection, 'id'>): Promise<Reflection> {
    await delay(500);
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    const newReflection: Reflection = {
      ...reflection,
      id: String(session.reflections.length + 1)
    };
    session.reflections.push(newReflection);
    return newReflection;
  },

  async updateReflection(sessionId: string, reflectionId: string, updates: Partial<Reflection>): Promise<Reflection> {
    await delay(500);
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    const reflectionIndex = session.reflections.findIndex(r => r.id === reflectionId);
    if (reflectionIndex === -1) {
      throw new Error('Reflection not found');
    }
    session.reflections[reflectionIndex] = { ...session.reflections[reflectionIndex], ...updates };
    return session.reflections[reflectionIndex];
  },

  async deleteReflection(sessionId: string, reflectionId: string): Promise<void> {
    await delay(500);
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    session.reflections = session.reflections.filter(r => r.id !== reflectionId);
  }
};
