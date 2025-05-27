-- Initial migration: create base tables

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  profile_photo TEXT,
  created TIMESTAMP DEFAULT NOW() NOT NULL,
  isadmin BOOLEAN DEFAULT FALSE NOT NULL,
  business_systems JSONB,
  business_context JSONB,
  ai_readiness JSONB,
  ai_training BOOLEAN DEFAULT FALSE,
  performance_metrics BOOLEAN DEFAULT TRUE,
  impact_analysis BOOLEAN DEFAULT TRUE
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  created TIMESTAMP DEFAULT NOW() NOT NULL,
  updated TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  title TEXT DEFAULT 'Untitled Session',
  industry TEXT,
  business_problem TEXT,
  current_process TEXT,
  available_data TEXT,
  success_metrics TEXT,
  stakeholders TEXT,
  timeline TEXT,
  budget TEXT,
  created TIMESTAMP DEFAULT NOW() NOT NULL,
  updated TIMESTAMP DEFAULT NOW() NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE
);

CREATE TABLE output_documents (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  created TIMESTAMP DEFAULT NOW() NOT NULL,
  updated TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE ai_configurations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  temperature TEXT NOT NULL,
  rules JSONB NOT NULL,
  industries JSONB NOT NULL,
  recommendation_guidelines JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
); 