import { OpenAIMessage, Message, SessionState, OutputDocument } from "@/types";

/**
 * Get AI response from the server's chat endpoint
 * @param messages Array of OpenAI format messages
 * @returns The assistant's response message
 */
export async function getAIResponse(messages: OpenAIMessage[]) {
  try {
    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Send a user message and get the AI response
 * @param sessionId Current session ID
 * @param content User message content
 * @returns Object containing the AI response message, updated session, and any outputs
 */
export async function sendMessage(sessionId: string, content: string) {
  try {
    // First create the user message
    const messageResponse = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        role: 'user', 
        content
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json().catch(() => ({}));
      throw new Error(`Failed to create message: ${messageResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    // Then get the AI response
    const aiResponse = await fetch('/api/chat/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}));
      throw new Error(`Failed to get AI response: ${aiResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await aiResponse.json();
  } catch (error) {
    console.error('Failed to get AI response:', error);
    throw error;
  }
}

/**
 * Generate specific output type using session data
 * @param type Output type to generate
 * @param sessionState Current session state
 * @returns The generated output content
 */
export async function generateOutput(type: string, sessionState: SessionState) {
  try {
    const response = await fetch('/api/outputs/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        sessionId: sessionState.id,
        type 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to generate ${type} output: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const outputs = await response.json();
    // Find the right output by type
    const targetOutput = outputs.find((output: OutputDocument) => output.type === type);
    
    return targetOutput?.content || { error: `No ${type} output was generated` };
  } catch (error) {
    console.error(`Error generating ${type} output:`, error);
    throw error;
  }
}

/**
 * Generate all outputs at once
 * @param sessionId Current session ID
 * @returns Array of all generated outputs
 */
export async function generateAllOutputs(sessionId: string) {
  try {
    const response = await fetch('/api/outputs/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to generate outputs: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating all outputs:', error);
    throw error;
  }
}
