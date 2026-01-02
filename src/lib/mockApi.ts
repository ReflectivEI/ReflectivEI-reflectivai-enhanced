// Mock API configuration and utilities
export const MOCK_API_ENABLED = process.env.NEXT_PUBLIC_MOCK_API === 'true';

// Check if mock API is enabled
export function isMockApiEnabled(): boolean {
  return MOCK_API_ENABLED;
}

// Mock API request handler
export async function mockApiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Handle different endpoints
  if (endpoint.includes('/api/auth/session')) {
    return {
      user: {
        id: 'mock-user-id',
        email: 'mock@example.com',
        name: 'Mock User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as T;
  }

  if (endpoint.includes('/api/reflections')) {
    if (options?.method === 'POST') {
      return {
        id: `mock-reflection-${Date.now()}`,
        content: 'Mock reflection created',
        createdAt: new Date().toISOString(),
      } as T;
    }

    return {
      reflections: [
        {
          id: 'mock-reflection-1',
          content: 'This is a mock reflection',
          createdAt: new Date().toISOString(),
        },
      ],
    } as T;
  }

  if (endpoint.includes('/api/insights')) {
    return {
      insights: [
        {
          id: 'mock-insight-1',
          title: 'Mock Insight',
          description: 'This is a mock insight generated for testing',
          createdAt: new Date().toISOString(),
        },
      ],
    } as T;
  }

  // Default response
  return {} as T;
}

// Get mock session ID
export function getMockSessionId(): string {
  return 'mock-session-id';
}
