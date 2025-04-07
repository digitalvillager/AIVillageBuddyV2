import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatPanel } from "@/components/chat/chat-panel";
import { OutputPanel } from "@/components/output/output-panel";
import { ProjectsPanel } from "@/components/projects/projects-panel";
import { useToast } from "@/hooks/use-toast";
import { Message, OutputType, SessionState } from "@/types";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { nanoid } from 'nanoid';
import ErrorBoundary from '@/components/error-boundary';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<OutputType>("implementation");
  const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>({
    id: "",
    industry: "",
    businessProblem: "",
    currentProcess: "",
    availableData: "",
    successMetrics: "",
    stakeholders: "",
    timeline: "",
    budget: "",
    isComplete: false
  });

  // Initialize session or load existing session
  useEffect(() => {
    const initSession = async () => {
      // Check for existing session in localStorage
      const savedSessionId = localStorage.getItem('sessionId');
      
      if (savedSessionId) {
        setSessionId(savedSessionId);
        
        // Check if there are messages for this session
        try {
          const response = await fetch(`/api/messages?sessionId=${savedSessionId}`);
          if (response.ok) {
            const messagesData = await response.json();
            if (!messagesData || !Array.isArray(messagesData) || messagesData.length === 0) {
              // If no messages, treat as a new session
              console.log("No messages found for saved session, starting fresh");
              localStorage.removeItem('sessionId');
              await createNewSession();
            }
          } else {
            console.error("Error fetching messages for saved session, starting fresh");
            localStorage.removeItem('sessionId');
            await createNewSession();
          }
        } catch (error) {
          console.error("Error checking session messages:", error);
          localStorage.removeItem('sessionId');
          await createNewSession();
        }
      } else {
        // Create new session
        await createNewSession();
      }
    };
    
    // Helper function to create a new session
    const createNewSession = async () => {
      const newSessionId = nanoid();
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
      
      // Initialize the session in the database
      try {
        await apiRequest('POST', '/api/sessions', { id: newSessionId });
        
        // Add initial greeting message
        const response = await apiRequest('POST', '/api/messages', {
          sessionId: newSessionId,
          role: 'assistant',
          content: "Hello! I'm your AI Buddy from Digital Village. I'm here to help you refine your AI solution idea for your business. Let's start with the basics - what business problem are you trying to solve with AI?"
        });
        
        const initialMessage = await response.json();
        setMessages([initialMessage]);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast({
          title: "Error",
          description: "Failed to initialize session. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    };
    
    initSession();
  }, [toast]);

  // Fetch messages when sessionId changes
  const { data: fetchedMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/messages', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/messages?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
  
  // Update messages when fetchedMessages changes
  useEffect(() => {
    if (fetchedMessages && Array.isArray(fetchedMessages)) {
      // Make sure we have valid Message objects
      const validMessages = fetchedMessages.filter(msg => 
        msg && typeof msg === 'object' && 
        'content' in msg && 
        'role' in msg
      );
      
      setMessages(validMessages as Message[]);
    }
  }, [fetchedMessages]);

  // Fetch session state
  const { data: fetchedSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
  
  // Update session state when fetchedSession changes
  useEffect(() => {
    if (fetchedSession) {
      const defaultSessionState: SessionState = {
        id: sessionId,
        industry: "",
        businessProblem: "",
        currentProcess: "",
        availableData: "",
        successMetrics: "",
        stakeholders: "",
        timeline: "",
        budget: "",
        isComplete: false
      };
      
      setSessionState({...defaultSessionState, ...fetchedSession});
    }
  }, [fetchedSession, sessionId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { content: string }) => {
      setLoading(true);
      const response = await apiRequest('POST', '/api/messages', {
        sessionId,
        role: 'user',
        content: message.content
      });
      return response.json();
    },
    onSuccess: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      
      // Trigger the AI response
      getAIResponseMutation.mutate();
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  });

  // Get AI response mutation
  const getAIResponseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chat/response', {
        sessionId
      });
      return response.json();
    },
    onSuccess: (data) => {
      // The API now returns an object with message, session, and outputs
      if (data.message) {
        console.log('AI response received:', data.message);
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.error('Received malformed response:', data);
        toast({
          title: "Warning",
          description: "Received an incomplete response from the AI. Some data may be missing.",
          variant: "default"
        });
      }
      
      // Update session state if present
      if (data.session) {
        setSessionState(prev => ({...prev, ...data.session}));
      }
      
      setLoading(false);
      
      // Refresh session state
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });
      
      // Generate outputs if needed
      if (data.generateOutputs) {
        generateOutputsMutation.mutate();
      }
    },
    onError: (error) => {
      console.error('Failed to get AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  });

  // Generate outputs mutation
  const generateOutputsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/outputs/generate', {
        sessionId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Output documents have been generated.",
      });
      // Invalidate outputs queries to reload the data
      queryClient.invalidateQueries({ queryKey: ['/api/outputs', sessionId] });
    },
    onError: (error) => {
      console.error('Failed to generate outputs:', error);
      toast({
        title: "Error",
        description: "Failed to generate output documents. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Clear conversation
  const clearConversation = async () => {
    try {
      // Create new session
      const newSessionId = nanoid();
      
      // Clear the old sessionId from localStorage and set the new one
      localStorage.removeItem('sessionId');
      localStorage.setItem('sessionId', newSessionId);
      
      // Initialize the session in the database
      await apiRequest('POST', '/api/sessions', { id: newSessionId });
      
      // Add initial greeting message
      const response = await apiRequest('POST', '/api/messages', {
        sessionId: newSessionId,
        role: 'assistant',
        content: "Hello! I'm your AI Buddy from Digital Village. I'm here to help you refine your AI solution idea for your business. Let's start with the basics - what business problem are you trying to solve with AI?"
      });
      
      const initialMessage = await response.json();
      
      // Update state
      setSessionId(newSessionId);
      setMessages([initialMessage]);
      setSessionState({
        id: newSessionId,
        industry: "",
        businessProblem: "",
        currentProcess: "",
        availableData: "",
        successMetrics: "",
        stakeholders: "",
        timeline: "",
        budget: "",
        isComplete: false
      });
      
      // Invalidate queries for the new session
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/outputs'] });
      
      toast({
        title: "Success",
        description: "Conversation has been cleared.",
      });
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    sendMessageMutation.mutate({ content });
  };

  // Regenerate outputs
  const handleRegenerateOutputs = () => {
    generateOutputsMutation.mutate();
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
        <Footer />
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto p-4 md:py-6 flex flex-col lg:flex-row gap-4 md:gap-6 relative">
          {/* Projects Panel - Hidden by default, toggleable */}
          <div className={`transition-all duration-300 ease-in-out ${isProjectsPanelOpen ? 'lg:w-1/4' : 'lg:w-0 overflow-hidden'}`}>
            <ErrorBoundary>
              {isProjectsPanelOpen && (
                <ProjectsPanel 
                  currentProjectId={sessionId}
                  onSelectProject={(projectId) => {
                    // Logic to switch to the selected project would go here
                    console.log(`Selected project: ${projectId}`);
                  }}
                />
              )}
            </ErrorBoundary>
          </div>
          
          {/* Toggle button for Projects Panel */}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-8 shadow-md z-10"
            onClick={() => setIsProjectsPanelOpen(!isProjectsPanelOpen)}
          >
            {isProjectsPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          {/* Main content area - Chat and Output panels side by side */}
          <div className={`transition-all duration-300 flex flex-col lg:flex-row gap-4 ${isProjectsPanelOpen ? 'lg:w-3/4' : 'lg:w-full'}`}>
            <ErrorBoundary>
              <div className="w-full lg:w-1/2">
                <ChatPanel 
                  messages={messages}
                  isLoading={loading || isLoadingMessages}
                  onSendMessage={handleSendMessage}
                  onClearChat={clearConversation}
                />
              </div>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <div className="w-full lg:w-1/2">
                <OutputPanel 
                  sessionId={sessionId}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onRegenerateOutputs={handleRegenerateOutputs}
                  isGenerating={generateOutputsMutation.isPending}
                  sessionState={sessionState}
                />
              </div>
            </ErrorBoundary>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error rendering Home component:", error);
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">We encountered an error loading your AI Buddy. Please try reloading the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
