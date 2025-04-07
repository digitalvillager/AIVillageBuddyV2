import React from "react";
import { OutputType } from "@/types";

interface OutputTabsProps {
  activeTab: OutputType;
  onTabChange: (tab: OutputType) => void;
}

export function OutputTabs({ activeTab, onTabChange }: OutputTabsProps) {
  const tabs: { id: OutputType; label: string }[] = [
    { id: "implementation", label: "Implementation Plan" },
    { id: "cost", label: "Cost Estimate" },
    { id: "design", label: "Design Concept" },
    { id: "business", label: "Business Case" },
    { id: "ai", label: "AI Considerations" },
  ];

  return (
    <div className="border-b border-neutral-200">
      <nav className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-3 font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-600 hover:text-primary"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
