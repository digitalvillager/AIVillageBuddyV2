// Message type for chat messages
export interface Message {
  id: number;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// Output document type
export interface OutputDocument {
  id: number;
  sessionId: string;
  type: OutputType;
  content: any; // JSON content
}

// Output types
export type OutputType = 'implementation' | 'cost' | 'design' | 'business-case' | 'ai-considerations';

// Session state
export interface SessionState {
  id: string;
  industry?: string;
  businessProblem?: string;
  currentProcess?: string;
  availableData?: string;
  successMetrics?: string;
  stakeholders?: string;
  timeline?: string;
  budget?: string;
  isComplete: boolean;
}

// OpenAI Chat Message type
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
