import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OutputType, SessionState } from "@/types";
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw } from 'lucide-react';
import ErrorBoundary from '@/components/error-boundary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImplementationPlan } from './implementation-plan';
import { CostEstimate } from './cost-estimate';
import { DesignConcept } from './design-concept';
import { BusinessCase } from './business-case';
import { AIConsiderations } from './ai-considerations';

interface OutputPanelProps {
  sessionId: string;
  activeTab: OutputType;
  onTabChange: (tab: OutputType) => void;
  onRegenerateOutputs: () => void;
  isGenerating: boolean;
  sessionState: SessionState;
}

export function OutputPanel({
  sessionId,
  activeTab,
  onTabChange,
  onRegenerateOutputs,
  isGenerating,
  sessionState
}: OutputPanelProps) {
  // Fetch output documents
  const { data: outputs, isLoading } = useQuery({
    queryKey: ['/api/outputs', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/outputs?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch outputs');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
  
  // Save local copies of all outputs
  const [implementationOutput, setImplementationOutput] = useState<any>(null);
  const [costOutput, setCostOutput] = useState<any>(null);
  const [designOutput, setDesignOutput] = useState<any>(null);
  const [businessOutput, setBusinessOutput] = useState<any>(null);
  const [aiOutput, setAIOutput] = useState<any>(null);
  
  // Update local state when outputs change
  useEffect(() => {
    if (outputs) {
      console.log("Updating local output states with:", outputs);
      
      const implOut = outputs.find((o: any) => o.type === "implementation");
      const costOut = outputs.find((o: any) => o.type === "cost");
      const designOut = outputs.find((o: any) => o.type === "design");
      const businessOut = outputs.find((o: any) => o.type === "business");
      const aiOut = outputs.find((o: any) => o.type === "ai");
      
      setImplementationOutput(implOut);
      setCostOutput(costOut);
      setDesignOutput(designOut);
      setBusinessOutput(businessOut);
      setAIOutput(aiOut);
      
      console.log("Set implementation output to:", implOut);
      console.log("Set cost output to:", costOut);
      console.log("Set design output to:", designOut);
      console.log("Set business output to:", businessOut);
      console.log("Set AI output to:", aiOut);
    }
  }, [outputs]);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("Current activeTab value:", activeTab);
    console.log("Available outputs:", outputs);
    
    // Log individual outputs by type to check what's available
    if (outputs) {
      outputs.forEach((out: any) => {
        console.log(`Output type: ${out.type}, ID: ${out.id}, Has content:`, !!out.content);
        // More detailed output content inspection
        if (out.content) {
          try {
            console.log(`Content type for ${out.type}:`, typeof out.content);
            if (typeof out.content === 'string' && out.content.trim().startsWith('{')) {
              console.log(`${out.type} content seems to be a JSON string. Trying to parse...`);
              const parsed = JSON.parse(out.content);
              console.log(`${out.type} parsed structure:`, Object.keys(parsed));
            } else if (typeof out.content === 'object') {
              console.log(`${out.type} structure:`, Object.keys(out.content));
            }
          } catch (e) {
            console.error(`Error inspecting ${out.type} content:`, e);
          }
        }
      });
    }
  }, [activeTab, outputs]);
  
  // Check if we have enough data to generate outputs
  const canGenerateOutputs = sessionState?.businessProblem && (
    sessionState?.industry || 
    sessionState?.currentProcess || 
    sessionState?.availableData
  );
  
  // Helper to render the current active tab
  const renderActiveTabContent = () => {
    console.log("Rendering active tab:", activeTab);
    
    switch (activeTab) {
      case 'implementation':
        return (
          <div className="p-4">
            <ImplementationPlan
              output={implementationOutput}
              sessionState={sessionState}
              isLoading={isLoading || isGenerating}
            />
          </div>
        );
        
      case 'cost':
        return (
          <div className="p-4">
            <CostEstimate
              output={costOutput}
              sessionState={sessionState}
              isLoading={isLoading || isGenerating}
            />
          </div>
        );
        
      case 'design':
        return (
          <div className="p-4">
            <DesignConcept
              output={designOutput}
              sessionState={sessionState}
              isLoading={isLoading || isGenerating}
            />
          </div>
        );
        
      case 'business':
        return (
          <div className="p-4">
            <BusinessCase
              output={businessOutput}
              sessionState={sessionState}
              isLoading={isLoading || isGenerating}
            />
          </div>
        );
        
      case 'ai':
        return (
          <div className="p-4">
            <AIConsiderations
              output={aiOutput}
              sessionState={sessionState}
              isLoading={isLoading || isGenerating}
            />
          </div>
        );
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };
  
  return (
    <Card className="w-full h-[calc(100vh-10rem)] flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Solution Explorer</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateOutputs}
            disabled={isGenerating || !canGenerateOutputs}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Regenerate All'}
          </Button>
        </div>
      </CardHeader>
      
      <Tabs
        defaultValue="implementation"
        value={activeTab}
        className="flex-1 flex flex-col overflow-hidden"
        onValueChange={(value) => {
          console.log("Tab changed to:", value);
          onTabChange(value as OutputType);
        }}
      >
        <TabsList className="px-4 py-2 bg-card border-b flex-shrink-0">
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="business">Business Case</TabsTrigger>
          <TabsTrigger value="ai">AI Considerations</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <ScrollArea className="h-full flex-1">
              {renderActiveTabContent()}
            </ScrollArea>
          </ErrorBoundary>
        </div>
      </Tabs>
    </Card>
  );
}
