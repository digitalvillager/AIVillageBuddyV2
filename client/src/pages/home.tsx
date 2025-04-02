import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatPanel } from "@/components/chat/chat-panel";
import { OutputPanel } from "@/components/output/output-panel";
import { useToast } from "@/hooks/use-toast";
import { Message, OutputType, SessionState } from "@/types";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { nanoid } from 'nanoid';

export default function Home() {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<OutputType>("implementation");
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
      } else {
        // Create new session
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
      }
    };
    
    initSession();
  }, [toast]);

  // Fetch messages when sessionId changes
  const { data: fetchedMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/messages', sessionId],
    enabled: !!sessionId,
    onSuccess: (data) => {
      setMessages(data);
    },
    onError: (error) => {
      console.error('Failed to fetch messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history.",
        variant: "destructive"
      });
    }
  });

  // Fetch session state
  const { data: fetchedSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    onSuccess: (data) => {
      setSessionState(data);
    },
    onError: (error) => {
      console.error('Failed to fetch session data:', error);
    }
  });

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
    onSuccess: (aiResponse) => {
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
      
      // Refresh session state
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });
      
      // Generate outputs if needed
      if (aiResponse.generateOutputs) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:py-6 flex flex-col lg:flex-row gap-4 md:gap-6">
        <ChatPanel 
          messages={messages}
          isLoading={loading || isLoadingMessages}
          onSendMessage={handleSendMessage}
          onClearChat={clearConversation}
        />
        
        <OutputPanel 
          sessionId={sessionId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRegenerateOutputs={handleRegenerateOutputs}
          isGenerating={generateOutputsMutation.isPending}
          sessionState={sessionState}
        />
      </main>
      
      <Footer />
    </div>
  );
}
