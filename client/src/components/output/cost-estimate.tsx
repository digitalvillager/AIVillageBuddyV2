import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputDocument, SessionState } from "@/types";
import { Download, Info } from "lucide-react";

interface CostEstimateProps {
  output: OutputDocument | null | undefined;
  sessionState: SessionState;
  isLoading: boolean;
}

export function CostEstimate({ output, sessionState, isLoading }: CostEstimateProps) {
  if (isLoading || !output) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-neutral-800">AI Solution - Cost Estimate</h3>
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
  
  // Add debugging output on what we received from the parent
  console.log("Cost tab received output:", output);
  
  // Add defensive content handling
  let costData = {
    title: "",
    overview: "",
    personnel: [],
    hardware: [],
    maintenance: [],
    subtotals: { personnel: 0, hardware: 0, maintenance: 0 },
    contingencyPercentage: 15,
    contingency: 0,
    totalImplementation: 0,
    considerations: []
  };
  
  if (output && output.content) {
    console.log("Cost component received content type:", typeof output.content);
    console.log("Cost content sample:", output.content);
    
    if (typeof output.content === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedContent = JSON.parse(output.content);
        console.log("Successfully parsed cost JSON string:", typeof parsedContent);
        costData = parsedContent;
      } catch (e) {
        console.error("Failed to parse cost output content:", e);
        // If parsing fails, use the string directly for display
        costData = {
          ...costData,
          overview: output.content,
          title: "Cost Estimate"
        };
      }
    } else if (typeof output.content === 'object') {
      // Use the object directly
      console.log("Using object directly for cost data");
      costData = output.content;
    }
    
    // Debug the structure we ended up with
    console.log("Final costData structure has keys:", Object.keys(costData));
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-800">
          {costData.title || "AI Solution - Cost Estimate"}
        </h3>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
      
      <Card className="bg-neutral-100">
        <CardContent className="p-4">
          <h4 className="font-medium text-primary mb-2">Project Budget Overview</h4>
          <p className="text-neutral-700">
            {costData.overview || "This cost estimate outlines the expected expenses for implementing your AI solution. All figures are estimates and may vary based on final requirements."}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Personnel Costs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Role</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Hours</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Rate ($/hr)</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {costData.personnel?.map((person: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-3">{person.role}</td>
                  <td className="px-4 py-3">{person.hours}</td>
                  <td className="px-4 py-3">${person.rate}</td>
                  <td className="px-4 py-3 font-medium">${person.total}</td>
                </tr>
              ))}
              <tr className="bg-neutral-50">
                <td className="px-4 py-3 font-medium" colSpan={3}>Subtotal - Personnel</td>
                <td className="px-4 py-3 font-medium">${costData.subtotals?.personnel}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Hardware & Software Costs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Item</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Quantity</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Unit Cost</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {costData.hardware?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">${item.unitCost}</td>
                  <td className="px-4 py-3 font-medium">${item.total}</td>
                </tr>
              ))}
              <tr className="bg-neutral-50">
                <td className="px-4 py-3 font-medium" colSpan={3}>Subtotal - Hardware/Software</td>
                <td className="px-4 py-3 font-medium">${costData.subtotals?.hardware}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Annual Maintenance Costs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Item</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Annual Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {costData.maintenance?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 font-medium">${item.cost}</td>
                </tr>
              ))}
              <tr className="bg-neutral-50">
                <td className="px-4 py-3 font-medium">Total Annual Maintenance</td>
                <td className="px-4 py-3 font-medium">${costData.subtotals?.maintenance}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <Card className="bg-neutral-50">
        <CardHeader className="bg-[#2A9D8F] text-white p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Total Project Budget</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Personnel Costs</span>
              <span className="font-medium">${costData.subtotals?.personnel}</span>
            </div>
            <div className="flex justify-between">
              <span>Hardware & Software</span>
              <span className="font-medium">${costData.subtotals?.hardware}</span>
            </div>
            <div className="flex justify-between">
              <span>Contingency ({costData.contingencyPercentage || 15}%)</span>
              <span className="font-medium">${costData.contingency}</span>
            </div>
            <div className="border-t border-neutral-300 pt-2 mt-2 flex justify-between">
              <span className="font-bold">Initial Implementation Cost</span>
              <span className="font-bold">${costData.totalImplementation}</span>
            </div>
            <div className="pt-2 flex justify-between text-neutral-600">
              <span>Annual Maintenance</span>
              <span>${costData.subtotals?.maintenance}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="bg-neutral-100 p-3 border-b border-neutral-200">
          <CardTitle className="font-medium text-base">Cost Considerations & Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {costData.considerations?.map((consideration: any, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <Info className="text-info h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-neutral-700">{consideration}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
