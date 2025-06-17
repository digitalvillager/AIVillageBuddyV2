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
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<OutputType>("implementation");
  const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
  const [showSolutionSuggestions, setShowSolutionSuggestions] = useState(false);
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

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });

  // Initialize session or load existing session
  useEffect(() => {
    const initSession = async () => {

      // Check for existing project in localStorage
      const savedProjectId = localStorage.getItem('projectId');
      if (savedProjectId) {
        setProjectId(savedProjectId);
      }

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
            } else {
              // Check if it's just the welcome message or if the user has already chatted
              // If only 1 message (assistant welcome), show suggestions
              setMessages(messagesData);
              if (messagesData.length === 1 && messagesData[0]?.role === 'assistant') {
                // If only welcome message exists, show suggestions
                setShowSolutionSuggestions(true);
              } else {
                // For existing conversations with history, hide suggestions
                setShowSolutionSuggestions(false);
              }
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
      
      // Set showSolutionSuggestions to true for new sessions
      setShowSolutionSuggestions(true);
      
      // Initialize the session in the database
      try {
        await apiRequest('POST', '/api/sessions', { id: newSessionId });
        
        // Add initial greeting message
        const response = await apiRequest('POST', '/api/messages', {
          sessionId: newSessionId,
          role: 'assistant',
          content: "Hello! I'm your AI Buddy from Digital Village. I'm here to help you refine your AI solution idea for your business.\n\nChoose a starting point or type your own question:"
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
        sessionId,
        projectId
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
        content: "Hello! I'm your AI Buddy from Digital Village. I'm here to help you refine your AI solution idea for your business.\n\nChoose a starting point or type your own question:"
      });
      
      const initialMessage = await response.json();
      
      // Update state
      setSessionId(newSessionId);
      setMessages([initialMessage]);
      // Show solution suggestions for new/cleared sessions
      setShowSolutionSuggestions(true);
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
    
    // Hide solution suggestions after a message is sent
    if (showSolutionSuggestions) {
      setShowSolutionSuggestions(false);
    }
    
    sendMessageMutation.mutate({ content });
  };

  // Regenerate outputs
  const handleRegenerateOutputs = () => {
    generateOutputsMutation.mutate();
  };
  
  // Function to load a specific project's session

  const loadProjectSession = async (projectId: string) => {
    try {
      setLoading(true);

      console.log("loadProjectSession projectId:");
      console.log(projectId);

      setProjectId(projectId);
      localStorage.setItem('projectId', projectId);
      
      // Fetch the project details first
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const project = await projectResponse.json();
      
      // Get the latest session ID for this project, or create a new one
      let sessionToLoad = project.sessions && project.sessions.length > 0 
        ? project.sessions[project.sessions.length - 1]
        : null;
      
      let isNewSession = false;
      
      if (!sessionToLoad) {
        isNewSession = true;
        // Create a new session for this project if none exists
        const newSessionResponse = await apiRequest('POST', '/api/sessions', { 
          projectId: Number(projectId)
        });
        
        if (!newSessionResponse.ok) {
          throw new Error('Failed to create new session for project');
        }
        
        const newSession = await newSessionResponse.json();
        sessionToLoad = newSession.id;
        
        // Add initial greeting message
        await apiRequest('POST', '/api/messages', {
          sessionId: sessionToLoad,
          role: 'assistant',
          content: `Welcome to your project "${project.name}". What would you like to focus on for your AI solution?`
        });
      }
      
      // Update local storage with the new session ID
      localStorage.setItem('sessionId', sessionToLoad);
      
      // Update state with the new session ID
      setSessionId(sessionToLoad);
      
      // Show solution type suggestions for new sessions
      setShowSolutionSuggestions(isNewSession);
      
      // Invalidate queries to reload data
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/outputs'] });
      
      toast({
        title: "Project Loaded",
        description: `Switched to project: ${project.name}`,
      });
      
    } catch (error) {
      console.error('Failed to load project session:', error);
      toast({
        title: "Error",
        description: "Failed to load the selected project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a loading state while resources are being initialized
  if (isLoadingProjects || (!sessionId && (isLoadingMessages || isLoadingSession))) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light-blue">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading your AI Buddy...</span>
        </div>
      </div>
    );
  }

  // Show create project view if no projects exist
  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light-blue">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome to AI Village Buddy</CardTitle>
              <CardDescription>
                Create your first project to start exploring AI solutions for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-primary/10 rounded-full p-6 mb-6">
                  <Plus className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Create your first AI solution project to start exploring possibilities for your business.
                </p>
                <Link to="/projects/new">
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create your first project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light-blue">
        <Header />
        
        <main className="flex-1 flex flex-col relative">
          {/* Projects panel (collapsible sidebar) */}
          <div className={`
            fixed z-20 top-16 bottom-0 left-0 bg-white shadow-md transition-all duration-300
            ${isProjectsPanelOpen ? 'w-72' : 'w-0'}
          `}>
            <div className="h-full overflow-hidden">
              <ErrorBoundary>
                <ProjectsPanel 
                  currentProjectId={sessionId}
                  onSelectProject={loadProjectSession}
                />
              </ErrorBoundary>
            </div>
          </div>
          
          {/* Main content area - shifts right when sidebar is open */}
          <div 
            className={`
              transition-all duration-300 h-full relative flex justify-center
              ${isProjectsPanelOpen ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-0 w-full'}
            `}
          >
            {/* Projects toggle button */}
            <Button 
              variant="outline" 
              size="icon" 
              className={`
                absolute h-8 w-8 bg-white shadow-sm rounded-full z-20
                transition-all duration-300
                left-6 md:left-8 top-6 md:top-8
              `}
              onClick={() => setIsProjectsPanelOpen(!isProjectsPanelOpen)}
            >
              {isProjectsPanelOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {/* Centered container aligned with header */}
            <div className="w-full max-w-[1280px] px-6 md:px-8 py-4">
              {/* Main 2-panel layout */}
              <div className={`
                grid w-full h-[calc(100vh-8rem)] gap-6 md:gap-8 pt-14 md:pt-16
                ${isProjectsPanelOpen 
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1 md:grid-cols-2'
                }
              `}>
                {/* Chat Panel */}
                <div className="bg-white rounded-md border shadow-sm overflow-hidden h-full">
                  <ErrorBoundary>
                    <ChatPanel 
                      messages={messages}
                      isLoading={loading || isLoadingMessages}
                      onSendMessage={handleSendMessage}
                      onClearChat={clearConversation}
                      showSuggestions={showSolutionSuggestions}
                    />
                  </ErrorBoundary>
                </div>
                
                {/* Output Panel */}
                <div className="bg-white rounded-md border shadow-sm overflow-hidden h-full">
                  <ErrorBoundary>
                    <OutputPanel 
                      sessionId={sessionId}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      onRegenerateOutputs={handleRegenerateOutputs}
                      isGenerating={generateOutputsMutation.isPending}
                      sessionState={sessionState}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error rendering Home component:", error);
    return (
      <div className="min-h-screen flex flex-col bg-bg-light-blue">
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
      </div>
    );
  }
}
