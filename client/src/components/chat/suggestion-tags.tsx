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
    <div className="mb-6">
      <div className="bg-primary text-white p-3 rounded-md mb-3">
        <p className="text-sm">Choose a starting point or type your own question:</p>
      </div>
      <div className="flex flex-col space-y-2">
        {suggestions.map((suggestion) => (
          <Badge 
            key={suggestion} 
            variant="outline" 
            className="px-4 py-3 text-sm cursor-pointer hover:bg-primary/10 transition-colors bg-white rounded-full border border-gray-200 font-normal shadow-sm w-fit"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}