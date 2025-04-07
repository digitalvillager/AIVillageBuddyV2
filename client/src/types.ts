import { OutputDocument as SchemaOutputDocument } from '@shared/schema';

// Output type used in the tabs
export type OutputType = 'implementation' | 'cost' | 'design' | 'business' | 'ai';

// Session state for tracking information gathered from conversations
export interface SessionState {
  id?: string;
  isComplete?: boolean;
  industry?: string;
  businessProblem?: string;
  currentProcess?: string;
  availableData?: string;
  successMetrics?: string;
  stakeholders?: string;
  timeline?: string;
  budget?: string;
}

// Message types for chat
export interface Message {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created: Date;
}

// Extended Output Document with properly typed content
export interface OutputDocument extends SchemaOutputDocument {
  content: any; // This could be a structured JSON object or string
}

// OpenAI message format
export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}