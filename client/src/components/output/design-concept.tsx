import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { OutputDocument, OutputType, SessionState } from "@/types";
import { 
  Download, Monitor, Users, BarChart, Link2, Layout, 
  Laptop, Database, ArrowRight, Smartphone, Server, 
  ArrowUpRight, Zap, Workflow, Lightbulb, Eye, Info, 
  ExternalLink, LayoutDashboard, ChevronDown, ChevronUp
} from "lucide-react";
import { generatePdfFromElement, getFileNameForOutputType } from "@/utils/pdf-generator";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DesignConceptProps {
  output: OutputDocument | null | undefined;
  sessionState: SessionState;
  isLoading: boolean;
  outputType: OutputType;
}

// Simple Architecture diagram component
function ArchitectureDiagram({ elements, connections }: any) {
  if (!elements || !connections || elements.length === 0) return null;

  return (
    <div className="mt-4 p-4 border border-neutral-200 rounded-lg bg-white">
      <h5 className="font-medium mb-3 text-neutral-700">System Architecture Diagram</h5>
      
      <div className="relative h-[300px] w-full border border-dashed border-neutral-300 rounded-lg p-4 bg-neutral-50">
        {/* Diagram nodes */}
        <div className="flex justify-around items-center h-full">
          {elements.map((element: string, idx: number) => (
            <div 
              key={idx}
              className="relative flex flex-col items-center justify-center w-28 h-28 bg-white border border-neutral-300 rounded-md shadow-sm z-10"
              style={{ position: 'absolute', left: `${(idx * 30) + 10}%`, top: `${idx % 2 === 0 ? 20 : 60}%` }}
            >
              {idx === 0 ? <Database className="h-8 w-8 text-primary mb-2" /> : 
               idx === 1 ? <Server className="h-8 w-8 text-secondary mb-2" /> : 
               <Laptop className="h-8 w-8 text-info mb-2" />}
              <span className="text-xs font-medium text-center px-1">{element}</span>
            </div>
          ))}
        </div>
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
          {connections.map((conn: any, idx: number) => {
            const fromIdx = elements.indexOf(conn.from);
            const toIdx = elements.indexOf(conn.to);
            
            if (fromIdx === -1 || toIdx === -1) return null;
            
            const x1 = (fromIdx * 30) + 10 + 14; // Center of from node
            const y1 = (fromIdx % 2 === 0 ? 20 : 60) + 14;
            const x2 = (toIdx * 30) + 10 + 14; // Center of to node
            const y2 = (toIdx % 2 === 0 ? 20 : 60) + 14;
            
            return (
              <g key={idx}>
                <line 
                  x1={`${x1}%`} y1={`${y1}%`} 
                  x2={`${x2}%`} y2={`${y2}%`} 
                  stroke="rgba(107, 114, 128, 0.7)" 
                  strokeWidth="2" 
                  strokeDasharray={conn.type === "api" ? "5,5" : ""}
                  markerEnd="url(#arrow)" 
                />
                
                {/* Connection label */}
                <text x={`${(x1 + x2) / 2}%`} y={`${(y1 + y2) / 2 - 2}%`} textAnchor="middle" 
                      fill="#6B7280" fontSize="10" fontWeight="500" className="bg-white px-1">
                  <tspan className="bg-white px-1">{conn.type || ""}</tspan>
                </text>
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(107, 114, 128, 0.7)" />
            </marker>
          </defs>
        </svg>
      </div>
      
      <div className="mt-3 text-xs text-neutral-500">
        This simplified diagram illustrates the key components and their interactions in the proposed solution.
      </div>
    </div>
  );
}

// Simple interactive component mockup
function MockupPreview({ mockup }: { mockup: any }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!mockup) return null;
  
  const MockupIcon = () => {
    switch (mockup.type) {
      case 'dashboard':
        return <LayoutDashboard className="h-5 w-5 text-primary" />;
      case 'form':
        return <Layout className="h-5 w-5 text-primary" />;
      case 'report':
        return <BarChart className="h-5 w-5 text-primary" />;
      case 'visualization':
        return <LineChart className="h-5 w-5 text-primary" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5 text-primary" />;
      case 'integration':
        return <Link2 className="h-5 w-5 text-primary" />;
      default:
        return <Monitor className="h-5 w-5 text-primary" />;
    }
  };
  
  // Generate appropriate sample data based on mockup type
  const mockupPreview = () => {
    if (expanded) {
      switch (mockup.type) {
        case 'dashboard':
          return (
            <div className="mt-4 border border-neutral-200 p-4 rounded-lg bg-white">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-32 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center">
                  <BarChart className="h-10 w-10 text-neutral-400" />
                </div>
                <div className="h-32 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center">
                  <LineChart className="h-10 w-10 text-neutral-400" />
                </div>
              </div>
              <div className="h-48 bg-neutral-100 rounded-lg border border-neutral-200 p-3">
                <div className="h-5 w-1/3 bg-neutral-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
              </div>
            </div>
          );
        case 'report':
        case 'visualization':
          return (
            <div className="mt-4 border border-neutral-200 rounded-lg p-4 bg-white">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={[
                    { name: 'Jan', value: 400 },
                    { name: 'Feb', value: 300 },
                    { name: 'Mar', value: 500 },
                    { name: 'Apr', value: 270 },
                    { name: 'May', value: 600 },
                    { name: 'Jun', value: 550 },
                    { name: 'Jul', value: 700 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-center text-neutral-500">{mockup.name} visualization</div>
            </div>
          );
        case 'form':
          return (
            <div className="mt-4 border border-neutral-200 rounded-lg p-4 bg-white">
              <div className="space-y-3">
                <div>
                  <div className="h-4 w-1/4 bg-neutral-200 rounded mb-1"></div>
                  <div className="h-8 w-full bg-neutral-100 rounded border border-neutral-200"></div>
                </div>
                <div>
                  <div className="h-4 w-1/3 bg-neutral-200 rounded mb-1"></div>
                  <div className="h-8 w-full bg-neutral-100 rounded border border-neutral-200"></div>
                </div>
                <div>
                  <div className="h-4 w-1/5 bg-neutral-200 rounded mb-1"></div>
                  <div className="h-24 w-full bg-neutral-100 rounded border border-neutral-200"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-9 w-24 bg-primary rounded"></div>
                </div>
              </div>
            </div>
          );
        case 'mobile':
          return (
            <div className="mt-4 flex justify-center">
              <div className="w-48 h-96 border-4 border-neutral-400 rounded-2xl overflow-hidden relative bg-white">
                <div className="h-8 bg-neutral-200 w-full"></div>
                <div className="p-2">
                  <div className="h-32 bg-neutral-100 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-neutral-200 rounded"></div>
                    <div className="h-6 bg-neutral-200 rounded"></div>
                    <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                  </div>
                  <div className="absolute bottom-0 w-full left-0 h-12 bg-neutral-100 border-t border-neutral-200 flex justify-around items-center">
                    <div className="h-6 w-6 bg-neutral-300 rounded-full"></div>
                    <div className="h-6 w-6 bg-neutral-300 rounded-full"></div>
                    <div className="h-6 w-6 bg-neutral-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        case 'integration':
          return (
            <div className="mt-4 border border-neutral-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-around">
                <div className="w-24 h-24 border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center">
                  <Database className="h-10 w-10 text-neutral-400" />
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-8 w-8 text-neutral-400 mb-1" />
                  <div className="text-xs text-neutral-500">API</div>
                </div>
                <div className="w-24 h-24 border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center">
                  <Server className="h-10 w-10 text-neutral-400" />
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-8 w-8 text-neutral-400 mb-1" />
                  <div className="text-xs text-neutral-500">UI</div>
                </div>
                <div className="w-24 h-24 border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center">
                  <Laptop className="h-10 w-10 text-neutral-400" />
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div className="mt-4 border border-neutral-200 rounded-lg p-4 bg-white">
              <div className="flex justify-center">
                <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
                  <Monitor className="h-12 w-12 text-neutral-300" />
                </div>
              </div>
            </div>
          );
      }
    }
    return null;
  };
  
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="bg-neutral-50 py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MockupIcon />
          <CardTitle className="text-sm font-medium">{mockup.name}</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className={`p-3 ${expanded ? 'pb-4' : ''}`}>
        <p className="text-sm text-neutral-600">{mockup.description}</p>
        {mockupPreview()}
      </CardContent>
      {expanded && (
        <CardFooter className="px-3 py-2 bg-neutral-50 flex justify-between border-t border-neutral-200 text-xs">
          <span className="text-neutral-500">Interactive mockup preview</span>
          <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs">
            <ExternalLink className="h-3 w-3 mr-1" /> Expand
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Prototype demonstration component
function PrototypeDemo({ prototype }: { prototype: any }) {
  const [step, setStep] = useState(0);
  
  if (!prototype || !prototype.userInteractions || prototype.userInteractions.length === 0) return null;
  
  return (
    <Card className="overflow-hidden border border-neutral-200">
      <CardHeader className="py-3 px-4 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">{prototype.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-neutral-600 mb-4">{prototype.description}</p>
        
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <div className="flex items-center mb-3">
            <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
              {step + 1}
            </div>
            <div className="h-[2px] flex-grow bg-neutral-200 mx-2"></div>
            <div className="text-sm text-neutral-500">{step + 1} of {prototype.userInteractions.length}</div>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-lg p-3 min-h-[100px] flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2">
                {step % 2 === 0 ? 
                  <Users className="h-8 w-8 text-neutral-500 mx-auto mb-2" /> : 
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                }
              </div>
              <p className="text-sm">{prototype.userInteractions[step]}</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStep(prev => Math.max(0, prev - 1))}
              disabled={step === 0}
            >
              Previous
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setStep(prev => Math.min(prototype.userInteractions.length - 1, prev + 1))}
              disabled={step === prototype.userInteractions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
        
        {prototype.keyFeaturesDemonstrated && (
          <div className="mt-4">
            <h6 className="text-sm font-medium flex items-center gap-1 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Key Features Demonstrated
            </h6>
            <ul className="ml-5 space-y-1">
              {prototype.keyFeaturesDemonstrated.map((feature: string, idx: number) => (
                <li key={idx} className="text-sm text-neutral-600 list-disc">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Modified main component
export function DesignConcept({ output, sessionState, isLoading, outputType }: DesignConceptProps) {
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
  
  // Debug the content we've received
  console.log("Design tab received output:", output);
  
  // Safe default structure to prevent errors
  let designData = {
    title: "",
    overview: "",
    interfaceComponents: [],
    userFlows: [],
    architecture: { 
      description: "", 
      components: [],
      diagramElements: {
        nodes: [],
        connections: []
      }
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
  
  if (output && output.content) {
    console.log("Design component received content type:", typeof output.content);
    console.log("Design content sample:", output.content);
    
    if (typeof output.content === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedContent = JSON.parse(output.content);
        console.log("Successfully parsed design JSON string:", typeof parsedContent);
        designData = parsedContent;
      } catch (e) {
        console.error("Failed to parse design output content:", e);
        // If parsing fails, use the string directly for display
        designData = {
          ...designData,
          overview: output.content,
          title: "Design Concept"
        };
      }
    } else if (typeof output.content === 'object') {
      // Use the object directly
      console.log("Using object directly for design data");
      designData = output.content;
    }
    
    // Debug the structure we ended up with
    console.log("Final designData structure has keys:", Object.keys(designData));
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-neutral-800">
          {designData.title || "AI Solution - Design Concept"}
        </h3>
        <Button
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
          onClick={() => {
            // Generate PDF from the current content based on outputType
            const elementId = `${outputType}-output-content`;
            const fileName = getFileNameForOutputType(outputType);
            generatePdfFromElement(elementId, fileName);
          }}
        >
          <Download className="h-4 w-4 mr-1" /> Download PDF
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
      
      {/* Mockups Section */}
      {designData.mockups && designData.mockups.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-neutral-800 mb-3 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Visual Mockups
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {designData.mockups.map((mockup: any, idx: number) => (
              <MockupPreview key={idx} mockup={mockup} />
            ))}
          </div>
        </div>
      )}
      
      {/* User Interface Components */}
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
                  
                  {/* Mockup Description */}
                  {component.mockupDescription && (
                    <div className="mt-2 p-3 border border-dashed border-neutral-300 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-1 mb-1 text-primary">
                        <Info className="h-4 w-4" />
                        <span className="text-xs font-medium">Visual Implementation</span>
                      </div>
                      <p className="text-sm text-neutral-600">{component.mockupDescription}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Interactive Prototypes */}
      {designData.prototypes && designData.prototypes.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-neutral-800 mb-3 flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Interactive Prototypes
          </h4>
          <div className="space-y-4">
            {designData.prototypes.map((prototype: any, idx: number) => (
              <PrototypeDemo key={idx} prototype={prototype} />
            ))}
          </div>
        </div>
      )}
      
      {/* User Flows */}
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
                
                {/* Flow diagram description */}
                {flow.diagramDescription && (
                  <div className="mt-4 p-3 border border-dashed border-neutral-300 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1 text-primary">
                      <Workflow className="h-4 w-4" />
                      <span className="text-xs font-medium">Flow Visualization</span>
                    </div>
                    <p className="text-sm text-neutral-600">{flow.diagramDescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Technical Architecture */}
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
            
            {/* Architecture Diagram */}
            {designData.architecture?.diagramElements && 
             designData.architecture.diagramElements.nodes && 
             designData.architecture.diagramElements.nodes.length > 0 && (
               <ArchitectureDiagram 
                 elements={designData.architecture.diagramElements.nodes} 
                 connections={designData.architecture.diagramElements.connections}
               />
             )}
          </div>
        </CardContent>
      </Card>
      
      {/* Integration Points */}
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
                  
                  {/* Data Flow Description */}
                  {integration.dataFlow && (
                    <div className="mt-2 p-2 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">Data Flow</span>
                      </div>
                      <p className="text-xs text-neutral-600">{integration.dataFlow}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          
          {/* System Integration Diagram */}
          {designData.systemIntegrationDiagram && 
           designData.systemIntegrationDiagram.elements && 
           designData.systemIntegrationDiagram.elements.length > 0 && (
             <div className="mt-4">
               <h5 className="text-sm font-medium mb-2">System Integration Diagram</h5>
               <p className="text-sm text-neutral-600 mb-3">{designData.systemIntegrationDiagram.description}</p>
               <ArchitectureDiagram 
                 elements={designData.systemIntegrationDiagram.elements} 
                 connections={designData.systemIntegrationDiagram.connections} 
               />
             </div>
           )}
        </CardContent>
      </Card>
      
      {/* User Personas */}
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
