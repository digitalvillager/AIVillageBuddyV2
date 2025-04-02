import React from "react";
import { Badge } from "@/components/ui/badge";

interface SuggestionTagsProps {
  onSelect: (suggestion: string) => void;
  visible: boolean;
}

export function SuggestionTags({ onSelect, visible }: SuggestionTagsProps) {
  if (!visible) return null;

  const suggestions = [
    "Automate business processes",
    "Leverage my business data",
    "Improve customer experience",
    "Enhance decision making"
  ];

  return (
    <div className="flex flex-col space-y-4 mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <p className="text-sm font-medium text-primary-foreground bg-primary px-3 py-2 rounded-md inline-block">
        Choose a starting point or type your own question:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Badge 
            key={suggestion} 
            variant="secondary" 
            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border border-primary/30 shadow-sm"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}