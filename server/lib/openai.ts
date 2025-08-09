import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Message, Session } from "@shared/schema";
import { config } from "../config";

// Initialize OpenAI with API key from config
console.log(`openai.ts - OPENAI API KEY: ${config.OPENAI_API_KEY}`);
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

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
function convertMessagesToOpenAIFormat(
  messages: Message[],
  project?: any,
  userPreferences?: any,
): ChatCompletionMessageParam[] {
  const openAIMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // Add project context if available
  if (project) {
    openAIMessages.push({
      role: "system",
      content: `Project Context:
- Name: ${project.name}
- Timeline: ${project.timeline || "Not specified"}
- Budget Range: ${project.budget || "Not specified"}
- Primary Goal: ${project.primaryGoal || "Not specified"}
- Technical Complexity: ${project.technicalComplexity || "Not specified"}
- Project Confidence: ${project.projectConfidence ? "High" : "Low"}
- Additional Context: ${project.additionalContext || "None provided"}`,
    });
  }

  // Add user preferences context if available
  if (userPreferences) {
    openAIMessages.push({
      role: "system",
      content: `User Context:
- Business Systems: ${JSON.stringify(userPreferences.businessSystems)}
- Business Context: ${JSON.stringify(userPreferences.businessContext)}
- AI Readiness: ${JSON.stringify(userPreferences.aiReadiness)}
- AI Training Enabled: ${userPreferences.aiTraining}
- Performance Metrics Enabled: ${userPreferences.performanceMetrics}
- Impact Analysis Enabled: ${userPreferences.impactAnalysis}`,
    });
  }

  for (const message of messages) {
    if (message.role === "user") {
      openAIMessages.push({
        role: "user",
        content: message.content,
      });
    } else if (message.role === "assistant") {
      openAIMessages.push({
        role: "assistant",
        content: message.content,
      });
    }
  }

  return openAIMessages;
}

// Extract information from conversation to update session
async function extractInformationFromMessages(messages: Message[]) {
  // Filter only user messages
  const userMessages = messages.filter((msg) => msg.role === "user");

  if (userMessages.length === 0) {
    return null; // No user messages to extract information from
  }

  // Combine all user messages into a single string for analysis
  const userText = userMessages.map((msg) => msg.content).join("\n");

  // Initial request - could be one of our suggestions
  const initialRequest = userMessages[0].content;

  // Process automated or custom initial request
  let businessProblem = "";
  if (
    initialRequest === "Automate business processes" ||
    initialRequest === "Leverage my business data"
  ) {
    // For predefined tags, use the tag itself as the initial business problem
    businessProblem = initialRequest;

    // If we have more messages, refine the business problem
    if (userMessages.length > 1) {
      const secondMessage = userMessages[1].content;
      if (secondMessage && secondMessage.trim().length > 10) {
        // If it's a substantial message
        businessProblem = secondMessage;
      }
    }
  } else {
    // For custom initial message, use it as the business problem
    businessProblem = initialRequest;
  }

  // Use AI to extract structured information from the conversation
  try {
    const extractionPrompt = `
      You are an expert at extracting structured information from business conversations.
      Analyze the following conversation and extract the requested information.

      If information is not explicitly mentioned, return "Not specified" for that field.
      For timeline and budget, extract specific values when mentioned (e.g., "2 months", "$25,000").

      Conversation:
      ${userText}

      Please provide a JSON response with the following structure:
      {
        "industry": "Specific industry mentioned or closest match",
        "currentProcess": "Description of current business process",
        "availableData": "Information about available data sources",
        "successMetrics": "Success metrics or KPIs mentioned",
        "stakeholders": "Stakeholders, teams, or departments mentioned",
        "timeline": "Specific timeline mentioned (e.g., '2 months', '6 weeks', '1 year')",
        "budget": "Specific budget mentioned (e.g., '$25,000', '$100K', 'under $50,000')"
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: extractionPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent extraction
      max_tokens: 800,
    });

    const extractedInfo = JSON.parse(
      response.choices[0].message.content || "{}",
    );

    // Return extracted information with businessProblem from our logic
    return {
      industry: extractedInfo.industry || "",
      businessProblem,
      currentProcess: extractedInfo.currentProcess || "",
      availableData: extractedInfo.availableData || "",
      successMetrics: extractedInfo.successMetrics || "",
      stakeholders: extractedInfo.stakeholders || "",
      timeline: extractedInfo.timeline || "",
      budget: extractedInfo.budget || "",
    };
  } catch (error) {
    console.error("Error extracting information with AI:", error);

    // Fallback to basic extraction
    return {
      industry: extractIndustryBasic(userText),
      businessProblem,
      currentProcess: extractBasicInfo(userText, [
        "process",
        "currently",
        "manually",
        "workflow",
      ]),
      availableData: extractBasicInfo(userText, [
        "data",
        "collect",
        "information",
        "database",
      ]),
      successMetrics: extractBasicInfo(userText, [
        "metrics",
        "success",
        "measure",
        "kpi",
      ]),
      stakeholders: extractBasicInfo(userText, [
        "stakeholder",
        "team",
        "department",
        "management",
      ]),
      timeline: extractBasicInfo(userText, [
        "timeline",
        "deadline",
        "months",
        "weeks",
        "years",
      ]),
      budget: extractBasicInfo(userText, [
        "budget",
        "cost",
        "dollar",
        "$",
        "spend",
      ]),
    };
  }
}

// Helper function for basic industry extraction
function extractIndustryBasic(userText: string): string {
  const text = userText.toLowerCase();
  if (text.includes("manufacturing")) return "Manufacturing";
  if (text.includes("education")) return "Education";
  if (text.includes("sustainability")) return "Sustainability";
  if (text.includes("retail")) return "Retail";
  if (text.includes("healthcare")) return "Healthcare";
  if (text.includes("finance")) return "Finance";
  return "";
}

// Helper function for basic information extraction
function extractBasicInfo(userText: string, keywords: string[]): string {
  const lines = userText
    .split("\n")
    .filter((line) =>
      keywords.some((keyword) => line.toLowerCase().includes(keyword)),
    );
  return lines.length > 0 ? lines[0] : "";
}

// Determine if we have gathered enough information to generate outputs
function shouldGenerateOutputs(messages: Message[], session: Session) {
  // Both timeline and budget are required for output generation
  const hasValidTimeline =
    session.timeline && session.timeline !== "Not specified";
  const hasValidBudget = session.budget && session.budget !== "Not specified";

  // Count how many other fields we have information for
  let fieldsWithInfo = 0;

  if (session.industry) fieldsWithInfo++;
  if (session.businessProblem) fieldsWithInfo++;
  if (session.currentProcess) fieldsWithInfo++;
  if (session.availableData) fieldsWithInfo++;
  if (session.successMetrics) fieldsWithInfo++;
  if (session.stakeholders) fieldsWithInfo++;

  // We need business problem, timeline, budget, and at least one other field filled,
  // with a minimum of 4 messages (2 exchanges) for basic information
  return (
    session.businessProblem &&
    hasValidTimeline &&
    hasValidBudget &&
    fieldsWithInfo >= 1 &&
    messages.length >= 4
  );
}

// Generate summary of information collected
function generateSummary(session: Session): string {
  const summary = [];

  if (session.businessProblem) {
    summary.push(`- **Business Problem**: ${session.businessProblem}`);
  }
  if (session.industry) {
    summary.push(`- **Industry**: ${session.industry}`);
  }
  if (session.timeline) {
    summary.push(`- **Timeline**: ${session.timeline}`);
  }
  if (session.budget) {
    summary.push(`- **Budget**: ${session.budget}`);
  }
  if (session.currentProcess) {
    summary.push(`- **Current Process**: ${session.currentProcess}`);
  }
  if (session.availableData) {
    summary.push(`- **Available Data**: ${session.availableData}`);
  }
  if (session.successMetrics) {
    summary.push(`- **Success Metrics**: ${session.successMetrics}`);
  }
  if (session.stakeholders) {
    summary.push(`- **Stakeholders**: ${session.stakeholders}`);
  }

  return summary.join("\n");
}

// Generate AI response
export async function generateAIResponse(
  messages: Message[],
  session: Session,
  project?: any,
  userPreferences?: any,
) {
  try {
    // Extract information from the conversation first
    const extractedInfo = await extractInformationFromMessages(messages);

    // Update session with extracted info for summary generation
    const updatedSession = { ...session, ...extractedInfo };

    // Determine if we should generate outputs
    const generateOutputs = shouldGenerateOutputs(messages, updatedSession);

    let aiResponse: string;

    if (generateOutputs) {
      // Generate summary and action prompt
      const summary = generateSummary(updatedSession);
      aiResponse = `Great! I have gathered enough information about your AI solution. Here's a summary of what you've shared:

${summary}

Would you like to have any additional discussion or ask more questions before we proceed?

When you're ready, you can choose from the following options to get detailed insights:

**SHOW_BUTTONS:Resources,Detailed Plan,Business Case**`;
    } else {
      // Convert messages to OpenAI format with project and user context
      const openAIMessages = convertMessagesToOpenAIFormat(
        messages,
        project,
        userPreferences,
      );

      // Call OpenAI API for regular conversation
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      // Get the response text
      aiResponse =
        response.choices[0].message.content ||
        "I'm sorry, I couldn't generate a response.";
    }

    // Return the AI response and extracted information
    return {
      aiResponse,
      extractedInfo,
      generateOutputs,
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}
