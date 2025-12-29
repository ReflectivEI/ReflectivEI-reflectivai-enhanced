import type { Request, Response } from "express";
import { randomUUID } from "crypto";

export default async function handler(req: Request, res: Response) {
	// Generate or reuse session ID
	const sessionId = req.headers['x-session-id'] as string || randomUUID();
	
	// Set session ID header for client
	res.setHeader('x-session-id', sessionId);
	
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		message: "ReflectivAI API is healthy",
		sessionId: sessionId
	});
}
