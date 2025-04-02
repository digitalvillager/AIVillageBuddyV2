import React from "react";
import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === "assistant";

  if (isAI) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <i className="ri-robot-line text-white"></i>
        </div>
        <div className="bg-primary text-white p-3 rounded-lg rounded-tl-none max-w-[85%]">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-neutral-200 p-3 rounded-lg rounded-tr-none max-w-[85%]">
        <p>{message.content}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-neutral-400 flex items-center justify-center flex-shrink-0">
        <i className="ri-user-line text-white"></i>
      </div>
    </div>
  );
}
