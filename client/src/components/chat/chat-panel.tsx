import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import { Send, Trash2, Bot, User, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';


interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onActionButtonClick?: (action: string) => void;
}

const ChatMessage = ({ message, isLast, onActionButtonClick }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  // Check if message contains action buttons
  const hasActionButtons = message.content.includes('**SHOW_BUTTONS:');
  let displayContent = message.content;
  let actionButtons: string[] = [];
  
  if (hasActionButtons) {
    const buttonMatch = message.content.match(/\*\*SHOW_BUTTONS:(.*?)\*\*/);
    if (buttonMatch) {
      actionButtons = buttonMatch[1].split(',').map(btn => btn.trim());
      displayContent = message.content.replace(/\*\*SHOW_BUTTONS:.*?\*\*/, '').trim();
    }
  }
  
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
          {displayContent}
        </div>
        {actionButtons.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actionButtons.map((buttonText, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onActionButtonClick?.(buttonText)}
                className="text-xs"
              >
                {buttonText}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  currentProject?: any;
  onEditProject?: (e: React.MouseEvent, projectId: string) => void;
  onActionButtonClick?: (action: string) => void;
}

export function ChatPanel({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onClearChat,
  currentProject,
  onEditProject,
  onActionButtonClick
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
  
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="py-3 px-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium">Chat with your AI Buddy</h3>
            {currentProject && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>•</span>
                <span className="font-medium">{currentProject.name}</span>
                {onEditProject && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-70 hover:opacity-100 hover:bg-blue-50 hover:text-blue-500"
                    onClick={(e) => onEditProject(e, currentProject.id.toString())}
                    title="Edit project"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearChat}
            className="text-xs h-7"
          >
            Clear Chat
          </Button>
        </div>
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
                    isLast={i === messages.length - 1}
                    onActionButtonClick={onActionButtonClick}
                  />
                ))}
                
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