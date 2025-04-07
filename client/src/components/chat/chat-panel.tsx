import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import { Send, Trash2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionTagProps {
  text: string;
  onClick: (text: string) => void;
}

const SuggestionTag = ({ text, onClick }: SuggestionTagProps) => (
  <div 
    className="p-3 bg-card rounded-md border border-border shadow-sm hover:bg-accent cursor-pointer transition-colors"
    onClick={() => onClick(text)}
  >
    <p className="text-sm font-medium">{text}</p>
  </div>
);

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
}

const ChatMessage = ({ message, isLast }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 py-4",
      isLast ? '' : 'border-b border-border'
    )}>
      <Avatar className={cn(
        "h-8 w-8 rounded-md",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Avatar>
      <div className="flex-1 space-y-2">
        <p className="font-medium text-sm">
          {isUser ? 'You' : 'AI Buddy'}
        </p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
};

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
}

export function ChatPanel({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onClearChat 
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <Card className="w-full h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Chat with your AI Buddy</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClearChat}
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-1">
            {messages.length > 0 ? (
              messages.map((message, i) => (
                <ChatMessage 
                  key={i} 
                  message={message} 
                  isLast={i === messages.length - 1} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="mb-6">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Start a Conversation
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                  Chat with your AI Buddy to explore how to create a digital solution for your business needs.
                </p>
                
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <SuggestionTag 
                    text="Automate my business processes" 
                    onClick={handleSuggestionClick} 
                  />
                  <SuggestionTag 
                    text="Leverage my business data" 
                    onClick={handleSuggestionClick} 
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="min-h-[40px] max-h-[200px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}