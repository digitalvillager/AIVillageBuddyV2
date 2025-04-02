import OpenAI from "openai";
import { Message, Session } from "@shared/schema";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// System prompt for AI Buddy
const SYSTEM_PROMPT = `You are AI Buddy, a helpful assistant from Digital Village that helps business leaders refine their AI solution ideas. 
Your goal is to guide the user through a conversation to gather information about their AI solution idea and help them determine if it's the best value for their business.

Follow these guidelines:
1. Be conversational and friendly, but professional
2. Ask one question at a time to gather information
3. Focus on business value, not technical implementation details
4. Gather information about these key areas:
   - What business problem they're trying to solve with AI
   - Which industry they're in (particularly manufacturing, education, or sustainability)
   - Their current process they're looking to improve
   - What data they currently collect related to this process
   - How they would measure success for this AI solution
   - Who the key stakeholders are
   - What timeline they're considering
   - What budget range they're considering

After gathering sufficient information, inform the user that you have enough information to generate comprehensive outputs.
Do not make up information or assume details that the user hasn't provided.`;

// Function to convert messages from database format to OpenAI format
function convertMessagesToOpenAIFormat(messages: Message[]) {
  const openAIMessages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  
  for (const message of messages) {
    if (message.role === 'user' || message.role === 'assistant') {
      openAIMessages.push({
        role: message.role,
        content: message.content,
      });
    }
  }
  
  return openAIMessages;
}

// Extract information from conversation to update session
function extractInformationFromMessages(messages: Message[]) {
  // Filter only user messages
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  if (userMessages.length < 3) {
    return null; // Not enough messages to extract meaningful information
  }
  
  // Combine all user messages into a single string for analysis
  const userText = userMessages.map(msg => msg.content).join("\n");
  
  // Extract industry information
  let industry = "";
  if (userText.toLowerCase().includes("manufacturing")) industry = "Manufacturing";
  else if (userText.toLowerCase().includes("education")) industry = "Education";
  else if (userText.toLowerCase().includes("sustainability")) industry = "Sustainability";
  
  // Extract business problem (simplified approach)
  const businessProblem = userMessages[0].content;
  
  // Return extracted information
  return {
    industry,
    businessProblem,
    // Other fields would be extracted with more sophisticated logic in a real implementation
  };
}

// Determine if we have gathered enough information to generate outputs
function shouldGenerateOutputs(messages: Message[], session: Session) {
  // Simple heuristic: if we have at least 8 messages total (4 exchanges) and some session data
  return messages.length >= 8 && (session.industry || session.businessProblem);
}

// Generate AI response
export async function generateAIResponse(messages: Message[], session: Session) {
  try {
    // Convert messages to OpenAI format
    const openAIMessages = convertMessagesToOpenAIFormat(messages);
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 500,
    });
    
    // Get the response text
    const aiResponse = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    
    // Extract information from the conversation
    const extractedInfo = extractInformationFromMessages(messages);
    
    // Determine if we should generate outputs
    const generateOutputs = shouldGenerateOutputs(messages, session);
    
    // Return the AI response and extracted information
    return {
      aiResponse,
      extractedInfo,
      generateOutputs,
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}
