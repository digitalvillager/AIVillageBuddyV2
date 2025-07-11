export interface AIConfiguration {
  systemPrompt: string;
  temperature: number;
  rules: string[];
  industries: string[];
  recommendationGuidelines: string[];
}

export interface AIConfigurationDocument extends AIConfiguration {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI configuration table
export const aiConfigurations = pgTable("ai_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  temperature: text("temperature").notNull(), // storing as text for easy conversion
  rules: jsonb("rules").notNull().$type<string[]>(),
  industries: jsonb("industries").notNull().$type<string[]>(),
  recommendationGuidelines: jsonb("recommendation_guidelines").notNull().$type<string[]>(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAIConfigurationSchema = createInsertSchema(aiConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAIConfiguration = z.infer<typeof insertAIConfigurationSchema>;
export type AIConfig = typeof aiConfigurations.$inferSelect;

import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  profilePhoto: text("profile_photo"),
  created: timestamp("created").defaultNow().notNull(),
  isAdmin: boolean("isadmin").default(false).notNull(),
  businessSystems: jsonb("business_systems").$type<UserPreferences['businessSystems']>(),
  businessContext: jsonb("business_context").$type<UserPreferences['businessContext']>(),
  aiReadiness: jsonb("ai_readiness").$type<UserPreferences['aiReadiness']>(),
  aiTraining: boolean("ai_training").default(false),
  performanceMetrics: boolean("performance_metrics").default(true),
  impactAnalysis: boolean("impact_analysis").default(true)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  isAdmin: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project schema to group related sessions
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  timeline: text("timeline"),
  budget: text("budget"),
  primaryGoal: text("primary_goal"),
  technicalComplexity: integer("technical_complexity"),
  projectConfidence: boolean("project_confidence"),
  additionalContext: text("additional_context"),
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created: true,
  updated: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Chat message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Session schema to store conversation state
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  title: text("title").default("Untitled Session"),
  industry: text("industry"),
  businessProblem: text("business_problem"),
  currentProcess: text("current_process"),
  availableData: text("available_data"),
  successMetrics: text("success_metrics"),
  stakeholders: text("stakeholders"),
  timeline: text("timeline"),
  budget: text("budget"),
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
  isComplete: boolean("is_complete").default(false),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  created: true,
  updated: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Output documents schema
export const outputDocuments = pgTable("output_documents", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  type: text("type").notNull(), // 'implementation', 'cost', 'design', 'business', 'ai'
  content: jsonb("content").notNull(),
  created: timestamp("created").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const insertOutputDocumentSchema = createInsertSchema(outputDocuments).omit({
  id: true,
  created: true,
  updated: true,
});

export type InsertOutputDocument = z.infer<typeof insertOutputDocumentSchema>;
export type OutputDocument = typeof outputDocuments.$inferSelect;

// User response schema for API responses
export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  name: z.string().optional(),
  isAdmin: z.boolean(),
  profilePhoto: z.string().nullable()
});

export type UserResponse = z.infer<typeof userResponseSchema>;

// Project response schema for API responses
export const projectResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  created: z.string(),
  updated: z.string(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

// Message response schema for API responses
export const messageResponseSchema = z.object({
  id: z.number(),
  content: z.string(),
  role: z.string(),
  timestamp: z.string(),
  sessionId: z.string(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;

// Output document response schema for API responses
export const outputDocumentResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  content: z.record(z.any()),
  sessionId: z.string(),
});

export type OutputDocumentResponse = z.infer<typeof outputDocumentResponseSchema>;

// Session response schema for API responses
export const sessionResponseSchema = z.object({
  id: z.string(),
  userId: z.number().optional(),
  projectId: z.number().optional(),
  title: z.string().optional(),
  industry: z.string().optional(),
  businessProblem: z.string().optional(),
  currentProcess: z.string().optional(),
  availableData: z.string().optional(),
  successMetrics: z.string().optional(),
  stakeholders: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  isComplete: z.boolean().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  businessSystems: z.object({
    technologyStack: z.array(z.string()).optional().default([]),
    customTools: z.string().optional().default(""),
    primaryDataType: z.string().optional().default(""),
    dataStorageFormats: z.array(z.string()).optional().default([]),
    implementationApproach: z.string().optional().default(""),
    securityRequirements: z.array(z.string()).optional().default([]),
    customSecurityRequirements: z.string().optional().default(""),
  }).optional().default({}),
  businessContext: z.object({
    organizationProfile: z.object({
      companySize: z.string().optional().default(""),
      annualRevenue: z.string().optional().default(""),
      growthStage: z.string().optional().default(""),
    }).optional().default({}),
    businessOperations: z.object({
      decisionComplexity: z.number().optional().default(5),
      businessChallenges: z.array(z.string()).optional().default([]),
      kpis: z.array(z.string()).optional().default([]),
      customKpis: z.string().optional().default(""),
    }).optional().default({}),
  }).optional().default({}),
  aiReadiness: z.object({
    businessImpact: z.object({
      priorityAreas: z.array(z.string()).optional().default([]),
      budgetRange: z.string().optional().default(""),
      roiTimeframe: z.string().optional().default(""),
    }).optional().default({}),
    readinessAssessment: z.object({
      teamAiLiteracy: z.number().optional().default(5),
      previousAiExperience: z.string().optional().default(""),
      dataGovernanceMaturity: z.number().optional().default(5),
      changeManagementCapability: z.number().optional().default(5),
    }).optional().default({}),
  }).optional().default({}),
  aiTraining: z.boolean().optional().default(false),
  performanceMetrics: z.boolean().optional().default(true),
  impactAnalysis: z.boolean().optional().default(true),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;