# CardStorm - Real-Time Multiplayer Card Game

## Overview

CardStorm is a real-time multiplayer card game inspired by UNO, built for 3-4 players. The application features competitive card gameplay with special action cards (Skip, Reverse, Draw 2, Wild cards), live game state synchronization, player matchmaking, and leaderboard rankings.

The project is a full-stack TypeScript application with a React frontend using shadcn/ui components, an Express backend with Socket.IO for real-time communication, and PostgreSQL database for persistent storage. It includes Replit authentication for user management and game statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for UI components
- **Vite** for build tooling and development server
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Socket.IO Client** for real-time game communication
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with custom gaming-focused design tokens

**Component Structure:**
- UI components follow atomic design pattern (ui components, game components, page components)
- Custom hooks for authentication (`useAuth`), socket management (`useSocket`), and mobile detection
- Type-safe socket events and game state interfaces defined in shared schema
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**State Management:**
- Server state managed through React Query with custom query client
- Real-time game state synchronized via Socket.IO events
- Local UI state managed with React hooks
- Session-based authentication with cookie credentials

**Design System:**
- Dark mode primary with gaming aesthetic (inspired by Hearthstone, UNO mobile)
- Custom color palette for card colors (red, blue, green, yellow, wild)
- Vibrant game element colors with competitive clarity
- Responsive design with mobile breakpoint at 768px
- 60fps animation performance target

### Backend Architecture

**Technology Stack:**
- **Express.js** server with TypeScript
- **Socket.IO** for WebSocket-based real-time communication
- **Drizzle ORM** with Neon serverless PostgreSQL driver
- **Passport.js** with OpenID Connect for Replit authentication
- **Express Session** with PostgreSQL session store

**Server Organization:**
- `server/index.ts` - Express application setup and middleware
- `server/routes.ts` - HTTP API routes and Socket.IO server initialization
- `server/gameEngine.ts` - Core game logic and state management
- `server/storage.ts` - Database abstraction layer
- `server/replitAuth.ts` - Authentication configuration and strategies
- `server/db.ts` - Database connection and Drizzle setup

**Real-Time Communication:**
- Socket.IO server attached to HTTP server
- Type-safe socket events for client-server communication
- Socket data includes userId, username, avatar, and current gameId
- Event handlers for game actions (create, join, play card, draw, etc.)
- Game state broadcasts to all players in a game room

**Game Engine:**
- In-memory game state management with Map structure
- Card deck generation and shuffling
- Turn-based gameplay with direction support (clockwise/counterclockwise)
- Special card logic (Skip, Reverse, Draw 2, Wild, Wild Draw 4)
- Win condition detection and game completion handling

**Session Management:**
- PostgreSQL-backed sessions for persistence
- 1-week session TTL
- HTTP-only, secure cookies for production
- Session secret from environment variables

### Data Storage

**Database:**
- **PostgreSQL** via Neon serverless (WebSocket-compatible)
- **Drizzle ORM** for type-safe queries and schema management
- Connection pooling with `@neondatabase/serverless`

**Schema Design:**

1. **sessions** table (required for Replit Auth)
   - Stores Express session data
   - Indexed on expiration for cleanup

2. **users** table (required for Replit Auth)
   - Stores user profiles from OpenID Connect
   - Fields: id, email, firstName, lastName, profileImageUrl
   - Timestamps for created/updated tracking

3. **gameStats** table
   - Per-user game statistics
   - Tracks: gamesPlayed, gamesWon, totalCardsPlayed
   - Foreign key reference to users table

4. **matchHistory** table
   - Historical record of completed games
   - Stores: winnerId, loserIds, gameDuration, cardsPlayed, timestamp
   - Enables match history queries per user

**Storage Layer:**
- Abstract `IStorage` interface for database operations
- `DatabaseStorage` implementation with Drizzle
- User operations: upsert (for auth integration), get
- Stats operations: create/update, increment counters
- Leaderboard queries: join users and stats, order by wins
- Match history: create records, query by userId

### External Dependencies

**Authentication:**
- **Replit Auth** (mandatory) - OpenID Connect integration
  - Issuer URL: `https://replit.com/oidc` (configurable via env)
  - Client credentials from `REPL_ID` environment variable
  - User profile data synchronized to database
  - Session-based authentication flow

**Database:**
- **Neon PostgreSQL** - Serverless PostgreSQL database
  - Connection via `DATABASE_URL` environment variable
  - WebSocket transport for serverless compatibility
  - Drizzle Kit for schema migrations

**Third-Party Libraries:**
- **Socket.IO** - Real-time bidirectional event-based communication
- **Radix UI** - Accessible component primitives for shadcn/ui
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Async state management
- **Passport.js** - Authentication middleware
- **OpenID Client** - OAuth 2.0/OIDC client implementation
- **React Hook Form** + **Zod** - Form validation

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Session encryption key (required)
- `REPL_ID` - Replit application identifier (required for auth)
- `REPLIT_DOMAINS` - Allowed domains for authentication
- `ISSUER_URL` - OpenID Connect issuer (defaults to Replit)
- `NODE_ENV` - Environment mode (development/production)

**Build & Development:**
- **Vite** plugins for development (runtime error overlay, Replit cartographer, dev banner)
- **esbuild** for production server bundling
- **tsx** for TypeScript execution in development
- **Drizzle Kit** for database schema management