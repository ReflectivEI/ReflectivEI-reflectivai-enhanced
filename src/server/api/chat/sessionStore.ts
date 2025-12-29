// Shared in-memory message store for chat sessions
// In a real app, this would be a database

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export const sessionMessages = new Map<string, ChatMessage[]>();

// Initialize a session with a welcome message
export function initializeSession(sessionId: string): ChatMessage[] {
  if (!sessionMessages.has(sessionId)) {
    sessionMessages.set(sessionId, [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: 'Hello! I\'m your AI Sales Coach. How can I help you today?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  }
  return sessionMessages.get(sessionId)!;
}

// Clear a session
export function clearSession(sessionId: string): void {
  sessionMessages.delete(sessionId);
}
