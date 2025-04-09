import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { AIConfig } from "@shared/schema";

type OutputArea = "implementation" | "cost" | "design" | "business" | "ai";

interface OutputConfigSection {
  title: string;
  description: string;
  configKey: OutputArea;
  examplePrompt: string;
}

const outputSections: OutputConfigSection[] = [
  {
    title: "Implementation Plan",
    description: "Configure how AI generates implementation plans based on session data",
    configKey: "implementation",
    examplePrompt: "Outline a comprehensive implementation plan for the user's AI solution, including phases, technologies, and team requirements"
  },
  {
    title: "Cost Estimate",
    description: "Configure how AI generates cost estimates and ROI calculations",
    configKey: "cost",
    examplePrompt: "Provide a detailed cost breakdown for development, infrastructure, and maintenance of the proposed AI solution"
  },
  {
    title: "Design Concept",
    description: "Configure how AI generates UI/UX designs and wireframes",
    configKey: "design",
    examplePrompt: "Create wireframes and design concepts that illustrate the key user flows and interfaces of the proposed solution"
  },
  {
    title: "Business Case",
    description: "Configure how AI evaluates business value and ROI",
    configKey: "business",
    examplePrompt: "Analyze the business case for this AI solution, including expected ROI, market potential, and competitive advantages"
  },
  {
    title: "AI Considerations",
    description: "Configure how AI evaluates ethical concerns and limitations",
    configKey: "ai",
    examplePrompt: "Evaluate the ethical considerations, data privacy implications, and potential limitations of the proposed AI solution"
  }
];

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<OutputArea>("implementation");
  const [configValues, setConfigValues] = useState<Record<OutputArea, string>>({
    implementation: "",
    cost: "",
    design: "",
    business: "",
    ai: ""
  });

  // Fetch AI Configuration
  const { data: aiConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["/api/admin/ai-config"],
  });

  // Handle the data when it changes
  useEffect(() => {
    if (aiConfig) {
      // Initialize config values from fetched data
      const newConfigValues = { ...configValues };
      Object.keys(newConfigValues).forEach(key => {
        const configKey = key as OutputArea;
        const value = aiConfig[configKey as keyof typeof aiConfig];
        if (value && typeof value === 'string') {
          newConfigValues[configKey] = value;
        }
      });
      setConfigValues(newConfigValues);
    }
  }, [aiConfig, configValues]);

  // Save configuration changes
  const saveMutation = useMutation({
    mutationFn: async (configData: Record<OutputArea, string>) => {
      const res = await apiRequest("POST", "/api/admin/update-ai-config", configData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "AI settings have been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-config"] });
    },
    onError: () => {
      toast({
        title: "Failed to save configuration",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  });

  const handleSaveConfig = () => {
    saveMutation.mutate(configValues);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/admin");
      }
    });
  };

  const handleConfigChange = (configKey: OutputArea, value: string) => {
    setConfigValues(prev => ({
      ...prev,
      [configKey]: value
    }));
  };

  // If user is not authenticated, redirect to admin login
  if (!user) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-light-blue">
      <header className="sticky top-0 z-50 w-full bg-white border-b">
        <div className="flex h-16 items-center justify-between px-6 md:px-8 max-w-[1440px] mx-auto">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white text-xs font-medium">DV</span>
              </div>
              <span className="text-base font-medium">
                Digital Village AI Buddy
              </span>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                Admin Portal
              </span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-4">
              Logged in as <span className="font-medium">{user.username}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container max-w-[1280px] mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI Configuration Dashboard</h1>
            <p className="text-muted-foreground">
              Customize how AI generates different output components for users
            </p>
          </div>
          <Button 
            onClick={handleSaveConfig} 
            disabled={saveMutation.isPending}
            className="flex items-center"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Global AI Configuration
            </CardTitle>
            <CardDescription>
              Configure the overall behavior and rules for the AI across all outputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConfig ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    System Prompt
                  </label>
                  <Textarea 
                    placeholder="Enter the master system prompt that guides all AI interactions"
                    className="min-h-[100px]"
                    value={aiConfig && typeof aiConfig === 'object' && 'systemPrompt' in aiConfig 
                      ? String(aiConfig.systemPrompt) 
                      : ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    To change the system prompt, please contact your system administrator.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Global Rules
                  </label>
                  <Textarea 
                    placeholder="Enter rules that apply to all AI outputs"
                    className="min-h-[100px]"
                    value={aiConfig && typeof aiConfig === 'object' && 'rules' in aiConfig && Array.isArray(aiConfig.rules)
                      ? aiConfig.rules.join('\n')
                      : ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Global rules are managed by your system administrator.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Output Configurations</h2>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OutputArea)} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              {outputSections.map(section => (
                <TabsTrigger key={section.configKey} value={section.configKey}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {outputSections.map(section => (
              <TabsContent key={section.configKey} value={section.configKey}>
                <Card>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Prompt Template
                        </label>
                        <Textarea 
                          placeholder={section.examplePrompt}
                          className="min-h-[200px]"
                          value={configValues[section.configKey]}
                          onChange={(e) => handleConfigChange(section.configKey, e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Use this template to guide how the AI generates {section.title.toLowerCase()}. 
                          Include specific instructions, tone guidelines, and required elements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      
      <footer className="py-4 px-6 text-center border-t bg-white">
        <div className="container mx-auto text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Digital Village AI Buddy | Admin Portal</p>
        </div>
      </footer>
    </div>
  );
}