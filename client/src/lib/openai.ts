import { OpenAIMessage } from "@/types";

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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

export async function generateOutput(type: string, sessionState: any) {
  try {
    const response = await fetch(`/api/openai/generate/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionState }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error(`Error generating ${type} output:`, error);
    throw error;
  }
}
