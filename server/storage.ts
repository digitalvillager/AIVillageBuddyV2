import {
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Session,
  type InsertSession,
  type OutputDocument,
  type InsertOutputDocument,
  users,
  messages,
  sessions,
  outputDocuments
} from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (kept from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Output document methods
  createOutputDocument(document: InsertOutputDocument): Promise<OutputDocument>;
  getOutputDocument(id: number): Promise<OutputDocument | undefined>;
  getOutputsBySessionId(sessionId: string): Promise<OutputDocument[]>;
  getOutputBySessionIdAndType(sessionId: string, type: string): Promise<OutputDocument | undefined>;
  updateOutputDocument(id: number, updates: Partial<OutputDocument>): Promise<OutputDocument | undefined>;
  createOrUpdateOutput(document: InsertOutputDocument): Promise<OutputDocument>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private messages: Message[] = [];
  private sessions: Session[] = [];
  private outputDocuments: OutputDocument[] = [];
  private nextUserId = 1;
  private nextMessageId = 1;
  private nextOutputDocumentId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const user = {
      id: this.nextUserId++,
      ...insertUser,
      created: now,
      updated: now
    } as User;
    this.users.push(user);
    return user;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database is not initialized");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
}

// Decide which storage implementation to use based on whether db is initialized
export const storage = db ? new DatabaseStorage() : new MemStorage();