import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { initializeSession } from '../sessionStore.js';

const mockResponses = [
  "That's a great question! In pharmaceutical sales, building trust with HCPs is crucial. Let me share some insights...\n\nWhen approaching a new HCP, consider these key points:\n\n**1. Research First**: Understand their practice, patient demographics, and current treatment protocols.\n\n**2. Lead with Value**: Focus on patient outcomes rather than product features.\n\n**3. Active Listening**: Pay attention to their concerns and adapt your approach accordingly.",
  
  "I understand your concern. When approaching objections, it's important to listen actively and validate their perspective first.\n\nHere's a proven framework:\n\n**Listen**: Let them fully express their concern\n**Acknowledge**: Validate their perspective\n**Explore**: Ask clarifying questions\n**Respond**: Address with evidence and empathy",
  
  "Excellent point! The DISC framework can really help here. Based on what you've described, this HCP seems to have a high D (Dominance) profile.\n\n**Key Characteristics**:\n- Direct and results-oriented\n- Values efficiency and bottom-line impact\n- Prefers data-driven discussions\n\n**Your Approach**:\n- Be concise and focused\n- Lead with outcomes and ROI\n- Provide clear, evidence-based recommendations",
  
  "Let's break this down using the Signal Intelligence™ framework. The 6 core competencies are:\n\n**1. Active Listening**: Fully engaging with what the HCP is saying\n**2. Empathy**: Understanding their perspective and challenges\n**3. Adaptability**: Adjusting your approach based on their style\n**4. Influence**: Building credibility and trust\n**5. Objection Handling**: Addressing concerns effectively\n**6. Relationship Building**: Creating long-term partnerships\n\nWhich competency would you like to focus on?",
  
  "That's a common challenge in life sciences sales. Have you considered using the SPIN selling technique?\n\n**SPIN Framework**:\n\n**Situation**: Questions to understand their current state\n**Problem**: Questions to uncover pain points\n**Implication**: Questions to explore consequences\n**Need-Payoff**: Questions to highlight solution benefits\n\nThis approach helps HCPs recognize the value of your solution themselves, rather than feeling 'sold to'."
];

export default async function handler(req: Request, res: Response) {
  try {
    // Generate or reuse session ID
    const sessionId = req.headers['x-session-id'] as string || randomUUID();
    res.setHeader('x-session-id', sessionId);
    
    const { message, content, context } = req.body;
    const userMessage = message || content;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session messages
    const messages = initializeSession(sessionId);

    // Create user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create AI response
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const aiMsg = {
      id: `ai-${Date.now()}`,
      role: 'assistant' as const,
      content: randomResponse,
      timestamp: new Date().toISOString()
    };

    // Add to session
    messages.push(userMsg, aiMsg);

    // Return both messages in the format expected by the frontend
    res.json({
      userMessage: userMsg,
      aiMessage: aiMsg,
      messages: messages,
      sessionId: sessionId,
      context: context || {}
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: String(error) });
  }
}
