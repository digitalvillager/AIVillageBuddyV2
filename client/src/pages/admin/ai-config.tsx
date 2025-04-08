
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIConfiguration } from "@shared/schema";

export default function AIConfigPage() {
  const [config, setConfig] = useState<AIConfiguration>({
    systemPrompt: '',
    temperature: 0.7,
    rules: [],
    industries: [],
    recommendationGuidelines: [],
    teamRoles: [],
    companyContext: {
      pricing: {
        hourlyRates: {},
        standardPackages: []
      },
      recommendations: [],
      bestPractices: []
    }
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

  const addTeamRole = () => {
    setConfig({
      ...config,
      teamRoles: [...config.teamRoles, { title: '', rate: 0, description: '' }]
    });
  };

  const addPackage = () => {
    setConfig({
      ...config,
      companyContext: {
        ...config.companyContext,
        pricing: {
          ...config.companyContext.pricing,
          standardPackages: [...config.companyContext.pricing.standardPackages, {
            name: '',
            description: '',
            price: 0
          }]
        }
      }
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Configuration</h1>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team Roles</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">System Prompt</label>
                <Textarea 
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                  className="min-h-[200px]"
                />
              </div>
              
              <div>
                <label className="block mb-2">Temperature</label>
                <Input 
                  type="number" 
                  min={0} 
                  max={2} 
                  step={0.1}
                  value={config.temperature}
                  onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Team Roles</h2>
            <div className="space-y-4">
              {config.teamRoles.map((role, index) => (
                <div key={index} className="p-4 border rounded">
                  <Input 
                    placeholder="Role Title"
                    value={role.title}
                    onChange={(e) => {
                      const newRoles = [...config.teamRoles];
                      newRoles[index].title = e.target.value;
                      setConfig({...config, teamRoles: newRoles});
                    }}
                    className="mb-2"
                  />
                  <Input 
                    type="number"
                    placeholder="Hourly Rate"
                    value={role.rate}
                    onChange={(e) => {
                      const newRoles = [...config.teamRoles];
                      newRoles[index].rate = parseInt(e.target.value);
                      setConfig({...config, teamRoles: newRoles});
                    }}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Role Description"
                    value={role.description}
                    onChange={(e) => {
                      const newRoles = [...config.teamRoles];
                      newRoles[index].description = e.target.value;
                      setConfig({...config, teamRoles: newRoles});
                    }}
                  />
                </div>
              ))}
              <Button onClick={addTeamRole}>Add Role</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing Packages</h2>
            <div className="space-y-4">
              {config.companyContext.pricing.standardPackages.map((pkg, index) => (
                <div key={index} className="p-4 border rounded">
                  <Input 
                    placeholder="Package Name"
                    value={pkg.name}
                    onChange={(e) => {
                      const newPackages = [...config.companyContext.pricing.standardPackages];
                      newPackages[index].name = e.target.value;
                      setConfig({
                        ...config,
                        companyContext: {
                          ...config.companyContext,
                          pricing: {
                            ...config.companyContext.pricing,
                            standardPackages: newPackages
                          }
                        }
                      });
                    }}
                    className="mb-2"
                  />
                  <Input 
                    type="number"
                    placeholder="Price"
                    value={pkg.price}
                    onChange={(e) => {
                      const newPackages = [...config.companyContext.pricing.standardPackages];
                      newPackages[index].price = parseInt(e.target.value);
                      setConfig({
                        ...config,
                        companyContext: {
                          ...config.companyContext,
                          pricing: {
                            ...config.companyContext.pricing,
                            standardPackages: newPackages
                          }
                        }
                      });
                    }}
                    className="mb-2"
                  />
                  <Textarea 
                    placeholder="Package Description"
                    value={pkg.description}
                    onChange={(e) => {
                      const newPackages = [...config.companyContext.pricing.standardPackages];
                      newPackages[index].description = e.target.value;
                      setConfig({
                        ...config,
                        companyContext: {
                          ...config.companyContext,
                          pricing: {
                            ...config.companyContext.pricing,
                            standardPackages: newPackages
                          }
                        }
                      });
                    }}
                  />
                </div>
              ))}
              <Button onClick={addPackage}>Add Package</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Company Recommendations</h2>
            <div className="space-y-4">
              <Textarea 
                placeholder="Best Practices (one per line)"
                value={config.companyContext.bestPractices.join('\n')}
                onChange={(e) => setConfig({
                  ...config,
                  companyContext: {
                    ...config.companyContext,
                    bestPractices: e.target.value.split('\n').filter(line => line.trim())
                  }
                })}
                className="min-h-[200px] mb-4"
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="mt-6">
        Save Configuration
      </Button>
    </div>
  );
}
