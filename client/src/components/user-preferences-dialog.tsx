import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserPreferences, userPreferencesSchema } from "@shared/schema";
import { useEffect, useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface UserPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserPreferencesDialog({ open, onOpenChange }: UserPreferencesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("business-systems");

  const form = useForm<UserPreferences>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      businessSystems: {
        technologyStack: [],
        customTools: "",
        primaryDataType: "",
        dataStorageFormats: [],
        implementationApproach: "",
        securityRequirements: [],
        customSecurityRequirements: "",
      },
      businessContext: {
        organizationProfile: {
          companySize: "",
          annualRevenue: "",
          growthStage: "",
        },
        businessOperations: {
          decisionComplexity: 5,
          businessChallenges: [],
          kpis: [],
          customKpis: "",
        },
      },
      aiReadiness: {
        businessImpact: {
          priorityAreas: [],
          budgetRange: "",
          roiTimeframe: "",
        },
        readinessAssessment: {
          teamAiLiteracy: 5,
          previousAiExperience: "",
          dataGovernanceMaturity: 5,
          changeManagementCapability: 5,
        },
      },
      aiTraining: false,
      performanceMetrics: true,
      impactAnalysis: true,
    },
    mode: "onChange",
  });

  // Force re-render on any form change
  form.watch();

  // Fetch preferences with error handling
  const { data: preferences, isLoading: isLoadingPreferences, error: fetchError } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch preferences");
      }
      return res.json();
    },
    enabled: open,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update preferences with optimistic updates
  const updatePreferences = useMutation({
    mutationFn: async (data: UserPreferences) => {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update preferences");
      }
      return res.json();
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/user/preferences"] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["/api/user/preferences"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/user/preferences"], newData);
      
      return { previousData };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["/api/user/preferences"], context.previousData);
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
      });
      onOpenChange(false);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
  });

  // Update form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset(preferences);
    }
  }, [preferences, form]);

  // Handle tab change with form state preservation
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Handle form submission
  const onSubmit = (data: UserPreferences) => {
    updatePreferences.mutate(data);
  };

  // Handle dialog close with unsaved changes
  const handleClose = useCallback(() => {
    if (form.formState.isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  }, [form.formState.isDirty, onOpenChange]);

  // Show error state
  if (fetchError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {fetchError instanceof Error ? fetchError.message : "Failed to load preferences"}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh] p-6 sm:p-8"
        aria-labelledby="preferences-title"
        aria-describedby="preferences-description"
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <DialogTitle id="preferences-title" className="text-2xl font-semibold">
              User Preferences
            </DialogTitle>
            <p id="preferences-description" className="text-sm text-muted-foreground mt-1">
              Configure your business and AI preferences
            </p>
          </div>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-muted focus:ring-2 focus:ring-offset-2"
              aria-label="Close preferences dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoadingPreferences ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6"
            >
              <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange} 
                className="w-full"
                aria-label="Preference categories"
              >
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-muted/50">
                  <TabsTrigger 
                    value="business-systems"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Business Systems & Data
                  </TabsTrigger>
                  <TabsTrigger 
                    value="business-context"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Business Context
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ai-readiness"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    AI Readiness & Impact
                  </TabsTrigger>
                </TabsList>

                {/* Business Systems Tab */}
                <TabsContent 
                  value="business-systems" 
                  className="space-y-6 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  tabIndex={-1}
                >
                  {/* Business Systems Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Systems</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Technology Stack</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "crm", label: "CRM", tooltip: "Customer Relationship Management systems" },
                            { id: "erp", label: "ERP", tooltip: "Enterprise Resource Planning systems" },
                            { id: "bi", label: "BI Tools", tooltip: "Business Intelligence and analytics tools" },
                            { id: "cms", label: "CMS", tooltip: "Content Management Systems" },
                            { id: "hrms", label: "HRMS", tooltip: "Human Resource Management Systems" },
                            { id: "scm", label: "SCM", tooltip: "Supply Chain Management systems" },
                          ].map((tool) => (
                            <div key={tool.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={tool.id}
                                checked={form.watch("businessSystems.technologyStack").includes(tool.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("businessSystems.technologyStack");
                                  form.setValue(
                                    "businessSystems.technologyStack",
                                    checked
                                      ? [...current, tool.id]
                                      : current.filter((id) => id !== tool.id)
                                  );
                                }}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={tool.id} className="flex items-center gap-1">
                                      {tool.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{tool.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customTools">Additional Tools</Label>
                        <Input
                          id="customTools"
                          placeholder="Enter any additional tools or systems..."
                          {...form.register("businessSystems.customTools")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Resources Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Data Resources</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Primary Data Type</Label>
                        <RadioGroup
                          value={form.watch("businessSystems.primaryDataType")}
                          onValueChange={(value) =>
                            form.setValue("businessSystems.primaryDataType", value)
                          }
                        >
                          {[
                            { id: "structured", label: "Structured", tooltip: "Data in a predefined format (e.g., databases)" },
                            { id: "unstructured", label: "Unstructured", tooltip: "Data without a predefined format (e.g., text, images)" },
                            { id: "semi-structured", label: "Semi-structured", tooltip: "Data with some organizational properties (e.g., XML, JSON)" },
                          ].map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={type.id} id={type.id} />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={type.id} className="flex items-center gap-1">
                                      {type.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{type.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Data Storage Formats</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "sql", label: "SQL Databases", tooltip: "Relational database management systems" },
                            { id: "nosql", label: "NoSQL Databases", tooltip: "Non-relational database systems" },
                            { id: "data-warehouse", label: "Data Warehouse", tooltip: "Centralized data storage for analytics" },
                            { id: "data-lake", label: "Data Lake", tooltip: "Raw data storage in native format" },
                            { id: "file-storage", label: "File Storage", tooltip: "Traditional file-based storage" },
                            { id: "cloud-storage", label: "Cloud Storage", tooltip: "Cloud-based storage solutions" },
                          ].map((format) => (
                            <div key={format.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={format.id}
                                checked={form.watch("businessSystems.dataStorageFormats").includes(format.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("businessSystems.dataStorageFormats");
                                  form.setValue(
                                    "businessSystems.dataStorageFormats",
                                    checked
                                      ? [...current, format.id]
                                      : current.filter((id) => id !== format.id)
                                  );
                                }}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={format.id} className="flex items-center gap-1">
                                      {format.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{format.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Implementation & Security Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Implementation & Security</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Implementation Approach</Label>
                        <RadioGroup
                          value={form.watch("businessSystems.implementationApproach")}
                          onValueChange={(value) =>
                            form.setValue("businessSystems.implementationApproach", value)
                          }
                        >
                          {[
                            { id: "cloud", label: "Cloud-based", tooltip: "Hosted in cloud infrastructure" },
                            { id: "on-premise", label: "On-premise", tooltip: "Hosted on local infrastructure" },
                            { id: "hybrid", label: "Hybrid", tooltip: "Combination of cloud and on-premise" },
                          ].map((approach) => (
                            <div key={approach.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={approach.id} id={approach.id} />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={approach.id} className="flex items-center gap-1">
                                      {approach.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{approach.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Security Requirements</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "encryption", label: "Data Encryption", tooltip: "Encryption of data at rest and in transit" },
                            { id: "access-control", label: "Access Control", tooltip: "Role-based access control systems" },
                            { id: "audit-logs", label: "Audit Logs", tooltip: "Comprehensive logging of system activities" },
                            { id: "compliance", label: "Compliance", tooltip: "Industry-specific compliance requirements" },
                            { id: "backup", label: "Backup & Recovery", tooltip: "Data backup and disaster recovery" },
                            { id: "monitoring", label: "Security Monitoring", tooltip: "Real-time security monitoring" },
                          ].map((requirement) => (
                            <div key={requirement.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={requirement.id}
                                checked={form.watch("businessSystems.securityRequirements").includes(requirement.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("businessSystems.securityRequirements");
                                  form.setValue(
                                    "businessSystems.securityRequirements",
                                    checked
                                      ? [...current, requirement.id]
                                      : current.filter((id) => id !== requirement.id)
                                  );
                                }}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={requirement.id} className="flex items-center gap-1">
                                      {requirement.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{requirement.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customSecurityRequirements">Additional Security Requirements</Label>
                        <Input
                          id="customSecurityRequirements"
                          placeholder="Enter any additional security requirements..."
                          {...form.register("businessSystems.customSecurityRequirements")}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Business Context Tab */}
                <TabsContent 
                  value="business-context" 
                  className="space-y-6 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  tabIndex={-1}
                >
                  {/* Organization Profile Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Organization Profile</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select
                          value={form.watch("businessContext.organizationProfile.companySize")}
                          onValueChange={(value) =>
                            form.setValue("businessContext.organizationProfile.companySize", value)
                          }
                        >
                          <SelectTrigger id="companySize">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "1-10", label: "1-10 employees" },
                              { value: "11-50", label: "11-50 employees" },
                              { value: "51-200", label: "51-200 employees" },
                              { value: "201-500", label: "201-500 employees" },
                              { value: "501-1000", label: "501-1000 employees" },
                              { value: "1000+", label: "1000+ employees" },
                            ].map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="annualRevenue">Annual Revenue</Label>
                        <Select
                          value={form.watch("businessContext.organizationProfile.annualRevenue")}
                          onValueChange={(value) =>
                            form.setValue("businessContext.organizationProfile.annualRevenue", value)
                          }
                        >
                          <SelectTrigger id="annualRevenue">
                            <SelectValue placeholder="Select revenue range" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "<1M", label: "Less than $1M" },
                              { value: "1M-10M", label: "$1M - $10M" },
                              { value: "10M-50M", label: "$10M - $50M" },
                              { value: "50M-100M", label: "$50M - $100M" },
                              { value: "100M-500M", label: "$100M - $500M" },
                              { value: "500M+", label: "$500M+" },
                            ].map((revenue) => (
                              <SelectItem key={revenue.value} value={revenue.value}>
                                {revenue.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="growthStage">Growth Stage</Label>
                        <Select
                          value={form.watch("businessContext.organizationProfile.growthStage")}
                          onValueChange={(value) =>
                            form.setValue("businessContext.organizationProfile.growthStage", value)
                          }
                        >
                          <SelectTrigger id="growthStage">
                            <SelectValue placeholder="Select growth stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "startup", label: "Startup" },
                              { value: "early-growth", label: "Early Growth" },
                              { value: "growth", label: "Growth" },
                              { value: "mature", label: "Mature" },
                              { value: "enterprise", label: "Enterprise" },
                            ].map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Business Operations Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Operations</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Decision-making Complexity</Label>
                          <span className="text-sm text-muted-foreground">
                            {form.watch("businessContext.businessOperations.decisionComplexity")}/10
                          </span>
                        </div>
                        <Slider
                          value={[form.watch("businessContext.businessOperations.decisionComplexity")]}
                          onValueChange={([value]) =>
                            form.setValue("businessContext.businessOperations.decisionComplexity", value)
                          }
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Simple</span>
                          <span>Complex</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Business Challenges</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "scalability", label: "Scalability", tooltip: "Ability to handle growth and increased demand" },
                            { id: "efficiency", label: "Operational Efficiency", tooltip: "Optimizing business processes and reducing costs" },
                            { id: "competition", label: "Market Competition", tooltip: "Staying competitive in the market" },
                            { id: "innovation", label: "Innovation", tooltip: "Keeping up with technological advancements" },
                            { id: "talent", label: "Talent Management", tooltip: "Attracting and retaining skilled employees" },
                            { id: "compliance", label: "Regulatory Compliance", tooltip: "Meeting industry regulations and standards" },
                          ].map((challenge) => (
                            <div key={challenge.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={challenge.id}
                                checked={form.watch("businessContext.businessOperations.businessChallenges").includes(challenge.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("businessContext.businessOperations.businessChallenges");
                                  form.setValue(
                                    "businessContext.businessOperations.businessChallenges",
                                    checked
                                      ? [...current, challenge.id]
                                      : current.filter((id) => id !== challenge.id)
                                  );
                                }}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={challenge.id} className="flex items-center gap-1">
                                      {challenge.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{challenge.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Key Performance Indicators (KPIs)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "revenue", label: "Revenue Growth", tooltip: "Year-over-year revenue growth rate" },
                            { id: "profit", label: "Profit Margins", tooltip: "Net profit margin percentage" },
                            { id: "customer", label: "Customer Acquisition", tooltip: "Cost of acquiring new customers" },
                            { id: "retention", label: "Customer Retention", tooltip: "Customer retention rate" },
                            { id: "efficiency", label: "Operational Efficiency", tooltip: "Resource utilization and productivity" },
                            { id: "market", label: "Market Share", tooltip: "Percentage of market captured" },
                          ].map((kpi) => (
                            <div key={kpi.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={kpi.id}
                                checked={form.watch("businessContext.businessOperations.kpis").includes(kpi.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("businessContext.businessOperations.kpis");
                                  form.setValue(
                                    "businessContext.businessOperations.kpis",
                                    checked
                                      ? [...current, kpi.id]
                                      : current.filter((id) => id !== kpi.id)
                                  );
                                }}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={kpi.id} className="flex items-center gap-1">
                                      {kpi.label}
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{kpi.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="customKpis">Additional KPIs</Label>
                          <Input
                            id="customKpis"
                            placeholder="Enter any additional KPIs..."
                            {...form.register("businessContext.businessOperations.customKpis")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* AI Readiness Tab */}
                <TabsContent 
                  value="ai-readiness" 
                  className="space-y-6 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  tabIndex={-1}
                >
                  {/* Business Impact Section */}
                  <div className="space-y-4 bg-card rounded-lg p-4 sm:p-6 border">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span>Business Impact</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Learn more about business impact</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure how AI will impact your business operations and goals</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="priority-areas">Priority Areas</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: "cost-reduction", label: "Cost Reduction", tooltip: "Reducing operational costs and improving efficiency" },
                            { id: "revenue-growth", label: "Revenue Growth", tooltip: "Increasing sales and market share" },
                            { id: "customer-experience", label: "Customer Experience", tooltip: "Enhancing customer satisfaction and loyalty" },
                            { id: "product-innovation", label: "Product Innovation", tooltip: "Developing new products and services" },
                            { id: "process-automation", label: "Process Automation", tooltip: "Automating manual tasks and workflows" },
                            { id: "risk-management", label: "Risk Management", tooltip: "Improving risk assessment and mitigation" },
                          ].map((area) => (
                            <div key={area.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={area.id}
                                checked={form.watch("aiReadiness.businessImpact.priorityAreas").includes(area.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.watch("aiReadiness.businessImpact.priorityAreas");
                                  form.setValue(
                                    "aiReadiness.businessImpact.priorityAreas",
                                    checked
                                      ? [...current, area.id]
                                      : current.filter((id) => id !== area.id)
                                  );
                                }}
                                aria-label={`Select ${area.label} as priority area`}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={area.id} className="flex items-center gap-1 cursor-help">
                                      {area.label}
                                      <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{area.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="budgetRange">Budget Range</Label>
                          <Select
                            value={form.watch("aiReadiness.businessImpact.budgetRange")}
                            onValueChange={(value) =>
                              form.setValue("aiReadiness.businessImpact.budgetRange", value)
                            }
                          >
                            <SelectTrigger id="budgetRange" aria-label="Select budget range">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                { value: "<50k", label: "Less than $50K" },
                                { value: "50k-100k", label: "$50K - $100K" },
                                { value: "100k-250k", label: "$100K - $250K" },
                                { value: "250k-500k", label: "$250K - $500K" },
                                { value: "500k-1m", label: "$500K - $1M" },
                                { value: "1m+", label: "$1M+" },
                              ].map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="roiTimeframe">Expected ROI Timeframe</Label>
                          <Select
                            value={form.watch("aiReadiness.businessImpact.roiTimeframe")}
                            onValueChange={(value) =>
                              form.setValue("aiReadiness.businessImpact.roiTimeframe", value)
                            }
                          >
                            <SelectTrigger id="roiTimeframe" aria-label="Select ROI timeframe">
                              <SelectValue placeholder="Select ROI timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                { value: "<6m", label: "Less than 6 months" },
                                { value: "6m-1y", label: "6 months - 1 year" },
                                { value: "1y-2y", label: "1-2 years" },
                                { value: "2y-3y", label: "2-3 years" },
                                { value: "3y+", label: "3+ years" },
                              ].map((timeframe) => (
                                <SelectItem key={timeframe.value} value={timeframe.value}>
                                  {timeframe.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Readiness Assessment Section */}
                  <div className="space-y-4 bg-card rounded-lg p-4 sm:p-6 border">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span>AI Readiness Assessment</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Learn more about AI readiness assessment</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Evaluate your organization's readiness for AI implementation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="teamAiLiteracy">Team AI Literacy</Label>
                          <span className="text-sm text-muted-foreground" aria-live="polite">
                            {form.watch("aiReadiness.readinessAssessment.teamAiLiteracy")}/10
                          </span>
                        </div>
                        <Slider
                          id="teamAiLiteracy"
                          value={[form.watch("aiReadiness.readinessAssessment.teamAiLiteracy")]}
                          onValueChange={([value]) =>
                            form.setValue("aiReadiness.readinessAssessment.teamAiLiteracy", value)
                          }
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                          aria-label="Team AI literacy level"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Beginner</span>
                          <span>Expert</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Previous AI Experience</Label>
                        <RadioGroup
                          value={form.watch("aiReadiness.readinessAssessment.previousAiExperience")}
                          onValueChange={(value) =>
                            form.setValue("aiReadiness.readinessAssessment.previousAiExperience", value)
                          }
                          aria-label="Previous AI experience level"
                        >
                          {[
                            { id: "none", label: "No Experience", tooltip: "No previous AI implementation experience" },
                            { id: "experimental", label: "Experimental", tooltip: "Some experimental or pilot projects" },
                            { id: "limited", label: "Limited Production", tooltip: "Limited production deployments" },
                            { id: "extensive", label: "Extensive", tooltip: "Multiple successful AI implementations" },
                          ].map((experience) => (
                            <div key={experience.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={experience.id} id={experience.id} />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Label htmlFor={experience.id} className="flex items-center gap-1 cursor-help">
                                      {experience.label}
                                      <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    </Label>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{experience.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dataGovernance">Data Governance Maturity</Label>
                          <span className="text-sm text-muted-foreground" aria-live="polite">
                            {form.watch("aiReadiness.readinessAssessment.dataGovernanceMaturity")}/10
                          </span>
                        </div>
                        <Slider
                          id="dataGovernance"
                          value={[form.watch("aiReadiness.readinessAssessment.dataGovernanceMaturity")]}
                          onValueChange={([value]) =>
                            form.setValue("aiReadiness.readinessAssessment.dataGovernanceMaturity", value)
                          }
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                          aria-label="Data governance maturity level"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Basic</span>
                          <span>Advanced</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="changeManagement">Change Management Capability</Label>
                          <span className="text-sm text-muted-foreground" aria-live="polite">
                            {form.watch("aiReadiness.readinessAssessment.changeManagementCapability")}/10
                          </span>
                        </div>
                        <Slider
                          id="changeManagement"
                          value={[form.watch("aiReadiness.readinessAssessment.changeManagementCapability")]}
                          onValueChange={([value]) =>
                            form.setValue("aiReadiness.readinessAssessment.changeManagementCapability", value)
                          }
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                          aria-label="Change management capability level"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Limited</span>
                          <span>Strong</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Readiness Toggles */}
                  <div className="space-y-4 bg-card rounded-lg p-4 sm:p-6 border">
                    <h3 className="text-lg font-semibold">AI System Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="aiTraining" className="flex flex-col gap-1">
                          <span>AI Training</span>
                          <span className="text-sm text-muted-foreground">
                            Enable AI model training with your data
                          </span>
                        </Label>
                        <Switch
                          id="aiTraining"
                          checked={form.watch("aiTraining")}
                          onCheckedChange={(checked) => form.setValue("aiTraining", checked)}
                          aria-label="Enable AI training"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="performanceMetrics" className="flex flex-col gap-1">
                          <span>Performance Metrics</span>
                          <span className="text-sm text-muted-foreground">
                            Track AI system performance and accuracy
                          </span>
                        </Label>
                        <Switch
                          id="performanceMetrics"
                          checked={form.watch("performanceMetrics")}
                          onCheckedChange={(checked) => form.setValue("performanceMetrics", checked)}
                          aria-label="Enable performance metrics"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="impactAnalysis" className="flex flex-col gap-1">
                          <span>Impact Analysis</span>
                          <span className="text-sm text-muted-foreground">
                            Generate reports on AI impact and ROI
                          </span>
                        </Label>
                        <Switch
                          id="impactAnalysis"
                          checked={form.watch("impactAnalysis")}
                          onCheckedChange={(checked) => form.setValue("impactAnalysis", checked)}
                          aria-label="Enable impact analysis"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6 mt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoadingPreferences || updatePreferences.isPending}
                  className="w-full sm:w-auto"
                >
                  {updatePreferences.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
} 