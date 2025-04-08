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
    className="p-3 bg-card rounded-md border border-border shadow-sm hover:bg-accent hover:border-primary cursor-pointer transition-all transform hover:scale-105 text-center"
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
      "py-3",
      isLast ? '' : 'border-b border-gray-100'
    )}>
      <div className="flex gap-2 items-start">
        <div className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center text-xs",
          isUser ? "bg-blue-100 text-blue-500" : "bg-primary text-white"
        )}>
          {isUser ? (
            <span>You</span>
          ) : (
            <span>AI</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isUser ? 'You' : 'AI Buddy'}
          </p>
        </div>
      </div>
      <div className="pl-8 pr-2 mt-1">
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
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
  showSuggestions?: boolean;
}

export function ChatPanel({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onClearChat,
  showSuggestions = false
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="py-3 px-4 border-b flex justify-between items-center">
        <h3 className="text-base font-medium">Chat with your AI Buddy</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearChat}
          className="text-xs h-7"
        >
          Clear Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length > 0 ? (
              <>
                {messages.map((message, i) => (
                  <ChatMessage 
                    key={i} 
                    message={message} 
                    isLast={i === messages.length - 1 && !showSuggestions} 
                  />
                ))}
                
                {/* Show suggestion tags after messages when showSuggestions is true */}
                {showSuggestions && (
                  <div className="pt-4 mt-4">
                    <p className="text-sm mb-3">Choose a starting point or type your own question:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <SuggestionTag 
                        text="Automate business processes" 
                        onClick={handleSuggestionClick} 
                      />
                      <SuggestionTag 
                        text="Leverage my business data" 
                        onClick={handleSuggestionClick} 
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col py-6">
                <div className="mb-4 flex justify-center">
                  <Bot className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-center">
                  Start a Conversation
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Chat with your AI Buddy to explore how to create a digital solution for your business needs.
                </p>
                
                <div className="grid grid-cols-2 gap-3 px-2">
                  <SuggestionTag 
                    text="Automate business processes" 
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
      </div>
      
      <div className="p-3 border-t">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="min-h-[40px]"
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
            className="h-10 w-10 rounded-full bg-primary text-white"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}