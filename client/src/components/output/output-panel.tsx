import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  
  // Find the active output document
  const activeOutput = outputs?.find((output: any) => output.type === activeTab);
  
  // Enhanced logging for debugging
  console.log("Active tab:", activeTab);
  console.log("Available outputs:", outputs);
  console.log("Selected output for tab:", activeTab, "=", activeOutput);
  
  // Log individual outputs by type to check what's available
  if (outputs) {
    outputs.forEach((out: any) => {
      console.log(`Output type: ${out.type}, ID: ${out.id}, Has content:`, !!out.content);
    });
  }
  
  // Check if we have enough data to generate outputs
  const canGenerateOutputs = sessionState?.businessProblem && (
    sessionState?.industry || 
    sessionState?.currentProcess || 
    sessionState?.availableData
  );
  
  // Safe way to handle content rendering with line breaks
  const formatContent = (content?: any) => {
    if (!content) return [];
    if (typeof content !== 'string') {
      // If content is not a string (could be an object or something else), 
      // try to convert it to a string or return empty array
      try {
        content = String(content);
      } catch (e) {
        console.error("Error converting content to string:", e);
        return [];
      }
    }
    return content.split('\n\n').filter(Boolean);
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
        onValueChange={(value) => onTabChange(value as OutputType)}
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
            <TabsContent value="implementation" className="h-full m-0 overflow-hidden flex flex-col">
              <ScrollArea className="h-full flex-1">
                <div className="p-4">
                  <ImplementationPlan
                    output={outputs?.find((o: any) => o.type === "implementation")}
                    sessionState={sessionState}
                    isLoading={isLoading || isGenerating}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="cost" className="h-full m-0 overflow-hidden flex flex-col">
              <ScrollArea className="h-full flex-1">
                <div className="p-4">
                  <CostEstimate
                    output={outputs?.find((o: any) => o.type === "cost")}
                    sessionState={sessionState}
                    isLoading={isLoading || isGenerating}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="design" className="h-full m-0 overflow-hidden flex flex-col">
              <ScrollArea className="h-full flex-1">
                <div className="p-4">
                  <DesignConcept
                    output={outputs?.find((o: any) => o.type === "design")}
                    sessionState={sessionState}
                    isLoading={isLoading || isGenerating}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="business" className="h-full m-0 overflow-hidden flex flex-col">
              <ScrollArea className="h-full flex-1">
                <div className="p-4">
                  <BusinessCase
                    output={outputs?.find((o: any) => o.type === "business")}
                    sessionState={sessionState}
                    isLoading={isLoading || isGenerating}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="ai" className="h-full m-0 overflow-hidden flex flex-col">
              <ScrollArea className="h-full flex-1">
                <div className="p-4">
                  <AIConsiderations
                    output={outputs?.find((o: any) => o.type === "ai")}
                    sessionState={sessionState}
                    isLoading={isLoading || isGenerating}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </ErrorBoundary>
        </div>
      </Tabs>
    </Card>
  );
}

interface OutputContentProps {
  title: string;
  isLoading: boolean;
  content?: string;
  isEmpty: boolean;
  emptyMessage: string;
}

function OutputContent({ title, isLoading, content, isEmpty, emptyMessage }: OutputContentProps) {
  // Helper function to format content
  const formatContent = (text?: any): string[] => {
    if (!text) return [];
    
    console.log(`OutputContent - Raw content type: ${typeof content}`, content);
    
    if (typeof text !== 'string') {
      // If text is not a string (could be an object or something else), 
      // try to convert it to a string or return empty array
      try {
        if (typeof text === 'object') {
          text = JSON.stringify(text, null, 2);
        } else {
          text = String(text);
        }
      } catch (e) {
        console.error("Error converting content to string:", e);
        return [];
      }
    }
    return text.split('\n\n').filter(Boolean);
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Generating {title}...</p>
      </div>
    );
  }
  
  if (isEmpty || !content) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground max-w-md">{emptyMessage}</p>
        <p className="text-muted-foreground text-sm mt-2">
          Continue the conversation to gather more information.
        </p>
      </div>
    );
  }
  
  // Render JSON content more appropriately
  const renderJsonContent = () => {
    // If it's already a structured JSON object
    if (typeof content === 'object' && content !== null) {
      return (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    
    // Otherwise render paragraphs as normal
    return (
      <div className="prose max-w-none">
        {formatContent(content).map((para: string, idx: number) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">{title}</h2>
          {renderJsonContent()}
        </div>
      </ScrollArea>
    </div>
  );
}