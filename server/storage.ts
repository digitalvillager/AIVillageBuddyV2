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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp);
  }
  
  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values({
      ...insertSession,
      isComplete: insertSession.isComplete || false
    }).returning();
    return session;
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }
  
  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const now = new Date();
    const [updatedSession] = await db
      .update(sessions)
      .set({
        ...updates,
        updated: now.toISOString()
      })
      .where(eq(sessions.id, id))
      .returning();
    
    return updatedSession;
  }
  
  // Output document methods
  async createOutputDocument(insertDocument: InsertOutputDocument): Promise<OutputDocument> {
    const [document] = await db.insert(outputDocuments).values(insertDocument).returning();
    return document;
  }
  
  async getOutputDocument(id: number): Promise<OutputDocument | undefined> {
    const [document] = await db.select().from(outputDocuments).where(eq(outputDocuments.id, id));
    return document;
  }
  
  async getOutputsBySessionId(sessionId: string): Promise<OutputDocument[]> {
    return await db
      .select()
      .from(outputDocuments)
      .where(eq(outputDocuments.sessionId, sessionId));
  }
  
  async getOutputBySessionIdAndType(sessionId: string, type: string): Promise<OutputDocument | undefined> {
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
    const now = new Date();
    const [updatedDocument] = await db
      .update(outputDocuments)
      .set({
        ...updates,
        updated: now.toISOString()
      })
      .where(eq(outputDocuments.id, id))
      .returning();
    
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

export const storage = new DatabaseStorage();
