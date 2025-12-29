import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { initializeSession } from '../sessionStore.js';

export default async function handler(req: Request, res: Response) {
  // Generate or reuse session ID
  const sessionId = req.headers['x-session-id'] as string || randomUUID();
  res.setHeader('x-session-id', sessionId);
  
  // Get or create session messages
  const messages = initializeSession(sessionId);
  
  res.json({
    messages: messages,
    sessionId: sessionId
  });
}
