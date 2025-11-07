# Discord Bot Hosting Panel

## Overview

BotHost is a web-based Discord bot hosting platform that allows users to upload, configure, and manage Discord bots with real-time monitoring, automatic restarts, and comprehensive logging. The application provides a dashboard interface for managing multiple bots, editing bot files, configuring environment variables, and monitoring resource usage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & UI Library**
- **React 18** with TypeScript for type-safe component development
- **Wouter** for client-side routing (lightweight React Router alternative)
- **Vite** as the build tool and development server
- **Shadcn/ui** component library with Radix UI primitives for accessible, customizable UI components
- **TailwindCSS** for utility-first styling with custom design tokens

**State Management**
- **TanStack Query (React Query)** for server state management, caching, and data synchronization
- Local component state using React hooks
- No global state management library (Redux, Zustand, etc.) - relies on React Query for server state

**Design System**
- Utility-focused dashboard inspired by Railway, Vercel, and Linear
- Custom color system supporting light and dark themes
- Typography hierarchy using Inter (UI) and JetBrains Mono (code/technical data)
- Consistent spacing primitives (Tailwind units: 2, 4, 6, 8)
- Card-based layout for bot management with grid responsive design

### Backend Architecture

**Server Framework**
- **Express.js** for HTTP server and API routing
- **Node.js** runtime with ESM module system
- RESTful API design pattern
- WebSocket integration using **ws** library for real-time bot status and log streaming

**Bot Management**
- Custom `BotManager` class using Node.js EventEmitter pattern
- Each bot runs as a Discord.js client instance within the same process
- **Discord.js v14** for Discord API integration with gateway intents
- Bot lifecycle management: start, stop, restart, kill operations
- Real-time log collection (max 100 logs per bot in memory)
- Metrics collection every 15 seconds (CPU, memory, disk usage)

**Authentication & Session Management**
- **Replit Auth** integration using OpenID Connect (OIDC)
- **Passport.js** with openid-client strategy
- Session storage using **express-session** with PostgreSQL backend (connect-pg-simple)
- Session TTL: 7 days
- Secure cookies (httpOnly, secure flags enabled)

**API Design**
- RESTful endpoints prefixed with `/api`
- Authentication middleware (`isAuthenticated`) protecting all bot management routes
- CRUD operations for bots, files, environment variables, packages, assets
- Multipart form data support using **multer** for file uploads
- JSON request/response format

### Data Storage Solutions

**Database**
- **PostgreSQL** via Neon serverless (@neondatabase/serverless)
- **Drizzle ORM** for type-safe database operations
- WebSocket-based connection pooling for serverless compatibility

**Schema Design**
- `users` table: User profiles from Replit Auth (id, email, firstName, lastName, profileImageUrl)
- `sessions` table: Express session storage (required for authentication)
- `bots` table: Discord bot configurations (id, userId, name, token, description, status, entryPoint, createdAt, updatedAt)
- `bot_files` table: Bot source code files (id, botId, filename, path, content, size)
- `bot_env_vars` table: Environment variables per bot (id, botId, key, value - encrypted)
- `bot_runtime_configs` table: Resource limits (cpuLimit, memoryLimit, diskLimit, alwaysOn)
- `bot_runtime_metrics` table: Historical resource usage data (cpuPercent, memoryMb, diskMb, collectedAt)
- `bot_assets` table: Uploaded assets (images, audio files)
- `bot_packages` table: npm package dependencies (name, version, source)

**Data Relationships**
- One-to-many: User → Bots
- One-to-many: Bot → Files, EnvVars, RuntimeConfigs, RuntimeMetrics, Assets, Packages
- All bot-related data cascades on bot deletion

### External Dependencies

**Third-Party Services**
- **Discord API**: Bot authentication and gateway connection via discord.js
- **Replit Auth**: User authentication and identity management (OIDC provider)
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Inter and JetBrains Mono typography

**Development Tools**
- **Replit-specific plugins**: 
  - `@replit/vite-plugin-runtime-error-modal`: Development error overlay
  - `@replit/vite-plugin-cartographer`: Code navigation
  - `@replit/vite-plugin-dev-banner`: Development mode indicator

**NPM Packages**
- UI Components: All @radix-ui/* primitives, cmdk, class-variance-authority
- Forms: react-hook-form, @hookform/resolvers, zod (validation)
- Date handling: date-fns
- Utilities: clsx, tailwind-merge, nanoid, memoizee

**Build & Deployment**
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking (noEmit mode, delegated to build tools)
- Build output: `dist/public` (frontend), `dist/index.js` (backend)

**Environment Variables Required**
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Express session encryption key
- `ISSUER_URL`: Replit OIDC issuer URL (default: https://replit.com/oidc)
- `REPL_ID`: Replit application identifier
- `NODE_ENV`: Environment mode (development/production)