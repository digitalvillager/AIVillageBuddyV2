import { UserPreferences } from "@shared/schema";
import { transformPreferenceContext } from "./preference-context-transformer";

interface PromptContext {
  query: string;
  preferences: UserPreferences | null;
  additionalContext?: Record<string, any>;
}

export function constructPreferenceAwarePrompt({
  query,
  preferences,
  additionalContext = {},
}: PromptContext): string {
  if (!preferences) {
    return `You are an AI assistant. The user has not set their preferences yet. 
Please provide a general response to their query, and suggest they set up their preferences for more personalized assistance.

User Query: ${query}`;
  }

  const context = transformPreferenceContext(preferences, query);
  const budgetRange = preferences.aiReadiness.businessImpact.budgetRange;

  const systemPrompt = [
    "You are an AI assistant with access to the user's preferences and context. Use this information to provide personalized, relevant responses.",
    "",
    budgetRange && [
      "IMPORTANT BUDGET CONSTRAINT:",
      `The user has a strict budget of ${budgetRange}.`,
      "All solutions MUST be within this budget range.",
      "Prioritize cost-effective approaches and solutions.",
      "Consider open-source or low-cost alternatives where possible.",
      "Break down costs for any recommended solutions.",
      "",
    ].join("\n"),
    "",
    "Technical Context:",
    `Capabilities:`,
    ...context.technical.capabilities.map(cap => `- ${cap}`),
    "",
    `Limitations:`,
    ...context.technical.limitations.map(lim => `- ${lim}`),
    "",
    `Integration Points:`,
    ...context.technical.integrationPoints.map(point => `- ${point}`),
    "",
    `Recommended Approaches:`,
    ...context.technical.recommendedApproaches.map(approach => `- ${approach}`),
    "",
    "Business Context:",
    `Priorities:`,
    ...context.business.priorities.map(priority => `- ${priority}`),
    "",
    `Constraints:`,
    ...context.business.constraints.map(constraint => `- ${constraint}`),
    "",
    `Risk Factors:`,
    ...context.business.riskFactors.map(risk => `- ${risk}`),
    "",
    `Success Metrics:`,
    ...context.business.successMetrics.map(metric => `- ${metric}`),
    "",
    "Implementation Context:",
    `Feasibility Score: ${context.implementation.feasibility}/10`,
    `Complexity Level: ${context.implementation.complexity}/10`,
    `Estimated Timeline: ${context.implementation.timeline}`,
    "",
    `Resource Requirements:`,
    ...context.implementation.resourceRequirements.map(req => `- ${req}`),
    "",
    "Additional Context:",
    Object.entries(additionalContext)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n"),
    "",
    "Response Guidelines:",
    context.promptingStrategy.explanationDepth,
    context.promptingStrategy.questionStyle,
    "",
    "Budget-Aware Solution Requirements:",
    "1. Always consider the budget constraint first",
    "2. Provide cost breakdowns for any recommended solutions",
    "3. Suggest phased implementations if needed to stay within budget",
    "4. Include cost-effective alternatives and trade-offs",
    "5. Highlight any potential cost savings or ROI",
    "",
    "Relevant Examples:",
    ...context.promptingStrategy.examples.map(example => `- ${example}`),
    "",
    "User Query:",
    query,
  ].join("\n");

  return systemPrompt;
} 