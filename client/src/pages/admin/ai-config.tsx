
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Check, RefreshCw, Trash2, Settings, List } from "lucide-react";
import { type AIConfig, type InsertAIConfiguration } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

export default function AIConfigPage() {
  const [activeTab, setActiveTab] = useState<string>("configurations");
  const [newRule, setNewRule] = useState<string>("");
  const [newIndustry, setNewIndustry] = useState<string>("");
  const [newGuideline, setNewGuideline] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState<boolean>(false);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initial config state for new configs
  const emptyConfig: InsertAIConfiguration = {
    name: "",
    systemPrompt: "",
    temperature: "0.7",
    rules: [],
    industries: [],
    recommendationGuidelines: [],
    isActive: false
  };

  const [newConfig, setNewConfig] = useState<InsertAIConfiguration>({...emptyConfig});
  const [editConfig, setEditConfig] = useState<AIConfig | null>(null);

  // Fetch all configurations
  const { data: configurations, isLoading, error } = useQuery<AIConfig[]>({
    queryKey: ['/api/admin/ai-config'],
    refetchOnWindowFocus: true,
  });

  // Fetch active configuration
  const { data: activeConfig } = useQuery<AIConfig>({
    queryKey: ['/api/admin/ai-config/active'],
    // Allow this query to fail silently if there's no active config
    retry: false,
  });

  // Create configuration mutation
  const createMutation = useMutation({
    mutationFn: (config: InsertAIConfiguration) => 
      apiRequest('POST', '/api/admin/ai-config', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] });
      toast({
        title: "Success",
        description: "Configuration created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewConfig({...emptyConfig});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create configuration: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  });

  // Update configuration mutation
  const updateMutation = useMutation({
    mutationFn: (config: AIConfig) => 
      apiRequest('PATCH', `/api/admin/ai-config/${config.id}`, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config/active'] });
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditConfig(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  });

  // Delete configuration mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/admin/ai-config/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] });
      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });
      setDeleteConfirmationOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete configuration: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  });

  // Activate configuration mutation
  const activateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('POST', `/api/admin/ai-config/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config/active'] });
      toast({
        title: "Success",
        description: "Configuration activated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to activate configuration: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  });

  // Form input handlers for new configuration
  const handleAddRule = () => {
    if (newRule.trim()) {
      setNewConfig({
        ...newConfig,
        rules: [...newConfig.rules, newRule.trim()]
      });
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    setNewConfig({
      ...newConfig,
      rules: newConfig.rules.filter((_, i) => i !== index)
    });
  };

  const handleAddIndustry = () => {
    if (newIndustry.trim()) {
      setNewConfig({
        ...newConfig,
        industries: [...newConfig.industries, newIndustry.trim()]
      });
      setNewIndustry("");
    }
  };

  const handleRemoveIndustry = (index: number) => {
    setNewConfig({
      ...newConfig,
      industries: newConfig.industries.filter((_, i) => i !== index)
    });
  };

  const handleAddGuideline = () => {
    if (newGuideline.trim()) {
      setNewConfig({
        ...newConfig,
        recommendationGuidelines: [...newConfig.recommendationGuidelines, newGuideline.trim()]
      });
      setNewGuideline("");
    }
  };

  const handleRemoveGuideline = (index: number) => {
    setNewConfig({
      ...newConfig,
      recommendationGuidelines: newConfig.recommendationGuidelines.filter((_, i) => i !== index)
    });
  };

  // Form input handlers for edit configuration
  const handleEditAddRule = () => {
    if (newRule.trim() && editConfig) {
      setEditConfig({
        ...editConfig,
        rules: [...editConfig.rules, newRule.trim()]
      });
      setNewRule("");
    }
  };

  const handleEditRemoveRule = (index: number) => {
    if (editConfig) {
      setEditConfig({
        ...editConfig,
        rules: editConfig.rules.filter((_, i) => i !== index)
      });
    }
  };

  const handleEditAddIndustry = () => {
    if (newIndustry.trim() && editConfig) {
      setEditConfig({
        ...editConfig,
        industries: [...editConfig.industries, newIndustry.trim()]
      });
      setNewIndustry("");
    }
  };

  const handleEditRemoveIndustry = (index: number) => {
    if (editConfig) {
      setEditConfig({
        ...editConfig,
        industries: editConfig.industries.filter((_, i) => i !== index)
      });
    }
  };

  const handleEditAddGuideline = () => {
    if (newGuideline.trim() && editConfig) {
      setEditConfig({
        ...editConfig,
        recommendationGuidelines: [...editConfig.recommendationGuidelines, newGuideline.trim()]
      });
      setNewGuideline("");
    }
  };

  const handleEditRemoveGuideline = (index: number) => {
    if (editConfig) {
      setEditConfig({
        ...editConfig,
        recommendationGuidelines: editConfig.recommendationGuidelines.filter((_, i) => i !== index)
      });
    }
  };

  const handleCreateConfig = () => {
    if (!newConfig.name || !newConfig.systemPrompt) {
      toast({
        title: "Validation Error",
        description: "Name and system prompt are required",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(newConfig);
  };

  const handleUpdateConfig = () => {
    if (!editConfig || !editConfig.name || !editConfig.systemPrompt) {
      toast({
        title: "Validation Error",
        description: "Name and system prompt are required",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(editConfig);
  };

  const handleDeleteConfig = () => {
    if (selectedConfigId === null) return;
    deleteMutation.mutate(selectedConfigId);
  };

  const handleActivateConfig = (id: number) => {
    activateMutation.mutate(id);
  };

  const startEditConfig = (config: AIConfig) => {
    setEditConfig({...config});
    setIsEditDialogOpen(true);
  };

  const startDeleteConfig = (id: number) => {
    setSelectedConfigId(id);
    setDeleteConfirmationOpen(true);
  };

  // Helper to render list items with delete buttons
  const renderListItems = (
    items: string[], 
    onRemove: (index: number) => void
  ) => {
    return items.map((item, index) => (
      <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded mb-2">
        <span>{item}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(index)}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Configurations</CardTitle>
            <CardDescription>
              There was an error loading the AI configurations. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : String(error)}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] })}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Configuration Dashboard</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Configuration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configurations">
            <Settings className="mr-2 h-4 w-4" /> Configurations
          </TabsTrigger>
          <TabsTrigger value="active">
            <Check className="mr-2 h-4 w-4" /> Active Configuration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configurations" className="space-y-4 mt-4">
          {configurations && configurations.length > 0 ? (
            configurations.map((config) => (
              <Card key={config.id} className={config.isActive ? "border-primary" : ""}>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{config.name}</CardTitle>
                    {config.isActive && <Badge className="ml-2">Active</Badge>}
                  </div>
                  <CardDescription>
                    Temperature: {config.temperature}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2">System Prompt</h3>
                    <div className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
                      {config.systemPrompt}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Rules ({config.rules.length})</h3>
                      <div className="text-xs text-muted-foreground">
                        {config.rules.slice(0, 3).map((rule, i) => (
                          <p key={i} className="mb-1">• {rule}</p>
                        ))}
                        {config.rules.length > 3 && <p>+ {config.rules.length - 3} more...</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Industries ({config.industries.length})</h3>
                      <div className="text-xs text-muted-foreground">
                        {config.industries.slice(0, 3).map((industry, i) => (
                          <p key={i} className="mb-1">• {industry}</p>
                        ))}
                        {config.industries.length > 3 && <p>+ {config.industries.length - 3} more...</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Guidelines ({config.recommendationGuidelines.length})</h3>
                      <div className="text-xs text-muted-foreground">
                        {config.recommendationGuidelines.slice(0, 3).map((guideline, i) => (
                          <p key={i} className="mb-1">• {guideline}</p>
                        ))}
                        {config.recommendationGuidelines.length > 3 && <p>+ {config.recommendationGuidelines.length - 3} more...</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {!config.isActive && (
                    <Button 
                      variant="outline"
                      onClick={() => handleActivateConfig(config.id)}
                      disabled={activateMutation.isPending}
                    >
                      Set as Active
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => startEditConfig(config)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => startDeleteConfig(config.id)}
                    disabled={config.isActive}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Configurations</CardTitle>
                <CardDescription>
                  You don't have any AI configurations yet. Create one to get started.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Configuration
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          {activeConfig ? (
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <CardTitle className="text-2xl">{activeConfig.name}</CardTitle>
                  <Badge className="ml-2">Active</Badge>
                </div>
                <CardDescription>
                  Temperature: {activeConfig.temperature}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">System Prompt</h3>
                  <div className="bg-muted p-4 rounded-md overflow-y-auto max-h-60">
                    {activeConfig.systemPrompt}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <List className="mr-2 h-4 w-4" /> Rules
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-md overflow-y-auto max-h-60">
                      {activeConfig.rules.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {activeConfig.rules.map((rule, index) => (
                            <li key={index}>{rule}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No rules configured</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <List className="mr-2 h-4 w-4" /> Industries
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-md overflow-y-auto max-h-60">
                      {activeConfig.industries.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {activeConfig.industries.map((industry, index) => (
                            <li key={index}>{industry}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No industries configured</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <List className="mr-2 h-4 w-4" /> Guidelines
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-md overflow-y-auto max-h-60">
                      {activeConfig.recommendationGuidelines.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {activeConfig.recommendationGuidelines.map((guideline, index) => (
                            <li key={index}>{guideline}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No guidelines configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  variant="outline"
                  onClick={() => startEditConfig(activeConfig)}
                >
                  Edit Active Configuration
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Configuration</CardTitle>
                <CardDescription>
                  There's no active AI configuration set. Please create a configuration and set it as active.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Configuration
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Configuration Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Configuration</DialogTitle>
            <DialogDescription>
              Create a new AI configuration for the Digital Village AI Buddy.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newConfig.name}
                onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                className="col-span-3"
                placeholder="Configuration name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temperature" className="text-right">
                Temperature
              </Label>
              <Input
                id="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={newConfig.temperature}
                onChange={(e) => setNewConfig({...newConfig, temperature: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="systemPrompt" className="text-right pt-2">
                System Prompt
              </Label>
              <Textarea
                id="systemPrompt"
                value={newConfig.systemPrompt}
                onChange={(e) => setNewConfig({...newConfig, systemPrompt: e.target.value})}
                className="col-span-3 min-h-[150px]"
                placeholder="Enter system prompt instructions for the AI"
              />
            </div>
            
            <Separator className="my-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rules */}
              <div>
                <Label className="mb-2 block">Rules</Label>
                <div className="mb-2 flex">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 mr-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddRule}
                    disabled={!newRule.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-muted/50 p-2 rounded-md overflow-y-auto max-h-60 min-h-[100px]">
                  {newConfig.rules.length > 0 ? (
                    renderListItems(newConfig.rules, handleRemoveRule)
                  ) : (
                    <p className="text-muted-foreground text-sm p-2">No rules added yet</p>
                  )}
                </div>
              </div>
              
              {/* Industries */}
              <div>
                <Label className="mb-2 block">Industries</Label>
                <div className="mb-2 flex">
                  <Input
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="Add an industry"
                    className="flex-1 mr-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddIndustry}
                    disabled={!newIndustry.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-muted/50 p-2 rounded-md overflow-y-auto max-h-60 min-h-[100px]">
                  {newConfig.industries.length > 0 ? (
                    renderListItems(newConfig.industries, handleRemoveIndustry)
                  ) : (
                    <p className="text-muted-foreground text-sm p-2">No industries added yet</p>
                  )}
                </div>
              </div>
              
              {/* Guidelines */}
              <div>
                <Label className="mb-2 block">Recommendation Guidelines</Label>
                <div className="mb-2 flex">
                  <Input
                    value={newGuideline}
                    onChange={(e) => setNewGuideline(e.target.value)}
                    placeholder="Add a guideline"
                    className="flex-1 mr-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddGuideline}
                    disabled={!newGuideline.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-muted/50 p-2 rounded-md overflow-y-auto max-h-60 min-h-[100px]">
                  {newConfig.recommendationGuidelines.length > 0 ? (
                    renderListItems(newConfig.recommendationGuidelines, handleRemoveGuideline)
                  ) : (
                    <p className="text-muted-foreground text-sm p-2">No guidelines added yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Set as Active
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={newConfig.isActive}
                  onChange={(e) => setNewConfig({...newConfig, isActive: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Make this the active configuration</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConfig} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Configuration Dialog */}
      {editConfig && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Configuration</DialogTitle>
              <DialogDescription>
                Update the AI configuration settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editConfig.name}
                  onChange={(e) => setEditConfig({...editConfig, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-temperature" className="text-right">
                  Temperature
                </Label>
                <Input
                  id="edit-temperature"
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={editConfig.temperature}
                  onChange={(e) => setEditConfig({...editConfig, temperature: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-systemPrompt" className="text-right pt-2">
                  System Prompt
                </Label>
                <Textarea
                  id="edit-systemPrompt"
                  value={editConfig.systemPrompt}
                  onChange={(e) => setEditConfig({...editConfig, systemPrompt: e.target.value})}
                  className="col-span-3 min-h-[150px]"
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rules */}
                <div>
                  <Label className="mb-2 block">Rules</Label>
                  <div className="mb-2 flex">
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Add a rule"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleEditAddRule}
                      disabled={!newRule.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-md overflow-y-auto max-h-60 min-h-[100px]">
                    {editConfig.rules.length > 0 ? (
                      renderListItems(editConfig.rules, handleEditRemoveRule)
                    ) : (
                      <p className="text-muted-foreground text-sm p-2">No rules added yet</p>
                    )}
                  </div>
                </div>
                
                {/* Industries */}
                <div>
                  <Label className="mb-2 block">Industries</Label>
                  <div className="mb-2 flex">
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="Add an industry"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleEditAddIndustry}
                      disabled={!newIndustry.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-md overflow-y-auto max-h-60 min-h-[100px]">
                    {editConfig.industries.length > 0 ? (
                      renderListItems(editConfig.industries, handleEditRemoveIndustry)
                    ) : (
                      <p className="text-muted-foreground text-sm p-2">No industries added yet</p>
                    )}
                  </div>
                </div>
                
                {/* Guidelines */}
                <div>
                  <Label className="mb-2 block">Recommendation Guidelines</Label>
                  <div className="mb-2 flex">
                    <Input
                      value={newGuideline}
                      onChange={(e) => setNewGuideline(e.target.value)}
                      placeholder="Add a guideline"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleEditAddGuideline}
                      disabled={!newGuideline.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-md overflow-y-auto max-h-60 min-h-[100px]">
                    {editConfig.recommendationGuidelines.length > 0 ? (
                      renderListItems(editConfig.recommendationGuidelines, handleEditRemoveGuideline)
                    ) : (
                      <p className="text-muted-foreground text-sm p-2">No guidelines added yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isActive" className="text-right">
                  Set as Active
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="edit-isActive"
                    type="checkbox"
                    checked={editConfig.isActive}
                    onChange={(e) => setEditConfig({...editConfig, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Make this the active configuration</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateConfig} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfig}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
