import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from "uuid";
import {
  MessageCircle,
  Send,
  Bot,
  Sparkles,
  BarChart,
  Code,
  Lightbulb,
  PieChart,
  AlertTriangle,
  Computer,
  ChevronRight
} from "lucide-react";

interface Message {
  id: number;
  content: string;
  role: "assistant" | "user" | "system";
  created: string;
  sessionId: string;
}

interface OutputDocument {
  id: number;
  sessionId: string;
  type: string;
  content: any;
  created: string;
}

interface SessionState {
  id: string;
  userId: number;
  projectId: number | null;
  state: {
    topic?: string;
    businessProblem?: string;
    targetAudience?: string;
    currentStage?: string;
    existingSolutions?: string;
    keyRequirements?: string[];
    dataType?: string;
    budget?: string;
    timeline?: string;
    successMetrics?: string[];
  };
  created: string;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGeneratingOutput, setIsGeneratingOutput] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  // Create or get existing session on component mount
  useEffect(() => {
    if (user) {
      const newSessionId = uuidv4();
      
      const defaultSessionState: SessionState = {
        id: newSessionId,
        userId: user.id,
        projectId: null,
        state: {
          currentStage: 'initial'
        },
        created: new Date().toISOString()
      };
      
      // Create a new session
      apiRequest('POST', '/api/sessions', defaultSessionState)
        .then(response => response.json())
        .then(session => {
          setSessionId(session.id);
          // Add system message automatically
          const systemMessage = {
            content: "Hello! I'm your Digital Village AI Buddy. I'll help you explore and design digital solutions for your business needs. Would you like to automate your business processes or leverage your business data?",
            role: "assistant",
            sessionId: session.id
          };
          return apiRequest('POST', '/api/messages', systemMessage);
        })
        .catch(error => {
          console.error("Error creating session:", error);
          toast({
            title: "Error",
            description: "Failed to initialize your AI conversation. Please try again.",
            variant: "destructive"
          });
        });
    }
  }, [user]);

  // Fetch messages for current session
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await apiRequest('GET', `/api/messages?sessionId=${sessionId}`);
      return response.json();
    },
    enabled: !!sessionId
  });

  // Fetch session data
  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await apiRequest('GET', `/api/sessions/${sessionId}`);
      return response.json();
    },
    enabled: !!sessionId
  });

  // Fetch outputs for current session
  const { data: outputs = [], isLoading: isLoadingOutputs } = useQuery({
    queryKey: ['/api/outputs', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await apiRequest('GET', `/api/outputs?sessionId=${sessionId}`);
      return response.json();
    },
    enabled: !!sessionId
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { content: string; role: string; sessionId: string }) => {
      const response = await apiRequest('POST', '/api/messages', message);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', sessionId] });
      // Get AI response after sending message
      getAIResponseMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for getting AI response
  const getAIResponseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/chat/${sessionId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });
      
      // Check if we should generate outputs based on the AI response
      if (data.shouldGenerateOutputs) {
        generateOutputsMutation.mutate();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for generating outputs
  const generateOutputsMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingOutput(true);
      const response = await apiRequest('POST', `/api/generate-outputs/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      setIsGeneratingOutput(false);
      queryClient.invalidateQueries({ queryKey: ['/api/outputs', sessionId] });
      toast({
        title: "Success",
        description: "Solution outputs have been generated!",
      });
    },
    onError: (error: Error) => {
      setIsGeneratingOutput(false);
      toast({
        title: "Error",
        description: "Failed to generate outputs. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !sessionId) return;

    sendMessageMutation.mutate({
      content: messageInput,
      role: "user",
      sessionId: sessionId
    });

    setMessageInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!sessionId) return;

    sendMessageMutation.mutate({
      content: suggestion,
      role: "user",
      sessionId: sessionId
    });
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case "implementation_plan":
        return <Code className="h-5 w-5" />;
      case "cost_estimate":
        return <BarChart className="h-5 w-5" />;
      case "design_concept":
        return <Lightbulb className="h-5 w-5" />;
      case "business_case":
        return <PieChart className="h-5 w-5" />;
      case "ai_considerations":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Computer className="h-5 w-5" />;
    }
  };

  const formatOutputType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add a loading state while resources are being initialized
  if (!sessionId || isLoadingMessages || isLoadingSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading your AI Buddy...</span>
        </div>
      </div>
    );
  }

  const renderOutputContent = (output: OutputDocument) => {
    if (!output || !output.content) return null;
    
    try {
      const content = typeof output.content === 'string' 
        ? JSON.parse(output.content) 
        : output.content;
      
      switch (output.type) {
        case "implementation_plan":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Solution Architecture</h3>
              <p>{content.architecture}</p>
              
              <h3 className="text-lg font-semibold">Technical Components</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.components.map((component: string, idx: number) => (
                  <li key={idx}>{component}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold">Implementation Timeline</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.timeline.map((item: {phase: string, description: string}, idx: number) => (
                  <li key={idx}><span className="font-medium">{item.phase}:</span> {item.description}</li>
                ))}
              </ul>
            </div>
          );
          
        case "cost_estimate":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.breakdown.map((item: {category: string, estimate: string}, idx: number) => (
                  <li key={idx}><span className="font-medium">{item.category}:</span> {item.estimate}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold">Total Estimated Cost</h3>
              <p className="text-xl font-bold">{content.totalEstimate}</p>
              
              <h3 className="text-lg font-semibold">Cost-Saving Opportunities</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.costSavingOpportunities.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          );
          
        case "design_concept":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Experience Flow</h3>
              <p>{content.userExperience}</p>
              
              <h3 className="text-lg font-semibold">Key Interface Elements</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.interfaceElements.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold">Design Principles</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.designPrinciples.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          );
          
        case "business_case":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Value</h3>
              <p>{content.businessValue}</p>
              
              <h3 className="text-lg font-semibold">ROI Metrics</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.roi.map((item: {metric: string, impact: string}, idx: number) => (
                  <li key={idx}><span className="font-medium">{item.metric}:</span> {item.impact}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold">Strategic Alignment</h3>
              <p>{content.strategicAlignment}</p>
            </div>
          );
          
        case "ai_considerations":
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ethical Considerations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.ethical.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold">Technical Challenges</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.technical.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold">Governance Requirements</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.governance.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          );
          
        default:
          return <pre className="text-sm overflow-auto p-4 bg-gray-50 rounded-md">{JSON.stringify(content, null, 2)}</pre>;
      }
    } catch (error) {
      console.error("Error rendering output:", error);
      return <p className="text-red-500">Error displaying content</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-primary/5 border-b">
              <h2 className="text-lg font-medium flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                AI Buddy Conversation
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: Message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-1 text-xs text-gray-500">
                        <Bot className="w-3 h-3 mr-1" />
                        AI Buddy
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {getAIResponseMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested conversation starters */}
            {messages.length <= 2 && (
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Try one of these conversation starters:</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="justify-start text-left border-gray-200 hover:border-primary/50"
                    onClick={() => handleSuggestionClick("I want to automate my business processes")}
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    Automate my business processes
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left border-gray-200 hover:border-primary/50"
                    onClick={() => handleSuggestionClick("I want to leverage my business data")}
                  >
                    <BarChart className="w-4 h-4 mr-2 text-primary" />
                    Leverage my business data
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Message input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={getAIResponseMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!messageInput.trim() || getAIResponseMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </div>
        
        {/* Output Section */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="overflow-hidden flex flex-col">
            <div className="p-4 bg-primary/5 border-b">
              <h2 className="text-lg font-medium flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Solution Outputs
              </h2>
            </div>
            
            {isGeneratingOutput ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Generating solution outputs...</p>
                  <p className="text-xs text-gray-400 mt-2">This might take a moment</p>
                </div>
              </div>
            ) : outputs && outputs.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-1">
                  {outputs.map((output: OutputDocument) => (
                    <Button
                      key={output.id}
                      variant={selectedTab === output.type ? "default" : "ghost"}
                      className="w-full justify-start mb-1"
                      onClick={() => setSelectedTab(output.type)}
                    >
                      {getOutputIcon(output.type)}
                      <span className="ml-2">{formatOutputType(output.type)}</span>
                    </Button>
                  ))}
                </div>
                <div className="p-4 border-t">
                  {selectedTab ? (
                    <div className="prose prose-sm max-w-none">
                      {renderOutputContent(
                        outputs.find((o: OutputDocument) => o.type === selectedTab)
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Select an output to view details</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No outputs yet</h3>
                  <p className="text-gray-500 mb-4">
                    Continue your conversation with the AI Buddy to generate solution outputs
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}