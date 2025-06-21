# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Solution Designer - An advanced AI-powered conversational platform that transforms complex business challenges into actionable insights. The application helps users create projects, have AI-guided conversations, and generate various output documents (implementation plans, cost estimates, design concepts, business cases, and AI considerations).

## Development Commands

### Development
- `npm run dev` - Start development server (frontend and backend)
- `npm run check` - TypeScript type checking

### Production
- `npm run build` - Build for production (both frontend and backend)
- `npm run start` - Start production server

### Database
- `npm run db:push` - Update database schema using Drizzle ORM

### Testing
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, shadcn/ui, Wouter (routing), React Query
- **Backend**: Express.js + TypeScript, Passport.js authentication, PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for conversation and output generation

### Key Directories
- `client/src/` - React frontend with components, pages, hooks, and utilities
- `server/` - Express backend with authentication, routes, and database management
- `shared/` - Common TypeScript schemas and types used by both frontend and backend
- `server/migrations/` - Database migration files

### Authentication & Authorization
- Passport.js with local strategy for session-based authentication
- Role-based access control (standard users vs admin users)
- Protected routes with authentication middleware
- Admin-only functionality for user management and AI configuration

### Database Schema
Core entities: Users, Projects, Sessions, Messages, Output Documents, AI Configurations
- Users have preferences (business systems, context, AI readiness level)
- Projects organize AI conversations and outputs
- Sessions contain message history between user and AI
- Output Documents store generated AI responses (implementation plans, cost estimates, etc.)

### State Management Patterns
- React Query for server state management and API caching
- React Context for user authentication and preferences
- Custom hooks for complex business logic (`use-auth`, `use-ai-solution-generator`, etc.)
- Form management with React Hook Form + Zod validation

### API Architecture
- RESTful endpoints with TypeScript interfaces
- Shared schema validation between frontend and backend
- WebSocket support for real-time features
- Middleware for authentication, admin access, and logging

## Important Development Notes

### Type Safety
- Extensive use of TypeScript and Zod for runtime validation
- Shared schemas in `shared/schema.ts` ensure type consistency
- Path aliases configured in `tsconfig.json` for clean imports

### Component Patterns
- shadcn/ui component library for consistent UI
- Custom hooks for reusable logic
- Error boundaries for comprehensive error handling
- Protected route components for authentication

### Database Workflow
- Use Drizzle ORM for type-safe database operations
- Run `npm run db:push` after schema changes in `shared/schema.ts`
- Database migrations are in `server/migrations/`

### Environment Configuration
Required environment variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI functionality
- `SESSION_SECRET` - Secret for session management

### Testing Approach
- Jest configuration with TypeScript support
- Test coverage reporting available
- Tests should be written for new utilities and complex business logic