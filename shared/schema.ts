import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  industry: z.string().optional(),
  businessProblem: z.string().optional(),
  currentProcess: z.string().optional(),
  availableData: z.string().optional(),
  successMetrics: z.string().optional(),
  stakeholders: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  isComplete: z.boolean().optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
