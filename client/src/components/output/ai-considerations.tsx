import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputDocument, SessionState } from "@/types";
import { Download, Database, Shield, Building, Check } from "lucide-react";

interface AIConsiderationsProps {
  output: OutputDocument | null | undefined;
  sessionState: SessionState;
  isLoading: boolean;
}

export function AIConsiderations({ output, sessionState, isLoading }: AIConsiderationsProps) {
  if (isLoading || !output) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - AI Considerations</h3>
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
  console.log("AI Considerations tab received output:", output);
  
  // Safe default structure to prevent errors with all possible properties
  let aiData = {
    title: "",
    overview: "",
    technical: [],
    ethical: [],
    organizational: [],
    recommendations: [],
    ethicalConsiderations: [],
    dataPrivacy: [],
    implementation: [],
    risks: []
  };
  
  if (output && output.content) {
    if (typeof output.content === 'string') {
      try {
        // Try to parse if it's a JSON string
        aiData = JSON.parse(output.content);
      } catch (e) {
        console.error("Failed to parse AI considerations output content:", e);
      }
    } else if (typeof output.content === 'object') {
      // Use the object directly
      aiData = output.content;
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-800">
          {aiData.title || "AI Solution - AI Considerations"}
        </h3>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
      
      <Card className="bg-neutral-100">
        <CardContent className="p-4">
          <h4 className="font-medium text-primary mb-2">Overview</h4>
          <p className="text-neutral-700">
            {aiData.overview || "This document outlines key technical, ethical, and organizational considerations for implementing your AI solution."}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Technical Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {aiData.technical?.map((item: any, index: number) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-3">
                <h5 className="font-medium mb-2">{item.name}</h5>
                <p className="text-sm text-neutral-600 mb-3">{item.description}</p>
                
                {item.considerations && (
                  <ul className="space-y-2">
                    {item.considerations.map((consideration: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="text-primary h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Ethical Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {aiData.ethical?.map((item: any, index: number) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-3">
                <h5 className="font-medium mb-2">{item.name}</h5>
                <p className="text-sm text-neutral-600 mb-3">{item.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-neutral-200 bg-neutral-50 p-2 rounded">
                    <h6 className="text-xs font-medium text-neutral-500 mb-1">Potential Risks</h6>
                    <ul className="space-y-1">
                      {item.risks?.map((risk: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-1">
                          <span className="text-red-500 text-lg leading-none">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border border-neutral-200 bg-neutral-50 p-2 rounded">
                    <h6 className="text-xs font-medium text-neutral-500 mb-1">Best Practices</h6>
                    <ul className="space-y-1">
                      {item.bestPractices?.map((practice: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-1">
                          <span className="text-green-500 text-lg leading-none">•</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Organizational Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {aiData.organizational?.map((item: any, index: number) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-3">
                <h5 className="font-medium mb-2">{item.name}</h5>
                <p className="text-sm text-neutral-600 mb-3">{item.description}</p>
                
                {item.recommendations && (
                  <div>
                    <h6 className="text-xs font-medium text-neutral-500 mb-1">Recommendations</h6>
                    <ul className="space-y-2">
                      {item.recommendations.map((recommendation: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="text-success h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="bg-[#2A9D8F] text-white p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Recommendations for Responsible AI Implementation</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ol className="space-y-3 ml-6">
            {aiData.recommendations?.map((recommendation: string, index: number) => (
              <li key={index} className="text-neutral-700 list-decimal">
                {recommendation}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
