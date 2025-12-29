import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

export default async function handler(req: Request, res: Response) {
  // Generate or reuse session ID
  const sessionId = req.headers['x-session-id'] as string || randomUUID();
  res.setHeader('x-session-id', sessionId);
  
  res.json({
    success: true,
    message: 'Chat history cleared',
    sessionId: sessionId
  });
}
