import {
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Session,
  type InsertSession,
  type OutputDocument,
  type InsertOutputDocument,
  type Project,
  type InsertProject,
  type AIConfig,
  type InsertAIConfiguration,
  users,
  messages,
  sessions,
  outputDocuments,
  projects,
  aiConfigurations
} from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Project methods
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionsByUserId(userId: number): Promise<Session[]>;
  getSessionsByProjectId(projectId: number): Promise<Session[]>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  
  // Output document methods
  createOutputDocument(document: InsertOutputDocument): Promise<OutputDocument>;
  getOutputDocument(id: number): Promise<OutputDocument | undefined>;
  getOutputsBySessionId(sessionId: string): Promise<OutputDocument[]>;
  getOutputBySessionIdAndType(sessionId: string, type: string): Promise<OutputDocument | undefined>;
  updateOutputDocument(id: number, updates: Partial<OutputDocument>): Promise<OutputDocument | undefined>;
  createOrUpdateOutput(document: InsertOutputDocument): Promise<OutputDocument>;
  
  // AI Configuration methods
  getAIConfiguration(id: number): Promise<AIConfig | undefined>;
  getAllAIConfigurations(): Promise<AIConfig[]>;
  getActiveAIConfiguration(): Promise<AIConfig | undefined>;
  createAIConfiguration(config: InsertAIConfiguration): Promise<AIConfig>;
  updateAIConfiguration(id: number, updates: Partial<AIConfig>): Promise<AIConfig | undefined>;
  deleteAIConfiguration(id: number): Promise<boolean>;
  setActiveAIConfiguration(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private messages: Message[] = [];
  private sessions: Session[] = [];
  private outputDocuments: OutputDocument[] = [];
  private projects: Project[] = [];
  private aiConfigs: AIConfig[] = [];
  private nextUserId = 1;
  private nextMessageId = 1;
  private nextOutputDocumentId = 1;
  private nextProjectId = 1;
  private nextAIConfigId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const user = {
      id: this.nextUserId++,
      ...insertUser,
      created: now
    } as User;
    this.users.push(user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.find(user => user.id === id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates
    };
    
    const index = this.users.findIndex(u => u.id === id);
    this.users[index] = updatedUser;
    
    return updatedUser;
  }
  
  // Project methods
  async createProject(insertProject: InsertProject): Promise<Project> {
    const now = new Date();
    const project = {
      id: this.nextProjectId++,
      ...insertProject,
      created: now,
      updated: now
    } as Project;
    this.projects.push(project);
    return project;
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.find(project => project.id === id);
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return this.projects
      .filter(project => project.userId === userId)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }
  
  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.find(project => project.id === id);
    if (!project) return undefined;
    
    const updatedProject = {
      ...project,
      ...updates,
      updated: new Date()
    };
    
    const index = this.projects.findIndex(p => p.id === id);
    this.projects[index] = updatedProject;
    
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(project => project.id !== id);
    return this.projects.length < initialLength;
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    // Convert timestamp to string format consistently
    const timestamp = new Date().toISOString();
    const message = {
      id: this.nextMessageId++,
      ...insertMessage,
      timestamp
    } as unknown as Message;
    this.messages.push(message);
    return message;
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.find(message => message.id === id);
  }
  
  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return this.messages
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const now = new Date();
    const session = {
      ...insertSession,
      isComplete: insertSession.isComplete || false,
      created: now,
      updated: now
    } as Session;
    this.sessions.push(session);
    return session;
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.find(session => session.id === id);
  }
  
  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return this.sessions
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }
  
  async getSessionsByProjectId(projectId: number): Promise<Session[]> {
    return this.sessions
      .filter(session => session.projectId === projectId)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }
  
  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.find(session => session.id === id);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      ...updates,
      updated: new Date()
    };
    
    const index = this.sessions.findIndex(s => s.id === id);
    this.sessions[index] = updatedSession;
    
    return updatedSession;
  }
  
  async deleteSession(id: string): Promise<boolean> {
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter(session => session.id !== id);
    return this.sessions.length < initialLength;
  }
  
  // Output document methods
  async createOutputDocument(insertDocument: InsertOutputDocument): Promise<OutputDocument> {
    const now = new Date();
    const document = {
      id: this.nextOutputDocumentId++,
      ...insertDocument,
      created: now,
      updated: now
    } as OutputDocument;
    this.outputDocuments.push(document);
    return document;
  }
  
  async getOutputDocument(id: number): Promise<OutputDocument | undefined> {
    return this.outputDocuments.find(doc => doc.id === id);
  }
  
  async getOutputsBySessionId(sessionId: string): Promise<OutputDocument[]> {
    return this.outputDocuments.filter(doc => doc.sessionId === sessionId);
  }
  
  async getOutputBySessionIdAndType(sessionId: string, type: string): Promise<OutputDocument | undefined> {
    return this.outputDocuments.find(doc => doc.sessionId === sessionId && doc.type === type);
  }
  
  async updateOutputDocument(id: number, updates: Partial<OutputDocument>): Promise<OutputDocument | undefined> {
    const document = this.outputDocuments.find(doc => doc.id === id);
    if (!document) return undefined;
    
    const updatedDocument = {
      ...document,
      ...updates,
      updated: new Date()
    };
    
    const index = this.outputDocuments.findIndex(doc => doc.id === id);
    this.outputDocuments[index] = updatedDocument;
    
    return updatedDocument;
  }
  
  async createOrUpdateOutput(document: InsertOutputDocument): Promise<OutputDocument> {
    const existingDocument = await this.getOutputBySessionIdAndType(
      document.sessionId,
      document.type
    );
    
    if (existingDocument) {
      const updated = await this.updateOutputDocument(existingDocument.id, {
        content: document.content
      });
      return updated!;
    } else {
      return this.createOutputDocument(document);
    }
  }

  // AI Configuration methods
  async getAIConfiguration(id: number): Promise<AIConfig | undefined> {
    return this.aiConfigs.find(config => config.id === id);
  }

  async getAllAIConfigurations(): Promise<AIConfig[]> {
    return [...this.aiConfigs];
  }

  async getActiveAIConfiguration(): Promise<AIConfig | undefined> {
    return this.aiConfigs.find(config => config.isActive);
  }

  async createAIConfiguration(config: InsertAIConfiguration): Promise<AIConfig> {
    const now = new Date();
    const aiConfig = {
      id: this.nextAIConfigId++,
      ...config,
      isActive: config.isActive || false,
      createdAt: now,
      updatedAt: now
    } as AIConfig;
    
    // If this is set as active, deactivate all others
    if (aiConfig.isActive) {
      this.aiConfigs.forEach(c => {
        c.isActive = false;
      });
    }
    
    this.aiConfigs.push(aiConfig);
    return aiConfig;
  }

  async updateAIConfiguration(id: number, updates: Partial<AIConfig>): Promise<AIConfig | undefined> {
    const config = this.aiConfigs.find(config => config.id === id);
    if (!config) return undefined;
    
    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date()
    };
    
    // If this is set as active, deactivate all others
    if (updates.isActive) {
      this.aiConfigs.forEach(c => {
        if (c.id !== id) c.isActive = false;
      });
    }
    
    const index = this.aiConfigs.findIndex(c => c.id === id);
    this.aiConfigs[index] = updatedConfig;
    
    return updatedConfig;
  }

  async deleteAIConfiguration(id: number): Promise<boolean> {
    const initialLength = this.aiConfigs.length;
    this.aiConfigs = this.aiConfigs.filter(config => config.id !== id);
    return this.aiConfigs.length < initialLength;
  }

  async setActiveAIConfiguration(id: number): Promise<boolean> {
    const config = this.aiConfigs.find(config => config.id === id);
    if (!config) return false;
    
    // Deactivate all configurations
    this.aiConfigs.forEach(c => {
      c.isActive = false;
    });
    
    // Activate the selected configuration
    config.isActive = true;
    
    return true;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    // Ensure db is available
    if (!db) {
      throw new Error("Database is not initialized");
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database is not initialized");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    if (!db) throw new Error("Database is not initialized");
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    if (!db) throw new Error("Database is not initialized");
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updated));
  }
  
  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const now = new Date();
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...updates,
        updated: now
      })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    if (!db) throw new Error("Database is not initialized");
    
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // 1. Get all sessions associated with this project
        const projectSessions = await tx
          .select()
          .from(sessions)
          .where(eq(sessions.projectId, id));
        
        // 2. For each session, delete related output documents 
        for (const session of projectSessions) {
          // Delete output documents for this session
          await tx
            .delete(outputDocuments)
            .where(eq(outputDocuments.sessionId, session.id));
            
          // Delete messages for this session
          await tx
            .delete(messages)
            .where(eq(messages.sessionId, session.id));
        }
        
        // 3. Delete all sessions associated with this project
        await tx
          .delete(sessions)
          .where(eq(sessions.projectId, id));
        
        // 4. Finally, delete the project
        const result = await tx
          .delete(projects)
          .where(eq(projects.id, id));
        
        return result.rowCount !== null && result.rowCount > 0;
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    if (!db) throw new Error("Database is not initialized");
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    if (!db) throw new Error("Database is not initialized");
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp);
  }
  
  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    if (!db) throw new Error("Database is not initialized");
    const [session] = await db.insert(sessions).values({
      ...insertSession,
      isComplete: insertSession.isComplete || false
    }).returning();
    return session;
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }
  
  async getSessionsByUserId(userId: number): Promise<Session[]> {
    if (!db) throw new Error("Database is not initialized");
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.updated));
  }
  
  async getSessionsByProjectId(projectId: number): Promise<Session[]> {
    if (!db) throw new Error("Database is not initialized");
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId))
      .orderBy(desc(sessions.updated));
  }
  
  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const now = new Date();
    const [updatedSession] = await db
      .update(sessions)
      .set({
        ...updates,
        updated: now
      })
      .where(eq(sessions.id, id))
      .returning();
    
    return updatedSession;
  }
  
  async deleteSession(id: string): Promise<boolean> {
    if (!db) throw new Error("Database is not initialized");
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Output document methods
  async createOutputDocument(insertDocument: InsertOutputDocument): Promise<OutputDocument> {
    if (!db) throw new Error("Database is not initialized");
    const [document] = await db.insert(outputDocuments).values(insertDocument).returning();
    return document;
  }
  
  async getOutputDocument(id: number): Promise<OutputDocument | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [document] = await db.select().from(outputDocuments).where(eq(outputDocuments.id, id));
    return document;
  }
  
  async getOutputsBySessionId(sessionId: string): Promise<OutputDocument[]> {
    if (!db) throw new Error("Database is not initialized");
    return await db
      .select()
      .from(outputDocuments)
      .where(eq(outputDocuments.sessionId, sessionId));
  }
  
  async getOutputBySessionIdAndType(sessionId: string, type: string): Promise<OutputDocument | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [document] = await db
      .select()
      .from(outputDocuments)
      .where(
        and(
          eq(outputDocuments.sessionId, sessionId),
          eq(outputDocuments.type, type)
        )
      );
    
    return document;
  }
  
  async updateOutputDocument(id: number, updates: Partial<OutputDocument>): Promise<OutputDocument | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const now = new Date();
    const [updatedDocument] = await db
      .update(outputDocuments)
      .set({
        ...updates,
        updated: now
      })
      .where(eq(outputDocuments.id, id))
      .returning();
    
    return updatedDocument;
  }
  
  async createOrUpdateOutput(document: InsertOutputDocument): Promise<OutputDocument> {
    if (!db) throw new Error("Database is not initialized");
    const existingDocument = await this.getOutputBySessionIdAndType(
      document.sessionId,
      document.type
    );
    
    if (existingDocument) {
      const updated = await this.updateOutputDocument(existingDocument.id, {
        content: document.content
      });
      return updated!;
    } else {
      return this.createOutputDocument(document);
    }
  }
  
  // AI Configuration methods
  async getAIConfiguration(id: number): Promise<AIConfig | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [config] = await db.select().from(aiConfigurations).where(eq(aiConfigurations.id, id));
    return config;
  }

  async getAllAIConfigurations(): Promise<AIConfig[]> {
    if (!db) throw new Error("Database is not initialized");
    return await db.select().from(aiConfigurations);
  }

  async getActiveAIConfiguration(): Promise<AIConfig | undefined> {
    if (!db) throw new Error("Database is not initialized");
    const [config] = await db.select().from(aiConfigurations).where(eq(aiConfigurations.isActive, true));
    return config;
  }

  async createAIConfiguration(config: InsertAIConfiguration): Promise<AIConfig> {
    if (!db) throw new Error("Database is not initialized");
    
    // If this config is set to active, deactivate all others first
    if (config.isActive) {
      await db.update(aiConfigurations).set({ isActive: false });
    }
    
    const [newConfig] = await db.insert(aiConfigurations).values(config).returning();
    return newConfig;
  }

  async updateAIConfiguration(id: number, updates: Partial<AIConfig>): Promise<AIConfig | undefined> {
    if (!db) throw new Error("Database is not initialized");
    
    // If setting this config to active, deactivate all others first
    if (updates.isActive) {
      await db.update(aiConfigurations).set({ isActive: false });
    }
    
    const now = new Date();
    const [updatedConfig] = await db
      .update(aiConfigurations)
      .set({
        ...updates,
        updatedAt: now
      })
      .where(eq(aiConfigurations.id, id))
      .returning();
    
    return updatedConfig;
  }

  async deleteAIConfiguration(id: number): Promise<boolean> {
    if (!db) throw new Error("Database is not initialized");
    const result = await db.delete(aiConfigurations).where(eq(aiConfigurations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async setActiveAIConfiguration(id: number): Promise<boolean> {
    if (!db) throw new Error("Database is not initialized");
    
    // First deactivate all configurations
    await db.update(aiConfigurations).set({ isActive: false });
    
    // Then activate the selected one
    const result = await db
      .update(aiConfigurations)
      .set({ isActive: true })
      .where(eq(aiConfigurations.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Decide which storage implementation to use based on whether db is initialized
export const storage = db ? new DatabaseStorage() : new MemStorage();