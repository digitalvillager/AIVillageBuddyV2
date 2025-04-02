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
    "Leverage my business data"
  ];

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="bg-primary text-white p-4 rounded-md">
        <p className="text-sm">Choose a starting point or type your own question:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Badge 
            key={suggestion} 
            variant="outline" 
            className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors bg-white"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}