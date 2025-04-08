import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OutputDocument, SessionState } from "@/types";
import { Download, User, AlertCircle } from "lucide-react";

interface ImplementationPlanProps {
  output: OutputDocument | null | undefined;
  sessionState: SessionState;
  isLoading: boolean;
}

export function ImplementationPlan({ output, sessionState, isLoading }: ImplementationPlanProps) {
  if (isLoading || !output) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - Implementation Plan</h3>
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
  console.log("Implementation tab received output:", output);
  
  // Safe default structure to prevent errors
  let implementationData = {
    title: "",
    overview: "",
    timeline: {
      overall: "",
      phases: []
    },
    roles: [],
    deliverables: [],
    dependencies: []
  };
  
  if (output && output.content) {
    console.log("Implementation component received content type:", typeof output.content);
    console.log("Implementation content sample:", output.content);
    
    if (typeof output.content === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedContent = JSON.parse(output.content);
        console.log("Successfully parsed implementation JSON string:", typeof parsedContent);
        implementationData = parsedContent;
      } catch (e) {
        console.error("Failed to parse implementation output content:", e);
        // If parsing fails, use the string directly for display
        implementationData = {
          ...implementationData,
          overview: output.content,
          title: "Implementation Plan"
        };
      }
    } else if (typeof output.content === 'object') {
      // Use the object directly
      console.log("Using object directly for implementation data");
      implementationData = output.content;
    }
    
    // Debug the structure we ended up with
    console.log("Final implementationData structure has keys:", Object.keys(implementationData));
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-800">
          {implementationData.title || "AI Solution - Implementation Plan"}
        </h3>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
      
      <Card className="bg-neutral-100">
        <CardContent className="p-4">
          <h4 className="font-medium text-primary mb-2">Project Overview</h4>
          <p className="text-neutral-700">
            {implementationData.overview || "This implementation plan outlines the steps required to develop your AI solution."}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Timeline Estimation</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                {implementationData.timeline?.overall || "Overall Duration: 16-20 weeks"}
              </span>
            </div>
            <Progress value={100} className="h-2.5 bg-neutral-200" />
          </div>
          
          <div className="space-y-3 mt-4">
            {implementationData.timeline?.phases?.map((phase: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{phase.name}</span>
                  <span className="text-sm text-neutral-500">{phase.percentage}%</span>
                </div>
                <Progress 
                  value={phase.percentage} 
                  className="h-2.5 bg-neutral-200" 
                  indicatorClassName={`${
                    index % 5 === 0 ? "bg-info" : 
                    index % 5 === 1 ? "bg-secondary" : 
                    index % 5 === 2 ? "bg-primary" : 
                    index % 5 === 3 ? "bg-warning" : 
                    "bg-success"
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Required Roles and Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {implementationData.roles?.map((role: any, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <User className="text-primary h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">{role.title}</span>
                  <p className="text-sm text-neutral-600">{role.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Key Deliverables</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {implementationData.deliverables?.map((deliverable: any, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-info flex items-center justify-center text-white flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{deliverable.title}</p>
                  <p className="text-sm text-neutral-600">{deliverable.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Dependencies and Critical Path Items</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {implementationData.dependencies?.map((dependency: any, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle className="text-warning h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">{dependency.title}</span>
                  <p className="text-sm text-neutral-600">{dependency.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
