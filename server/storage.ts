import {
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Session,
  type InsertSession,
  type OutputDocument,
  type InsertOutputDocument
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private sessions: Map<string, Session>;
  private outputDocuments: Map<number, OutputDocument>;
  
  private userIdCounter: number;
  private messageIdCounter: number;
  private outputDocumentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.sessions = new Map();
    this.outputDocuments = new Map();
    
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
    this.outputDocumentIdCounter = 1;
  }

  // User methods (kept from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: now.toISOString() 
    };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const now = new Date();
    const session: Session = { 
      ...insertSession, 
      created: now.toISOString(),
      updated: now.toISOString(),
      isComplete: insertSession.isComplete || false
    };
    this.sessions.set(session.id, session);
    return session;
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    
    if (!session) {
      return undefined;
    }
    
    const now = new Date();
    const updatedSession: Session = { 
      ...session, 
      ...updates,
      updated: now.toISOString() 
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Output document methods
  async createOutputDocument(insertDocument: InsertOutputDocument): Promise<OutputDocument> {
    const id = this.outputDocumentIdCounter++;
    const now = new Date();
    const document: OutputDocument = { 
      ...insertDocument, 
      id,
      created: now.toISOString(),
      updated: now.toISOString() 
    };
    this.outputDocuments.set(id, document);
    return document;
  }
  
  async getOutputDocument(id: number): Promise<OutputDocument | undefined> {
    return this.outputDocuments.get(id);
  }
  
  async getOutputsBySessionId(sessionId: string): Promise<OutputDocument[]> {
    return Array.from(this.outputDocuments.values())
      .filter(doc => doc.sessionId === sessionId);
  }
  
  async getOutputBySessionIdAndType(sessionId: string, type: string): Promise<OutputDocument | undefined> {
    return Array.from(this.outputDocuments.values())
      .find(doc => doc.sessionId === sessionId && doc.type === type);
  }
  
  async updateOutputDocument(id: number, updates: Partial<OutputDocument>): Promise<OutputDocument | undefined> {
    const document = this.outputDocuments.get(id);
    
    if (!document) {
      return undefined;
    }
    
    const now = new Date();
    const updatedDocument: OutputDocument = { 
      ...document, 
      ...updates,
      updated: now.toISOString() 
    };
    
    this.outputDocuments.set(id, updatedDocument);
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

export const storage = new MemStorage();
