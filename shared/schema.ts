export interface AIConfiguration {
  systemPrompt: string;
  temperature: number;
  rules: string[];
  industries: string[];
  recommendationGuidelines: string[];
  teamRoles: Array<{
    title: string;
    rate: number;
    description: string;
  }>;
  companyContext: {
    pricing: {
      hourlyRates: Record<string, number>;
      standardPackages: Array<{
        name: string;
        description: string;
        price: number;
      }>;
    };
    recommendations: Array<{
      category: string;
      guidelines: string[];
    }>;
    bestPractices: string[];
  };
}

export interface AIConfigurationDocument extends AIConfiguration {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  created: timestamp("created").defaultNow().notNull(),
  isAdmin: boolean("isadmin").default(false), // Using lowercase 'isadmin' to match DB schema
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  isAdmin: true, //Added isAdmin to the insert schema
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project schema to group related sessions
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
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
  isAdmin: z.boolean(), // Added isAdmin field to the response schema
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