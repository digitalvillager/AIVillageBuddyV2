import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Message } from "@/types";

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
}

export function ChatPanel({ messages, isLoading, onSendMessage, onClearChat }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-lg shadow overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary text-white p-4">
        <h2 className="font-semibold text-lg">AI Buddy Conversation</h2>
        <p className="text-sm text-neutral-100 mt-1">
          Let's refine your AI solution ideas together
        </p>
      </div>

      {/* Chat Messages List */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" 
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
          />
        ))}

        {/* Typing indicator when loading */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <i className="ri-robot-line text-white"></i>
            </div>
            <div className="bg-primary text-white p-3 rounded-lg rounded-tl-none max-w-[85%] animate-pulse">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <ChatInput 
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        onClearChat={onClearChat}
      />
    </div>
  );
}
