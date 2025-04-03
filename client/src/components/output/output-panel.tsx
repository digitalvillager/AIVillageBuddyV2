import React, { useEffect, useState } from "react";
import { OutputTabs } from "./output-tabs";
import { ImplementationPlan } from "./implementation-plan";
import { CostEstimate } from "./cost-estimate";
import { DesignConcept } from "./design-concept";
import { BusinessCase } from "./business-case";
import { AIConsiderations } from "./ai-considerations";
import { OutputType, SessionState } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, Share, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isContentMounted, setIsContentMounted] = useState(false);
  
  // Handle ResizeObserver errors
  useEffect(() => {
    // Give the component time to fully mount before showing content
    const timer = setTimeout(() => {
      setIsContentMounted(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch outputs data
  const { data: outputs, isLoading } = useQuery({
    queryKey: ['/api/outputs', sessionId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/outputs?sessionId=${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch outputs');
        }
        return response.json();
      } catch (error: unknown) {
        console.error('Failed to fetch outputs:', error);
        toast({
          title: "Error",
          description: "Failed to load output documents.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!sessionId
  });

  // Get the active output document based on tab
  const getActiveOutput = () => {
    if (!outputs) return null;
    return outputs.find((output: { type: string }) => output.type === activeTab);
  };
  
  const activeOutput = getActiveOutput();
  
  // Handle sharing outputs
  const handleShare = () => {
    toast({
      title: "Coming Soon",
      description: "Sharing functionality will be available in a future update.",
    });
  };
  
  // Handle exporting all outputs
  const handleExportAll = () => {
    toast({
      title: "Coming Soon",
      description: "Export functionality will be available in a future update.",
    });
  };

  return (
    <div className="w-full lg:w-1/2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
      {/* Output Header */}
      <div className="bg-[#2A9D8F] text-white p-4">
        <h2 className="font-semibold text-lg">Generated Outputs</h2>
        <p className="text-sm text-neutral-100 mt-1">
          Review and refine these documents based on our conversation
        </p>
      </div>

      {/* Tab Navigation */}
      <OutputTabs 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />

      {/* Tab Content */}
      <div 
        className="flex-1 overflow-y-auto p-4 scrollbar-hide" 
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {!isContentMounted || isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === "implementation" && (
              <div key="implementation">
                <ImplementationPlan 
                  output={activeOutput} 
                  sessionState={sessionState}
                  isLoading={isLoading} 
                />
              </div>
            )}
            
            {activeTab === "cost" && (
              <div key="cost">
                <CostEstimate 
                  output={activeOutput} 
                  sessionState={sessionState}
                  isLoading={isLoading} 
                />
              </div>
            )}
            
            {activeTab === "design" && (
              <div key="design">
                <DesignConcept 
                  output={activeOutput} 
                  sessionState={sessionState}
                  isLoading={isLoading} 
                />
              </div>
            )}
            
            {activeTab === "business-case" && (
              <div key="business-case">
                <BusinessCase 
                  output={activeOutput} 
                  sessionState={sessionState}
                  isLoading={isLoading} 
                />
              </div>
            )}
            
            {activeTab === "ai-considerations" && (
              <div key="ai-considerations">
                <AIConsiderations 
                  output={activeOutput} 
                  sessionState={sessionState}
                  isLoading={isLoading} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions Footer */}
      <div className="border-t border-neutral-200 p-3 flex justify-between">
        <div>
          <Button
            onClick={onRegenerateOutputs}
            disabled={isGenerating || isLoading || !sessionState.isComplete}
            variant="outline"
            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerate
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleExportAll}
            className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>
    </div>
  );
}
