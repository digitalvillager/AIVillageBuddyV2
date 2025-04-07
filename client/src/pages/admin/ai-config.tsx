
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AIConfiguration } from "@shared/schema";

export default function AIConfigPage() {
  const [config, setConfig] = useState<AIConfiguration>({
    systemPrompt: '',
    temperature: 0.7,
    rules: [],
    industries: [],
    recommendationGuidelines: []
  });

  const handleSave = async () => {
    try {
      await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Buddy Configuration</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Prompt</h2>
        <Textarea 
          value={config.systemPrompt}
          onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
          className="min-h-[200px] mb-4"
        />
        
        <h2 className="text-xl font-semibold mb-4">Temperature</h2>
        <Input 
          type="number" 
          min={0} 
          max={2} 
          step={0.1}
          value={config.temperature}
          onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
          className="mb-4"
        />

        <Button onClick={handleSave} className="mt-4">
          Save Configuration
        </Button>
      </Card>
    </div>
  );
}
