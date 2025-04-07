import type { Express, Request, Response, NextFunction } from "express";
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
import { setupAuth } from "./auth";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // API routes
  
  // Projects (authenticated)
  app.post('/api/projects', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const project = await storage.createProject({
        ...req.body,
        userId: req.user.id
      });
      
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to create project',
        error: errorMessage 
      });
    }
  });
  
  app.get('/api/projects', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projects = await storage.getProjectsByUserId(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to fetch projects',
        error: errorMessage 
      });
    }
  });
  
  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Get the sessions for this project
      const projectSessions = await storage.getSessionsByProjectId(projectId);
      
      // Return project with sessions
      res.json({
        ...project,
        sessions: projectSessions.map(s => s.id)
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to fetch project',
        error: errorMessage 
      });
    }
  });
  
  app.patch('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to update project',
        error: errorMessage 
      });
    }
  });
  
  app.delete('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting project:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to delete project',
        error: errorMessage 
      });
    }
  });
  
  // Sessions
  app.post('/api/sessions', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { id, projectId, title } = req.body;
      const sessionId = id || nanoid();
      
      // Create session
      const session = await storage.createSession({
        id: sessionId,
        isComplete: false,
        userId: req.user.id,
        projectId: projectId || null,
        title: title || 'New Session'
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to create session',
        error: errorMessage 
      });
    }
  });
  
  // Get all sessions for a user
  app.get('/api/sessions', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if project ID is provided
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : null;
      
      let sessions;
      if (projectId && !isNaN(projectId)) {
        // Get sessions for a project
        sessions = await storage.getSessionsByProjectId(projectId);
        
        // Verify the project belongs to the user
        const project = await storage.getProject(projectId);
        if (!project || project.userId !== req.user.id) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      } else {
        // Get all sessions for the user
        sessions = await storage.getSessionsByUserId(req.user.id);
      }
      
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to fetch sessions',
        error: errorMessage 
      });
    }
  });
  
  app.get('/api/sessions/:id', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Verify the session belongs to the user
      if (session.userId && session.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to fetch session',
        error: errorMessage 
      });
    }
  });
  
  app.patch('/api/sessions/:id', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { id } = req.params;
      const updates = req.body;
      
      // Get the current session
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Verify the session belongs to the user
      if (session.userId && session.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // If updating projectId, verify the project belongs to the user
      if (updates.projectId && updates.projectId !== session.projectId) {
        const project = await storage.getProject(updates.projectId);
        if (!project || project.userId !== req.user.id) {
          return res.status(403).json({ message: 'Forbidden - Cannot assign to another user\'s project' });
        }
      }
      
      const updatedSession = await storage.updateSession(id, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to update session',
        error: errorMessage 
      });
    }
  });
  
  app.delete('/api/sessions/:id', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { id } = req.params;
      
      // Get the current session
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Verify the session belongs to the user
      if (session.userId && session.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const result = await storage.deleteSession(id);
      
      if (result) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete session' });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to delete session',
        error: errorMessage 
      });
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to create message',
        error: errorMessage 
      });
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to fetch messages',
        error: errorMessage 
      });
    }
  });
  
  // AI Response
  app.post('/api/chat/response', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }
      
      console.log(`Processing chat response for session: ${sessionId}`);
      
      // Get the session
      let session = await storage.getSession(sessionId);
      
      // If session doesn't exist, create a new one
      if (!session) {
        console.log(`Session not found: ${sessionId}. Creating new session.`);
        session = await storage.createSession({
          id: sessionId,
          isComplete: false,
          title: 'New Session'
        });
      }
      
      // Get the messages for this session
      const messages = await storage.getMessagesBySessionId(sessionId);
      
      console.log(`Found ${messages.length} messages for session: ${sessionId}`);
      
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
        content: aiResponse || "Hello! I'm AI Buddy from Digital Village. How can I help you plan your AI solution today?"
      });
      
      console.log(`Created new assistant message with ID: ${aiMessage.id}`);
      
      // Update the session with extracted information
      let updatedSession = session;
      if (extractedInfo) {
        updatedSession = await storage.updateSession(sessionId, {
          ...extractedInfo,
          isComplete: !!generateOutputs
        }) || session;
        
        console.log(`Updated session with extracted information: ${JSON.stringify(extractedInfo)}`);
      }
      
      // Get any existing outputs
      const outputs = generateOutputs ? await storage.getOutputsBySessionId(sessionId) : [];
      
      // Return the AI message, session, and outputs
      res.json({
        message: aiMessage,
        session: updatedSession,
        outputs,
        generateOutputs
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
      
      res.status(500).json({ 
        message: 'Failed to generate AI response',
        error: errorMessage,
        stack: errorStack
      });
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to generate outputs',
        error: errorMessage 
      });
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to fetch outputs',
        error: errorMessage 
      });
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to call OpenAI API',
        error: errorMessage 
      });
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
