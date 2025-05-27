# Developer Documentation for AI Village Buddy

## Table of Contents
1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Architecture Overview](#architecture-overview)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git
- OpenAI API key

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone git@github.com:jason-digital-village/AIVillageBuddy.git
   cd AIVillageBuddy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/database_name
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── types.ts        # TypeScript type definitions
├── server/                  # Backend Express application
│   ├── migrations/         # Database migrations
│   ├── src/               # Server source code
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage interface
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
└── drizzle.config.ts      # Drizzle ORM configuration
```

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Git Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## Architecture Overview

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui for components
- React Query for data fetching
- React Hook Form for form handling
- Zod for validation

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Passport.js for authentication
- OpenAI API integration
- WebSocket support for real-time features

### Database
- PostgreSQL
- Drizzle ORM for type-safe queries
- Migrations for schema changes

## Testing

### Running Tests
```bash
npm run test           # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Test Structure
- Unit tests for utilities and hooks
- Integration tests for API endpoints
- Component tests for React components

## Deployment

### Production Build
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

### Environment Variables
Ensure all required environment variables are set in production:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `SESSION_SECRET`
- `NODE_ENV=production`

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Authentication Problems**
   - Check session configuration
   - Verify SESSION_SECRET is set
   - Clear browser cookies if needed

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Getting Help
- Check existing issues on GitHub
- Create a new issue with detailed information
- Contact the maintainers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License. 