import React, { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, RefreshCw } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onClearChat: () => void;
}

export function ChatInput({ onSendMessage, isLoading, onClearChat }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-neutral-200 p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className="bg-primary hover:bg-primary-dark text-white rounded-full p-2 transition h-10 w-10"
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
      <div className="mt-2 text-xs text-neutral-500 flex justify-between px-2">
        <span>Press Enter to send</span>
        <button 
          onClick={onClearChat}
          className="text-primary hover:text-primary-dark transition"
          disabled={isLoading}
        >
          Clear conversation
        </button>
      </div>
    </div>
  );
}
