import OpenAI from "openai";
import { Session } from "@shared/schema";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

/**
 * Generate an implementation plan based on session data
 * @param session The session containing user inputs about their AI solution
 */
export async function generateImplementationPlan(session: Session): Promise<any> {
  const prompt = `
    You are an AI implementation specialist. Based on the following information about an AI solution, 
    create a detailed implementation plan in JSON format.
    
    Industry: ${session.industry || "Not specified"}
    Business Problem: ${session.businessProblem || "Not specified"}
    Current Process: ${session.currentProcess || "Not specified"}
    Available Data: ${session.availableData || "Not specified"}
    Success Metrics: ${session.successMetrics || "Not specified"}
    Stakeholders: ${session.stakeholders || "Not specified"}
    Timeline: ${session.timeline || "Not specified"}
    Budget: ${session.budget || "Not specified"}
    
    Generate a comprehensive implementation plan with the following structure:
    {
      "title": "AI Solution Implementation Plan for [appropriate title based on business problem]",
      "overview": "A brief description of the implementation plan",
      "timeline": {
        "overall": "Overall duration estimation",
        "phases": [
          {
            "name": "Phase name (e.g., Discovery Phase (2-3 weeks))",
            "percentage": percentage of total time,
            "description": "Brief description of this phase"
          }
        ]
      },
      "roles": [
        {
          "title": "Role title",
          "description": "Description of responsibilities"
        }
      ],
      "deliverables": [
        {
          "title": "Deliverable name",
          "description": "Description of the deliverable"
        }
      ],
      "dependencies": [
        {
          "title": "Dependency name",
          "description": "Description of the dependency"
        }
      ]
    }
    
    Make the implementation plan realistic, practical, and tailored to the specific industry and business problem.
    The plan should include at least 5 phases, 5 roles, 6 deliverables, and 3 dependencies.
    Be specific in timelines, roles, and deliverables based on the information provided.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating implementation plan:", error);
    return {
      title: "AI Solution Implementation Plan",
      overview: "Could not generate a detailed implementation plan. Please try again later.",
      timeline: {
        overall: "Error generating timeline",
        phases: []
      },
      roles: [],
      deliverables: [],
      dependencies: []
    };
  }
}

/**
 * Generate a cost estimate based on session data
 * @param session The session containing user inputs about their AI solution
 */
export async function generateCostEstimate(session: Session): Promise<any> {
  const prompt = `
    You are an AI solution cost estimation specialist. Based on the following information about an AI solution, 
    create a detailed cost estimate in JSON format.
    
    Industry: ${session.industry || "Not specified"}
    Business Problem: ${session.businessProblem || "Not specified"}
    Current Process: ${session.currentProcess || "Not specified"}
    Available Data: ${session.availableData || "Not specified"}
    Success Metrics: ${session.successMetrics || "Not specified"}
    Stakeholders: ${session.stakeholders || "Not specified"}
    Timeline: ${session.timeline || "Not specified"}
    Budget: ${session.budget || "Not specified"}
    
    Generate a comprehensive cost estimate with the following structure:
    {
      "title": "AI Solution Cost Estimate for [appropriate title based on business problem]",
      "overview": "A brief description of the cost estimate",
      "personnel": [
        {
          "role": "Role title",
          "hours": estimated hours,
          "rate": hourly rate in USD,
          "total": calculated total cost
        }
      ],
      "hardware": [
        {
          "name": "Hardware/software item name",
          "quantity": quantity needed,
          "unitCost": unit cost in USD,
          "total": calculated total cost
        }
      ],
      "maintenance": [
        {
          "name": "Maintenance item name",
          "cost": annual cost in USD
        }
      ],
      "subtotals": {
        "personnel": total personnel cost,
        "hardware": total hardware/software cost,
        "maintenance": total annual maintenance cost
      },
      "contingencyPercentage": percentage for contingency (typically 15-20%),
      "contingency": calculated contingency amount,
      "totalImplementation": total implementation cost including contingency,
      "considerations": [
        "Cost consideration 1",
        "Cost consideration 2",
        "Cost consideration 3",
        "Cost consideration 4"
      ]
    }
    
    Make the cost estimate realistic and tailored to the specific industry and business problem.
    Use realistic market rates for personnel and hardware/software.
    The estimate should include at least 5 personnel roles, 5 hardware/software items, and 4 maintenance items.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating cost estimate:", error);
    return {
      title: "AI Solution Cost Estimate",
      overview: "Could not generate a detailed cost estimate. Please try again later.",
      personnel: [],
      hardware: [],
      maintenance: [],
      subtotals: {
        personnel: 0,
        hardware: 0,
        maintenance: 0
      },
      contingencyPercentage: 15,
      contingency: 0,
      totalImplementation: 0,
      considerations: []
    };
  }
}

/**
 * Generate a design concept based on session data
 * @param session The session containing user inputs about their AI solution
 */
export async function generateDesignConcept(session: Session): Promise<any> {
  const prompt = `
    You are an AI solution design specialist. Based on the following information about an AI solution, 
    create a detailed design concept in JSON format that includes visual mockups, interactive examples, and low-fidelity prototypes.
    
    Industry: ${session.industry || "Not specified"}
    Business Problem: ${session.businessProblem || "Not specified"}
    Current Process: ${session.currentProcess || "Not specified"}
    Available Data: ${session.availableData || "Not specified"}
    Success Metrics: ${session.successMetrics || "Not specified"}
    Stakeholders: ${session.stakeholders || "Not specified"}
    Timeline: ${session.timeline || "Not specified"}
    Budget: ${session.budget || "Not specified"}
    
    Generate a comprehensive design concept with the following structure:
    {
      "title": "AI Solution Design Concept for [appropriate title based on business problem]",
      "overview": "A brief description of the design concept",
      "interfaceComponents": [
        {
          "name": "Component name",
          "description": "Description of the component",
          "features": ["Feature 1", "Feature 2", "Feature 3"],
          "mockupDescription": "Detailed description of how this component would look in practice"
        }
      ],
      "userFlows": [
        {
          "name": "User flow name",
          "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
          "diagramDescription": "Description of a flowchart that shows this user process"
        }
      ],
      "architecture": {
        "description": "Description of the technical architecture",
        "components": ["Component 1", "Component 2", "Component 3", "Component 4", "Component 5"],
        "diagramElements": {
          "nodes": ["Node 1", "Node 2", "Node 3"],
          "connections": [
            { "from": "Node 1", "to": "Node 2", "label": "Connection description" },
            { "from": "Node 2", "to": "Node 3", "label": "Connection description" }
          ]
        }
      },
      "integrations": [
        {
          "system": "System name",
          "description": "Description of integration",
          "dataFlow": "Description of how data flows between systems"
        }
      ],
      "personas": [
        {
          "name": "Persona name",
          "role": "Persona role",
          "description": "Description of persona",
          "interactions": ["Interaction 1", "Interaction 2", "Interaction 3"]
        }
      ],
      "mockups": [
        {
          "name": "Mockup name (e.g., Dashboard Overview)",
          "description": "Detailed description of the mockup, including layout, key features, and interaction points",
          "type": "dashboard|form|report|visualization|mobile|integration"
        }
      ],
      "prototypes": [
        {
          "name": "Prototype name",
          "description": "Description of what this prototype demonstrates",
          "userInteractions": ["Step 1: User action", "Step 2: System response", "Step 3: User reaction"],
          "keyFeaturesDemonstrated": ["Feature 1", "Feature 2", "Feature 3"]
        }
      ],
      "systemIntegrationDiagram": {
        "description": "Description of how the AI solution integrates with existing systems",
        "elements": ["Element 1", "Element 2", "Element 3"],
        "connections": [
          { "from": "Element 1", "to": "Element 2", "type": "data|api|event", "description": "Description of connection" }
        ]
      }
    }
    
    Make the design concept realistic, practical, and tailored to the specific industry and business problem.
    The design should include at least a comprehensive user interface, system architecture, and integration points.
    Be specific in components, user flows, and personas based on the information provided.
    
    For mockups and diagrams, provide detailed textual descriptions that could be used to generate actual visual representations.
    Focus on how the AI solution would integrate with existing systems and workflows.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating design concept:", error);
    return {
      title: "AI Solution Design Concept",
      overview: "Could not generate a detailed design concept. Please try again later.",
      interfaceComponents: [],
      userFlows: [],
      architecture: {
        description: "",
        components: []
      },
      integrations: [],
      personas: [],
      mockups: [],
      prototypes: [],
      systemIntegrationDiagram: {
        description: "",
        elements: [],
        connections: []
      }
    };
  }
}

/**
 * Generate a business case based on session data
 * @param session The session containing user inputs about their AI solution
 */
export async function generateBusinessCase(session: Session): Promise<any> {
  const prompt = `
    You are an AI solution business case specialist. Based on the following information about an AI solution, 
    create a detailed business case in JSON format.
    
    Industry: ${session.industry || "Not specified"}
    Business Problem: ${session.businessProblem || "Not specified"}
    Current Process: ${session.currentProcess || "Not specified"}
    Available Data: ${session.availableData || "Not specified"}
    Success Metrics: ${session.successMetrics || "Not specified"}
    Stakeholders: ${session.stakeholders || "Not specified"}
    Timeline: ${session.timeline || "Not specified"}
    Budget: ${session.budget || "Not specified"}
    
    Generate a comprehensive business case with the following structure:
    {
      "title": "AI Solution Business Case for [appropriate title based on business problem]",
      "executiveSummary": "A brief executive summary of the business case",
      "problemStatement": "A clear statement of the business problem",
      "problemDetails": ["Detail 1", "Detail 2", "Detail 3", "Detail 4"],
      "proposedSolution": "A description of the proposed AI solution",
      "solutionComponents": ["Component 1", "Component 2", "Component 3", "Component 4"],
      "financials": {
        "initialInvestment": initial investment amount,
        "annualBenefit": annual benefit amount,
        "paybackPeriod": "X months/years",
        "roi": "X%",
        "npv": net present value,
        "benefitsBreakdown": [
          {
            "name": "Benefit name",
            "description": "Description of benefit",
            "value": annual value in USD
          }
        ]
      },
      "nonFinancialBenefits": [
        "Non-financial benefit 1",
        "Non-financial benefit 2",
        "Non-financial benefit 3",
        "Non-financial benefit 4"
      ],
      "risks": [
        {
          "name": "Risk name",
          "description": "Description of risk",
          "mitigation": "Mitigation strategy"
        }
      ],
      "recommendation": "Final recommendation",
      "nextSteps": ["Step 1", "Step 2", "Step 3", "Step 4"]
    }
    
    Make the business case realistic, persuasive, and tailored to the specific industry and business problem.
    Use realistic financial figures, ROI calculations, and payback periods.
    The business case should include at least 4 non-financial benefits and 4 risks with mitigations.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating business case:", error);
    return {
      title: "AI Solution Business Case",
      executiveSummary: "Could not generate a detailed business case. Please try again later.",
      problemStatement: "",
      problemDetails: [],
      proposedSolution: "",
      solutionComponents: [],
      financials: {
        initialInvestment: 0,
        annualBenefit: 0,
        paybackPeriod: "N/A",
        roi: "N/A",
        npv: 0,
        benefitsBreakdown: []
      },
      nonFinancialBenefits: [],
      risks: [],
      recommendation: "",
      nextSteps: []
    };
  }
}

/**
 * Generate AI considerations based on session data
 * @param session The session containing user inputs about their AI solution
 */
export async function generateAIConsiderations(session: Session): Promise<any> {
  const prompt = `
    You are an AI ethics and implementation specialist. Based on the following information about an AI solution, 
    create detailed AI considerations in JSON format.
    
    Industry: ${session.industry || "Not specified"}
    Business Problem: ${session.businessProblem || "Not specified"}
    Current Process: ${session.currentProcess || "Not specified"}
    Available Data: ${session.availableData || "Not specified"}
    Success Metrics: ${session.successMetrics || "Not specified"}
    Stakeholders: ${session.stakeholders || "Not specified"}
    Timeline: ${session.timeline || "Not specified"}
    Budget: ${session.budget || "Not specified"}
    
    Generate comprehensive AI considerations with the following structure:
    {
      "title": "AI Solution Considerations for [appropriate title based on business problem]",
      "overview": "A brief overview of key AI considerations for this solution",
      "technical": [
        {
          "name": "Technical consideration name",
          "description": "Description of technical consideration",
          "considerations": ["Specific point 1", "Specific point 2", "Specific point 3"]
        }
      ],
      "ethical": [
        {
          "name": "Ethical consideration name",
          "description": "Description of ethical consideration",
          "risks": ["Risk 1", "Risk 2", "Risk 3"],
          "bestPractices": ["Best practice 1", "Best practice 2", "Best practice 3"]
        }
      ],
      "organizational": [
        {
          "name": "Organizational consideration name",
          "description": "Description of organizational consideration",
          "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
        }
      ],
      "recommendations": [
        "Overall recommendation 1",
        "Overall recommendation 2",
        "Overall recommendation 3",
        "Overall recommendation 4",
        "Overall recommendation 5"
      ]
    }
    
    Make the AI considerations thorough, realistic, and tailored to the specific industry and business problem.
    Cover technical aspects like data requirements, model selection, and integration.
    Cover ethical aspects like bias, fairness, and transparency.
    Cover organizational aspects like change management, capability building, and governance.
    Include at least 3 technical considerations, 3 ethical considerations, and 3 organizational considerations.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating AI considerations:", error);
    return {
      title: "AI Solution Considerations",
      overview: "Could not generate detailed AI considerations. Please try again later.",
      technical: [],
      ethical: [],
      organizational: [],
      recommendations: []
    };
  }
}
