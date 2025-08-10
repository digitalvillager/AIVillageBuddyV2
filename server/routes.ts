import type { Express, Request, Response, NextFunction } from "express";
import validator from "validator";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIResponse } from "./lib/openai";
import { MailchimpEmailService } from "./lib/MailchimpEmailService";
import {
  generateImplementationPlan,
  /*generateCostEstimate,
  generateDesignConcept,
  generateBusinessCase,
  generateAIConsiderations,*/
} from "./lib/output-generator";
import { nanoid } from "nanoid";
import { setupAuth } from "./auth";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes

  // Super admin creation route
  app.post("/api/superadmin", isAdmin, async (req, res) => {
    try {
      const user = await storage.createUser({
        username: "dv-jason",
        email: "jason@digitalvillage.com.au",
        password: await hashPassword("iforget"),
        name: null,
        isAdmin: true,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create super admin user" });
    }
  });

  // Admin routes (authenticated)
  app.get("/api/admin/ai-config", isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getAllAIConfigurations();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching AI configurations:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch AI configurations",
        error: errorMessage,
      });
    }
  });

  app.get("/api/admin/ai-config/active", async (req, res) => {
    try {
      const config = await storage.getActiveAIConfiguration();
      if (!config) {
        return res
          .status(404)
          .json({ message: "No active AI configuration found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching active AI configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch active AI configuration",
        error: errorMessage,
      });
    }
  });

  app.get("/api/admin/ai-config/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const config = await storage.getAIConfiguration(id);
      if (!config) {
        return res.status(404).json({ message: "AI configuration not found" });
      }

      res.json(config);
    } catch (error) {
      console.error("Error fetching AI configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch AI configuration",
        error: errorMessage,
      });
    }
  });

  app.post("/api/admin/ai-config", isAuthenticated, async (req, res) => {
    try {
      const newConfig = await storage.createAIConfiguration(req.body);
      res.status(201).json(newConfig);
    } catch (error) {
      console.error("Error creating AI configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to create AI configuration",
        error: errorMessage,
      });
    }
  });

  app.patch("/api/admin/ai-config/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const config = await storage.getAIConfiguration(id);
      if (!config) {
        return res.status(404).json({ message: "AI configuration not found" });
      }

      const updatedConfig = await storage.updateAIConfiguration(id, req.body);
      res.json(updatedConfig);
    } catch (error) {
      console.error("Error updating AI configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to update AI configuration",
        error: errorMessage,
      });
    }
  });

  app.delete("/api/admin/ai-config/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const config = await storage.getAIConfiguration(id);
      if (!config) {
        return res.status(404).json({ message: "AI configuration not found" });
      }

      await storage.deleteAIConfiguration(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting AI configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to delete AI configuration",
        error: errorMessage,
      });
    }
  });

  app.post(
    "/api/admin/ai-config/:id/activate",
    isAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
        }

        const config = await storage.getAIConfiguration(id);
        if (!config) {
          return res
            .status(404)
            .json({ message: "AI configuration not found" });
        }

        const success = await storage.setActiveAIConfiguration(id);
        if (!success) {
          return res
            .status(500)
            .json({ message: "Failed to set active configuration" });
        }

        const updatedConfig = await storage.getAIConfiguration(id);
        res.json(updatedConfig);
      } catch (error) {
        console.error("Error activating AI configuration:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        res.status(500).json({
          message: "Failed to activate AI configuration",
          error: errorMessage,
        });
      }
    },
  );

  // Projects (authenticated)
  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("req.body:");
      console.log(req.body);

      const project = await storage.createProject({
        ...req.body,
        userId: req.user.id,
      });

      console.log("project created:");
      console.log(project);

      // update the session with the project id
      await storage.updateSession(req.body.sessionId, {
        projectId: project.id,
      });

      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to create project",
        error: errorMessage,
      });
    }
  });

  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projects = await storage.getProjectsByUserId(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch projects",
        error: errorMessage,
      });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get the sessions for this project
      const projectSessions = await storage.getSessionsByProjectId(projectId);

      // Return project with sessions
      res.json({
        ...project,
        sessions: projectSessions.map((s) => s.id),
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch project",
        error: errorMessage,
      });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log("patch projects/:id req.body:");
      console.log(req.body);

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to update project",
        error: errorMessage,
      });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to delete project",
        error: errorMessage,
      });
    }
  });

  // Sessions
  app.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id, projectId, title } = req.body;
      const sessionId = id || nanoid();

      // Create session
      const session = await storage.createSession({
        id: sessionId,
        isComplete: false,
        userId: req.user.id,
        projectId: projectId || null,
        title: title || "New Session",
      });

      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to create session",
        error: errorMessage,
      });
    }
  });

  // Get all sessions for a user
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if project ID is provided
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : null;

      let sessions;
      if (projectId && !isNaN(projectId)) {
        // Get sessions for a project
        sessions = await storage.getSessionsByProjectId(projectId);

        // Verify the project belongs to the user
        const project = await storage.getProject(projectId);
        if (!project || project.userId !== req.user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        // Get all sessions for the user
        sessions = await storage.getSessionsByUserId(req.user.id);
      }

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch sessions",
        error: errorMessage,
      });
    }
  });

  app.get("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const session = await storage.getSession(id);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Verify the session belongs to the user
      if (session.userId && session.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch session",
        error: errorMessage,
      });
    }
  });

  app.patch("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const updates = req.body;

      // Get the current session
      const session = await storage.getSession(id);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Verify the session belongs to the user
      if (session.userId && session.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // If updating projectId, verify the project belongs to the user
      if (updates.projectId && updates.projectId !== session.projectId) {
        const project = await storage.getProject(updates.projectId);
        if (!project || project.userId !== req.user.id) {
          return res.status(403).json({
            message: "Forbidden - Cannot assign to another user's project",
          });
        }
      }

      const updatedSession = await storage.updateSession(id, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to update session",
        error: errorMessage,
      });
    }
  });

  app.delete("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      // Get the current session
      const session = await storage.getSession(id);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Verify the session belongs to the user
      if (session.userId && session.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = await storage.deleteSession(id);

      if (result) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete session" });
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to delete session",
        error: errorMessage,
      });
    }
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    try {
      const { sessionId, role, content } = req.body;

      const message = await storage.createMessage({
        sessionId,
        role,
        content,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to create message",
        error: errorMessage,
      });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        return res.status(200).json([]); // Return empty array instead of error
      }

      const messages = await storage.getMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch messages",
        error: errorMessage,
      });
    }
  });

  // AI Response
  app.post("/api/chat/response", async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
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
          title: "New Session",
        });
      }

      // Get project details if available
      let project = null;
      if (session.projectId) {
        project = await storage.getProject(session.projectId);
      }

      // Get user preferences if available
      let userPreferences = null;
      if (session.userId) {
        userPreferences = await storage.getUserPreferences(session.userId);
      }

      // Get the messages for this session
      const messages = await storage.getMessagesBySessionId(sessionId);

      console.log(
        `Found ${messages.length} messages for session: ${sessionId}`,
      );

      // Generate AI response with project and user context
      const { aiResponse, extractedInfo, generateOutputs } =
        await generateAIResponse(messages, session, project, userPreferences);

      // Create the AI message
      const aiMessage = await storage.createMessage({
        sessionId,
        role: "assistant",
        content:
          aiResponse ||
          "Hello! I'm AI Buddy from Digital Village. How can I help you plan your AI solution today?",
      });

      console.log(`Created new assistant message with ID: ${aiMessage.id}`);

      // Update the session with extracted information
      let updatedSession = session;
      if (extractedInfo) {
        updatedSession =
          (await storage.updateSession(sessionId, {
            ...extractedInfo,
            isComplete: !!generateOutputs,
          })) || session;

        console.log(
          `Updated session with extracted information: ${JSON.stringify(extractedInfo)}`,
        );
      }

      // Get any existing outputs
      const outputs = generateOutputs
        ? await storage.getOutputsBySessionId(sessionId)
        : [];

      // Return the AI message, session, and outputs
      res.json({
        message: aiMessage,
        session: updatedSession,
        outputs,
        generateOutputs,
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack =
        error instanceof Error && process.env.NODE_ENV === "development"
          ? error.stack
          : undefined;

      res.status(500).json({
        message: "Failed to generate AI response",
        error: errorMessage,
        stack: errorStack,
      });
    }
  });

  // Outputs
  app.post("/api/outputs/generate", async (req, res) => {
    try {
      const { sessionId, projectId } = req.body;

      // Get the session
      const session = await storage.getSession(sessionId);

      console.log("session:");
      console.log(session);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const project = await storage.getProject(projectId);

      console.log("project:");
      console.log(project);

      // Generate all outputs
      const [
        implementation /*, cost, design, businessCase, aiConsiderations*/,
      ] = await Promise.all([
        generateImplementationPlan(session, project!) /*,
        generateCostEstimate(session, project!),
        generateDesignConcept(session),
        generateBusinessCase(session),
        generateAIConsiderations(session)*/,
      ]);

      // Store the outputs
      const outputs = await Promise.all([
        storage.createOrUpdateOutput({
          sessionId,
          type: "implementation",
          content: implementation,
        }) /* ,
        storage.createOrUpdateOutput({
          sessionId,
          type: "cost",
          content: cost,
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: "design",
          content: design,
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: "business",
          content: businessCase,
        }),
        storage.createOrUpdateOutput({
          sessionId,
          type: "ai",
          content: aiConsiderations,
          }),*/,
      ]);

      res.json(outputs);
    } catch (error) {
      console.error("Error generating outputs:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to generate outputs",
        error: errorMessage,
      });
    }
  });

  app.get("/api/outputs", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        return res.status(200).json([]); // Return empty array instead of error
      }

      const outputs = await storage.getOutputsBySessionId(sessionId);
      res.json(outputs);
    } catch (error) {
      console.error("Error fetching outputs:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch outputs",
        error: errorMessage,
      });
    }
  });

  app.get("/api/outputs/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      const output = await storage.getOutputBySessionIdAndType(sessionId, type);

      if (!output) {
        return res.status(404).json({ message: "Output not found" });
      }

      res.json(output);
    } catch (error) {
      console.error("Error fetching output:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch output",
        error: errorMessage,
      });
    }
  });

  // User routes
  app.get("/api/user", async (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // Super admin routes for managing admins
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        name: null,
        isAdmin: true,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // Get query parameter to determine if we should return all users or just admins
      const showAllUsers = req.query.all === "true";

      // Fetch users based on the query parameter
      const users = showAllUsers
        ? await storage.getAllUsers()
        : await storage.getAdminUsers();

      res.json(users);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        message: "Failed to fetch users",
        error: errorMessage,
      });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete admin user" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  app.post(
    "/api/user/profile-photo",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const { profilePhoto } = req.body;
        if (!profilePhoto) {
          return res.status(400).json({ message: "No profile photo provided" });
        }
        const updatedUser = await storage.updateUser(req.user.id, {
          profilePhoto,
        });
        res
          .status(200)
          .json({ message: "Profile photo updated", user: updatedUser });
      } catch (error) {
        console.error("Profile photo update error:", error);
        res.status(500).json({ message: "Failed to update profile photo" });
      }
    },
  );

  // User preferences endpoints
  app.get(
    "/api/user/preferences",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const preferences = await storage.getUserPreferences(req.user.id);
        res.status(200).json(preferences);
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
        res.status(500).json({ message: "Failed to fetch user preferences" });
      }
    },
  );

  app.post(
    "/api/user/preferences",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const preferences = req.body;
        const updatedPreferences = await storage.updateUserPreferences(
          req.user.id,
          preferences,
        );
        res.status(200).json(updatedPreferences);
      } catch (error) {
        console.error("Failed to update user preferences:", error);
        res.status(500).json({ message: "Failed to update user preferences" });
      }
    },
  );

  app.post("/api/email", (req, res) => {
    const emailData = JSON.stringify({
      submitted_by: req.body.email,
      implementation_plan: req.body.implementation_plan,
    });

    MailchimpEmailService.sendEmail(emailData);

    return res.status(200).json({
      message: "Email processed successfully",
      contentLength: emailData.length,
    });
  });

  return httpServer;
}
