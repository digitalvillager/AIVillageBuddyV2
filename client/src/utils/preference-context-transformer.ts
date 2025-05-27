import { UserPreferences } from "@shared/schema";

interface TechnicalContext {
  capabilities: string[];
  limitations: string[];
  integrationPoints: string[];
  recommendedApproaches: string[];
}

interface BusinessContext {
  priorities: string[];
  constraints: string[];
  riskFactors: string[];
  successMetrics: string[];
}

interface ImplementationContext {
  feasibility: number;
  complexity: number;
  timeline: string;
  resourceRequirements: string[];
}

interface TransformedContext {
  technical: TechnicalContext;
  business: BusinessContext;
  implementation: ImplementationContext;
  promptingStrategy: {
    temperature: number;
    examples: string[];
    questionStyle: string;
    explanationDepth: string;
  };
}

// Industry-specific examples and considerations
const INDUSTRY_EXAMPLES: Record<string, string[]> = {
  "technology": [
    "Implementing AI in a cloud-native environment",
    "Scaling machine learning models in production",
    "Integrating with microservices architecture",
  ],
  "finance": [
    "Fraud detection with machine learning",
    "Risk assessment automation",
    "Compliance monitoring with AI",
  ],
  "healthcare": [
    "Patient data analysis with privacy preservation",
    "Medical image processing",
    "Clinical decision support systems",
  ],
  "retail": [
    "Customer behavior prediction",
    "Inventory optimization",
    "Personalized recommendations",
  ],
};

function extractTechnicalContext(
  preferences: UserPreferences,
  query: string
): TechnicalContext {
  const { businessSystems } = preferences;
  const queryLower = query.toLowerCase();
  
  // Determine relevant capabilities based on tech stack
  const capabilities = businessSystems.technologyStack.map(tech => {
    switch (tech) {
      case "crm":
        return "Customer data integration and analysis";
      case "erp":
        return "Business process automation and optimization";
      case "bi":
        return "Advanced analytics and reporting";
      case "cms":
        return "Content management and personalization";
      case "hrms":
        return "HR process automation and analytics";
      case "scm":
        return "Supply chain optimization and forecasting";
      default:
        return `${tech} integration capabilities`;
    }
  });

  // Identify potential limitations
  const limitations = [];
  if (businessSystems.primaryDataType === "unstructured") {
    limitations.push("Complex data processing requirements");
  }
  if (businessSystems.implementationApproach === "on-premise") {
    limitations.push("Limited cloud scalability");
  }

  // Determine integration points
  const integrationPoints = businessSystems.technologyStack.map(tech => 
    `Integration with ${tech.toUpperCase()} system`
  );

  // Recommend approaches based on tech stack and data type
  const recommendedApproaches = [];
  if (businessSystems.dataStorageFormats.includes("data-lake")) {
    recommendedApproaches.push("Big data processing pipeline");
  }
  if (businessSystems.technologyStack.includes("bi")) {
    recommendedApproaches.push("Analytics-driven implementation");
  }

  return {
    capabilities,
    limitations,
    integrationPoints,
    recommendedApproaches,
  };
}

function extractBusinessContext(
  preferences: UserPreferences,
  query: string
): BusinessContext {
  const { businessContext, aiReadiness } = preferences;
  const queryLower = query.toLowerCase();

  // Determine business priorities with budget awareness
  const priorities = [
    ...aiReadiness.businessImpact.priorityAreas,
    ...businessContext.businessOperations.businessChallenges,
  ].map(priority => {
    switch (priority) {
      case "cost-reduction":
        return "Operational efficiency and cost optimization";
      case "revenue-growth":
        return "Revenue generation and market expansion";
      case "customer-experience":
        return "Customer satisfaction and engagement";
      default:
        return priority;
    }
  });

  // Extract and emphasize budget constraints
  const budgetRange = aiReadiness.businessImpact.budgetRange;
  const constraints = [
    budgetRange && `STRICT BUDGET CONSTRAINT: ${budgetRange} - Solutions must be within this budget range`,
    aiReadiness.businessImpact.roiTimeframe && `ROI timeframe: ${aiReadiness.businessImpact.roiTimeframe}`,
    businessContext.organizationProfile.growthStage && `Growth stage: ${businessContext.organizationProfile.growthStage}`,
  ].filter(Boolean) as string[];

  // Add budget-specific risk factors
  const riskFactors = [];
  if (budgetRange) {
    const budgetValue = parseInt(budgetRange.split('-')[0].replace(/[^0-9]/g, ''));
    if (budgetValue < 100) {
      riskFactors.push("Limited budget requires cost-effective solutions");
      riskFactors.push("Need to prioritize essential features over nice-to-haves");
    }
  }
  if (aiReadiness.readinessAssessment.teamAiLiteracy < 5) {
    riskFactors.push("Limited AI expertise in team");
  }
  if (aiReadiness.readinessAssessment.dataGovernanceMaturity < 5) {
    riskFactors.push("Data governance challenges");
  }

  // Define success metrics with budget awareness
  const successMetrics = [
    ...businessContext.businessOperations.kpis.map(kpi => {
      switch (kpi) {
        case "revenue":
          return "Revenue growth rate";
        case "profit":
          return "Profit margin improvement";
        case "customer":
          return "Customer acquisition cost reduction";
        case "retention":
          return "Customer retention rate increase";
        default:
          return kpi;
      }
    }),
    budgetRange && "Cost-effectiveness within budget constraints",
    "ROI alignment with expected timeframe",
  ].filter(Boolean) as string[];

  return {
    priorities,
    constraints,
    riskFactors,
    successMetrics,
  };
}

function assessImplementationFeasibility(
  preferences: UserPreferences
): ImplementationContext {
  const { aiReadiness, businessContext } = preferences;

  // Calculate feasibility score (0-10)
  const feasibility = Math.round(
    (aiReadiness.readinessAssessment.teamAiLiteracy +
      aiReadiness.readinessAssessment.dataGovernanceMaturity +
      aiReadiness.readinessAssessment.changeManagementCapability) / 3
  );

  // Determine complexity based on business context
  const complexity = businessContext.businessOperations.decisionComplexity;

  // Estimate timeline based on readiness and complexity
  const timeline = complexity > 7
    ? "6-12 months"
    : complexity > 4
    ? "3-6 months"
    : "1-3 months";

  // Identify resource requirements
  const resourceRequirements = [];
  if (aiReadiness.readinessAssessment.teamAiLiteracy < 5) {
    resourceRequirements.push("AI training and upskilling");
  }
  if (aiReadiness.readinessAssessment.dataGovernanceMaturity < 5) {
    resourceRequirements.push("Data governance implementation");
  }
  if (aiReadiness.readinessAssessment.changeManagementCapability < 5) {
    resourceRequirements.push("Change management support");
  }

  return {
    feasibility,
    complexity,
    timeline,
    resourceRequirements,
  };
}

function determinePromptingStrategy(
  preferences: UserPreferences,
  query: string
): TransformedContext["promptingStrategy"] {
  const { aiReadiness } = preferences;
  const aiLiteracy = aiReadiness.readinessAssessment.teamAiLiteracy;
  const previousExperience = aiReadiness.readinessAssessment.previousAiExperience;
  const budgetRange = aiReadiness.businessImpact.budgetRange;

  // Adjust temperature based on risk tolerance, experience, and budget
  let temperature = previousExperience === "extensive" ? 0.7 : 0.5;
  if (budgetRange && budgetRange.includes("<")) {
    temperature = 0.3; // More conservative for tight budgets
  }

  // Select relevant examples based on industry, experience, and budget
  let examples = INDUSTRY_EXAMPLES[preferences.businessContext.organizationProfile.growthStage] || [];
  
  // Add budget-specific examples
  if (budgetRange) {
    examples = examples.map(example => 
      `${example} (budget-aware implementation)`
    );
  }

  // Determine question style based on AI literacy and budget
  const questionStyle = aiLiteracy <= 3
    ? "Use simple, direct questions with clear options, emphasizing cost-effective solutions"
    : aiLiteracy <= 7
    ? "Use technical questions with explanations, considering budget constraints"
    : "Use advanced technical questions with industry context and budget optimization";

  // Set explanation depth with budget awareness
  const explanationDepth = aiLiteracy <= 3
    ? "Provide step-by-step explanations with basic terminology, focusing on cost-effective approaches"
    : aiLiteracy <= 7
    ? "Use technical terminology with moderate detail, considering budget implications"
    : "Use advanced concepts with industry-specific context and budget optimization strategies";

  return {
    temperature,
    examples,
    questionStyle,
    explanationDepth,
  };
}

export function transformPreferenceContext(
  preferences: UserPreferences,
  query: string
): TransformedContext {
  return {
    technical: extractTechnicalContext(preferences, query),
    business: extractBusinessContext(preferences, query),
    implementation: assessImplementationFeasibility(preferences),
    promptingStrategy: determinePromptingStrategy(preferences, query),
  };
} 