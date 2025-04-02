import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
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
2. Ask one specific question at a time to gather information, and always follow up with a question
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

The first message will likely be one of two options:
1. "Automate business processes" - Ask follow-up questions about what specific processes they want to automate, what's inefficient about the current process, etc.
2. "Leverage my business data" - Ask follow-up questions about what kind of data they have, what insights they're hoping to gain, etc.

For each response, always acknowledge what the user has shared, then ask a follow-up question to go deeper. 
Remember: The goal is a back-and-forth conversation where you gradually build understanding.

After gathering sufficient information about all the key areas above, inform the user that you have enough information to generate comprehensive outputs.
Do not make up information or assume details that the user hasn't provided.`;

// Function to convert messages from database format to OpenAI format
function convertMessagesToOpenAIFormat(messages: Message[]): ChatCompletionMessageParam[] {
  const openAIMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  
  for (const message of messages) {
    if (message.role === 'user') {
      openAIMessages.push({
        role: "user",
        content: message.content,
      });
    } else if (message.role === 'assistant') {
      openAIMessages.push({
        role: "assistant",
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
  
  if (userMessages.length === 0) {
    return null; // No user messages to extract information from
  }
  
  // Combine all user messages into a single string for analysis
  const userText = userMessages.map(msg => msg.content).join("\n");
  
  // Initial request - could be one of our suggestions
  const initialRequest = userMessages[0].content;
  
  // Process automated or custom initial request
  let businessProblem = "";
  if (initialRequest === "Automate business processes" || initialRequest === "Leverage my business data") {
    // For predefined tags, use the tag itself as the initial business problem
    businessProblem = initialRequest;
    
    // If we have more messages, refine the business problem
    if (userMessages.length > 1) {
      const secondMessage = userMessages[1].content;
      if (secondMessage && secondMessage.trim().length > 10) { // If it's a substantial message
        businessProblem = secondMessage;
      }
    }
  } else {
    // For custom initial message, use it as the business problem
    businessProblem = initialRequest;
  }
  
  // Extract industry information
  let industry = "";
  if (userText.toLowerCase().includes("manufacturing")) industry = "Manufacturing";
  else if (userText.toLowerCase().includes("education")) industry = "Education";
  else if (userText.toLowerCase().includes("sustainability")) industry = "Sustainability";
  else if (userText.toLowerCase().includes("retail")) industry = "Retail";
  else if (userText.toLowerCase().includes("healthcare")) industry = "Healthcare";
  else if (userText.toLowerCase().includes("finance")) industry = "Finance";
  
  // Extract current process information
  let currentProcess = "";
  if (userText.toLowerCase().includes("current process") || userText.toLowerCase().includes("currently")) {
    const processLines = userText.split("\n").filter(line => 
      line.toLowerCase().includes("process") || 
      line.toLowerCase().includes("currently") || 
      line.toLowerCase().includes("manually") ||
      line.toLowerCase().includes("workflow"));
    
    if (processLines.length > 0) {
      currentProcess = processLines[0];
    }
  }
  
  // Extract data availability information
  let availableData = "";
  if (userText.toLowerCase().includes("data") || userText.toLowerCase().includes("collect")) {
    const dataLines = userText.split("\n").filter(line => 
      line.toLowerCase().includes("data") || 
      line.toLowerCase().includes("collect") || 
      line.toLowerCase().includes("information") ||
      line.toLowerCase().includes("database"));
    
    if (dataLines.length > 0) {
      availableData = dataLines[0];
    }
  }
  
  // Extract metrics information
  let successMetrics = "";
  if (userText.toLowerCase().includes("metrics") || userText.toLowerCase().includes("success") || userText.toLowerCase().includes("measure")) {
    const metricsLines = userText.split("\n").filter(line => 
      line.toLowerCase().includes("metrics") || 
      line.toLowerCase().includes("success") || 
      line.toLowerCase().includes("measure") ||
      line.toLowerCase().includes("kpi"));
    
    if (metricsLines.length > 0) {
      successMetrics = metricsLines[0];
    }
  }

  // Extract stakeholders information
  let stakeholders = "";
  if (userText.toLowerCase().includes("stakeholder") || userText.toLowerCase().includes("team") || userText.toLowerCase().includes("department")) {
    const stakeholderLines = userText.split("\n").filter(line => 
      line.toLowerCase().includes("stakeholder") || 
      line.toLowerCase().includes("team") || 
      line.toLowerCase().includes("department") ||
      line.toLowerCase().includes("management"));
    
    if (stakeholderLines.length > 0) {
      stakeholders = stakeholderLines[0];
    }
  }
  
  // Extract timeline information
  let timeline = "";
  if (userText.toLowerCase().includes("timeline") || userText.toLowerCase().includes("deadline") || userText.toLowerCase().includes("when")) {
    const timelineLines = userText.split("\n").filter(line => 
      line.toLowerCase().includes("timeline") || 
      line.toLowerCase().includes("deadline") || 
      line.toLowerCase().includes("months") ||
      line.toLowerCase().includes("weeks") ||
      line.toLowerCase().includes("years"));
    
    if (timelineLines.length > 0) {
      timeline = timelineLines[0];
    }
  }
  
  // Extract budget information
  let budget = "";
  if (userText.toLowerCase().includes("budget") || userText.toLowerCase().includes("cost") || userText.toLowerCase().includes("spend")) {
    const budgetLines = userText.split("\n").filter(line => 
      line.toLowerCase().includes("budget") || 
      line.toLowerCase().includes("cost") || 
      line.toLowerCase().includes("dollar") ||
      line.toLowerCase().includes("$") ||
      line.toLowerCase().includes("spend"));
    
    if (budgetLines.length > 0) {
      budget = budgetLines[0];
    }
  }
  
  // Return extracted information
  return {
    industry,
    businessProblem,
    currentProcess,
    availableData,
    successMetrics,
    stakeholders,
    timeline,
    budget
  };
}

// Determine if we have gathered enough information to generate outputs
function shouldGenerateOutputs(messages: Message[], session: Session) {
  // Count how many fields we have information for
  let fieldsWithInfo = 0;
  
  if (session.industry) fieldsWithInfo++;
  if (session.businessProblem) fieldsWithInfo++;
  if (session.currentProcess) fieldsWithInfo++;
  if (session.availableData) fieldsWithInfo++;
  if (session.successMetrics) fieldsWithInfo++;
  if (session.stakeholders) fieldsWithInfo++;
  if (session.timeline) fieldsWithInfo++;
  if (session.budget) fieldsWithInfo++;
  
  // We need at least business problem and one other field filled, 
  // with a minimum of 4 messages (2 exchanges) for basic information
  return session.businessProblem && fieldsWithInfo >= 2 && messages.length >= 4;
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
