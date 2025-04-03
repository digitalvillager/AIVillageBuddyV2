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
      <div className="status-card status-card-blue mb-3" 
           style={{ borderRadius: 'var(--border-radius-sm)' }}>
        <p className="text-sm">Choose a starting point or type your own question:</p>
      </div>
      <div className="flex flex-col space-y-2">
        {suggestions.map((suggestion) => (
          <Badge 
            key={suggestion} 
            variant="outline" 
            className="dashboard-card px-4 py-3 text-sm cursor-pointer hover:bg-primary/10 transition-colors w-fit"
            style={{ 
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}