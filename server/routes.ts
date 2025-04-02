import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIResponse } from "./lib/openai";
import { 
  generateImplementationPlan, 
  generateCostEstimate, 
  generateDesignConcept, 
  generateBusinessCase, 
  generateAIConsiderations 
} from "./lib/output-generator";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Sessions
  app.post('/api/sessions', async (req, res) => {
    try {
      const { id } = req.body;
      const sessionId = id || nanoid();
      
      const session = await storage.createSession({
        id: sessionId,
        isComplete: false
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ message: 'Failed to create session' });
    }
  });
  
  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ message: 'Failed to fetch session' });
    }
  });
  
  app.patch('/api/sessions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedSession = await storage.updateSession(id, updates);
      
      if (!updatedSession) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ message: 'Failed to update session' });
    }
  });
  
  // Messages
  app.post('/api/messages', async (req, res) => {
    try {
      const { sessionId, role, content } = req.body;
      
      const message = await storage.createMessage({
        sessionId,
        role,
        content
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Failed to create message' });
    }
  });
  
  app.get('/api/messages', async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      
      if (!sessionId) {
        return res.status(200).json([]); // Return empty array instead of error
      }
      
      const messages = await storage.getMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });
  
  // AI Response
  app.post('/api/chat/response', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      // Get the session
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Get the messages for this session
      const messages = await storage.getMessagesBySessionId(sessionId);
      
      // Generate AI response
      const { 
        aiResponse, 
        extractedInfo,
        generateOutputs 
      } = await generateAIResponse(messages, session);
      
      // Create the AI message
      const aiMessage = await storage.createMessage({
        sessionId,
        role: 'assistant',
        content: aiResponse
      });
      
      // Update the session with extracted information
      if (extractedInfo) {
        await storage.updateSession(sessionId, {
          ...extractedInfo,
          isComplete: !!generateOutputs
        });
      }
      
      // Return the AI message
      res.json({
        ...aiMessage,
        generateOutputs
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      res.status(500).json({ message: 'Failed to generate AI response' });
    }
  });
  
  // Outputs
  app.post('/api/outputs/generate', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      // Get the session
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Generate all outputs
      const [implementation, cost, design, businessCase, aiConsiderations] = await Promise.all([
        generateImplementationPlan(session),
        generateCostEstimate(session),
        generateDesignConcept(session),
        generateBusinessCase(session),
        generateAIConsiderations(session)
      ]);
      
      // Store the outputs
      const outputs = await Promise.all([
        storage.createOrUpdateOutput({
          sessionId,
          type: 'implementation',
          content: implementation
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: 'cost',
          content: cost
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: 'design',
          content: design
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: 'business-case',
          content: businessCase
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: 'ai-considerations',
          content: aiConsiderations
        })
      ]);
      
      res.json(outputs);
    } catch (error) {
      console.error('Error generating outputs:', error);
      res.status(500).json({ message: 'Failed to generate outputs' });
    }
  });
  
  app.get('/api/outputs', async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      
      if (!sessionId) {
        return res.status(200).json([]); // Return empty array instead of error
      }
      
      const outputs = await storage.getOutputsBySessionId(sessionId);
      res.json(outputs);
    } catch (error) {
      console.error('Error fetching outputs:', error);
      res.status(500).json({ message: 'Failed to fetch outputs' });
    }
  });
  
  // OpenAI API
  app.post('/api/openai/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: 'Messages array is required' });
      }
      
      // Call OpenAI API
      const openaiResponse = await fetchOpenAIResponse(messages);
      
      res.json({ message: openaiResponse });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ message: 'Failed to call OpenAI API' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock function for OpenAI response - this should be replaced with actual OpenAI API call
async function fetchOpenAIResponse(messages: any[]) {
  // In a real implementation, this would call the OpenAI API
  return {
    role: 'assistant',
    content: 'This is a simulated response. In a real implementation, this would be a response from the OpenAI API.'
  };
}
