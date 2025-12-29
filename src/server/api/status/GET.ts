import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

export default async function handler(req: Request, res: Response) {
  // Generate or reuse session ID
  const sessionId = req.headers['x-session-id'] as string || randomUUID();
  
  // Set session ID header for client
  res.setHeader('x-session-id', sessionId);
  
  res.json({
    status: 'ok',
    message: 'Mock API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock',
    sessionId: sessionId,
    openaiConfigured: true // Set to true to hide demo mode banner
  });
}
