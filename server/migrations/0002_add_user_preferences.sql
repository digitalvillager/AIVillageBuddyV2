-- Add preferences columns to users table
ALTER TABLE users
ADD COLUMN business_systems JSONB,
ADD COLUMN business_context JSONB,
ADD COLUMN ai_readiness JSONB,
ADD COLUMN ai_training BOOLEAN DEFAULT false,
ADD COLUMN performance_metrics BOOLEAN DEFAULT true,
ADD COLUMN impact_analysis BOOLEAN DEFAULT true; 