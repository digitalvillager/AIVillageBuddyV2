// Message Types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id?: number;
  sessionId: string;
  role: MessageRole;
  content: string;
  created?: Date;
}

// Session Types
export interface SessionState {
  id: string;
  industry: string;
  businessProblem: string;
  currentProcess: string;
  availableData: string;
  successMetrics: string;
  stakeholders: string;
  timeline: string;
  budget: string;
  isComplete: boolean;
  created?: Date;
}

// Output Types
export type OutputType = 'implementation' | 'cost' | 'design' | 'business' | 'ai';

export interface OutputDocument {
  id?: number;
  sessionId: string;
  type: OutputType;
  content: string;
  created?: Date;
  updated?: Date;
}

// Project Types
export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  created: Date;
  sessions?: string[]; // Array of session IDs
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  created: Date;
  profilePhoto: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// OpenAI Types
export interface OpenAIMessage {
  role: MessageRole;
  content: string;
}