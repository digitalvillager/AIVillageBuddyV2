import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputDocument, SessionState } from "@/types";
import { Download, Monitor, Users, BarChart, Link2, Layout } from "lucide-react";

interface DesignConceptProps {
  output: OutputDocument | null | undefined;
  sessionState: SessionState;
  isLoading: boolean;
}

export function DesignConcept({ output, sessionState, isLoading }: DesignConceptProps) {
  if (!output && !sessionState.isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - Design Concept</h3>
        </div>
        
        <div className="flex items-center justify-center h-64 border border-dashed border-neutral-300 rounded-lg bg-neutral-50">
          <div className="text-center p-6">
            <h4 className="text-lg font-medium text-neutral-600 mb-2">Your Design Concept will appear here</h4>
            <p className="text-neutral-500 max-w-md">
              Continue the conversation with AI Buddy to gather more information about your AI solution needs. Once we have enough details, we'll generate a comprehensive design concept.
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
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - Design Concept</h3>
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
  
  const designData = output.content;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-800">
          {designData.title || "AI Solution - Design Concept"}
        </h3>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
      
      <Card className="bg-neutral-100">
        <CardContent className="p-4">
          <h4 className="font-medium text-primary mb-2">Design Overview</h4>
          <p className="text-neutral-700">
            {designData.overview || "This design concept outlines the key components and user experience of your AI solution."}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">User Interface Components</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-4">
            {designData.interfaceComponents?.map((component: any, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <Monitor className="text-primary h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium">{component.name}</h5>
                  <p className="text-sm text-neutral-600 mt-1">{component.description}</p>
                  {component.features && (
                    <ul className="mt-2 ml-4 space-y-1">
                      {component.features.map((feature: string, idx: number) => (
                        <li key={idx} className="text-sm text-neutral-700 list-disc">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Key User Flows</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {designData.userFlows?.map((flow: any, index: number) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-secondary h-5 w-5 flex-shrink-0" />
                  <h5 className="font-medium">{flow.name}</h5>
                </div>
                <ol className="space-y-3 ml-6">
                  {flow.steps.map((step: string, idx: number) => (
                    <li key={idx} className="text-sm text-neutral-700 list-decimal">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Technical Architecture</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="border border-neutral-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-neutral-700 mb-3">{designData.architecture?.description}</p>
            
            <div className="flex flex-col space-y-2">
              {designData.architecture?.components.map((component: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-neutral-50 p-2 rounded border border-neutral-200">
                  <BarChart className="text-primary h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{component}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Integration Points</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-3">
            {designData.integrations?.map((integration: any, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <Link2 className="text-info h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">{integration.system}</span>
                  <p className="text-sm text-neutral-600">{integration.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">User Personas</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {designData.personas?.map((persona: any, index: number) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-medium">{persona.name}</h5>
                    <p className="text-xs text-neutral-500">{persona.role}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{persona.description}</p>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-neutral-700">
                    <Layout className="h-4 w-4" />
                    <span>Key interactions:</span>
                  </div>
                  <ul className="mt-1 ml-5 space-y-1">
                    {persona.interactions.map((interaction: string, idx: number) => (
                      <li key={idx} className="text-sm list-disc">
                        {interaction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
