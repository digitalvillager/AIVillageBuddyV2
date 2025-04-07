import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputDocument, SessionState } from "@/types";
import { Download, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface BusinessCaseProps {
  output: OutputDocument | null | undefined;
  sessionState: SessionState;
  isLoading: boolean;
}

export function BusinessCase({ output, sessionState, isLoading }: BusinessCaseProps) {
  if (!output && !sessionState.isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - Business Case</h3>
        </div>
        
        <div className="flex items-center justify-center h-64 border border-dashed border-neutral-300 rounded-lg bg-neutral-50">
          <div className="text-center p-6">
            <h4 className="text-lg font-medium text-neutral-600 mb-2">Your Business Case will appear here</h4>
            <p className="text-neutral-500 max-w-md">
              Continue the conversation with AI Buddy to gather more information about your AI solution needs. Once we have enough details, we'll generate a comprehensive business case.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading || !output) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - Business Case</h3>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
          <div className="h-48 bg-neutral-200 rounded"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Debug the content we've received
  console.log("Business Case tab received output:", output);
  
  // Safe default structure to prevent errors
  let businessData = {
    title: "",
    overview: "",
    problemStatement: "",
    objectives: [],
    benefits: [],
    roi: {
      description: "",
      metrics: []
    },
    risksAndMitigation: []
  };
  
  if (output && output.content) {
    if (typeof output.content === 'string') {
      try {
        // Try to parse if it's a JSON string
        businessData = JSON.parse(output.content);
      } catch (e) {
        console.error("Failed to parse business case output content:", e);
      }
    } else if (typeof output.content === 'object') {
      // Use the object directly
      businessData = output.content;
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-800">
          {businessData.title || "AI Solution - Business Case"}
        </h3>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
      
      <Card className="bg-neutral-100">
        <CardContent className="p-4">
          <h4 className="font-medium text-primary mb-2">Executive Summary</h4>
          <p className="text-neutral-700">
            {businessData.executiveSummary || "This business case outlines the justification, financial analysis, and recommendations for implementing your AI solution."}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Problem Statement</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-neutral-700">
            {businessData.problemStatement || "The current business problem that necessitates an AI solution."}
          </p>
          
          {businessData.problemDetails && (
            <ul className="mt-3 space-y-2 ml-5">
              {businessData.problemDetails.map((detail: string, index: number) => (
                <li key={index} className="text-sm text-neutral-600 list-disc">
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Proposed Solution</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-neutral-700 mb-3">
            {businessData.proposedSolution || "A description of the AI solution being proposed to address the business problem."}
          </p>
          
          <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
            <h5 className="font-medium text-primary mb-2">Key Solution Components</h5>
            <ul className="space-y-2">
              {businessData.solutionComponents?.map((component: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="text-success h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{component}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border border-neutral-200 rounded-lg p-3">
              <h5 className="font-medium text-neutral-700 mb-2">Initial Investment</h5>
              <div className="text-2xl font-bold text-primary">${businessData.financials?.initialInvestment || "0"}</div>
            </div>
            <div className="border border-neutral-200 rounded-lg p-3">
              <h5 className="font-medium text-neutral-700 mb-2">Annual Savings/Revenue</h5>
              <div className="text-2xl font-bold text-success">${businessData.financials?.annualBenefit || "0"}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="font-medium">Payback Period</span>
              <span>{businessData.financials?.paybackPeriod || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="font-medium">ROI</span>
              <span>{businessData.financials?.roi || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="font-medium">NPV</span>
              <span>${businessData.financials?.npv || "0"}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium text-neutral-700 mb-2">Financial Benefits Breakdown</h5>
            {businessData.financials?.benefitsBreakdown && (
              <ul className="space-y-2">
                {businessData.financials.benefitsBreakdown.map((benefit: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="text-primary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{benefit.name}</span>
                      <p className="text-sm text-neutral-600">{benefit.description}</p>
                      {benefit.value && <p className="text-sm font-medium text-success">${benefit.value}/year</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Non-Financial Benefits</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {businessData.nonFinancialBenefits?.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="text-success h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Risks and Mitigations</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {businessData.risks?.map((risk: any, index: number) => (
            <div key={index} className="mb-3 pb-3 border-b border-neutral-200 last:border-0 last:mb-0 last:pb-0">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="text-warning h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{risk.name}</span>
              </div>
              <p className="text-sm text-neutral-600 ml-7 mb-2">{risk.description}</p>
              <div className="ml-7">
                <span className="text-xs font-medium text-neutral-500">Mitigation:</span>
                <p className="text-sm text-neutral-700">{risk.mitigation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="bg-[#2A9D8F] text-white p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Final Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-neutral-700">
            {businessData.recommendation || "Based on the analysis, we recommend proceeding with the implementation of the AI solution."}
          </p>
          
          {businessData.nextSteps && (
            <div className="mt-4">
              <h5 className="font-medium text-neutral-700 mb-2">Next Steps</h5>
              <ol className="space-y-2 ml-5">
                {businessData.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="text-sm text-neutral-600 list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
