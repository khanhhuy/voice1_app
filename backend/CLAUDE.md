# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `pnpm dev` - runs the TypeScript backend with hot reloading using tsx watch
- **Package manager**: This project uses `pnpm` as the package manager

## Project Architecture

This is a TypeScript Express.js backend for a project named "spectra-backend" that appears to be part of an application system.

### Key Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with CORS enabled for frontend at localhost:5173
- **Database**: PostgreSQL with Sequelize ORM (sequelize-typescript)
- **Authentication**: Passport.js with Google OAuth 2.0 strategy
- **Caching**: Redis
- **Process Management**: tsx for development hot reloading

### Project Structure
- `src/index.ts` - Main application entry point with Express server setup
- `src/types.ts` - TypeScript type definitions (currently empty)
- Port: 3006 (hardcoded)

### Key Dependencies
- Express.js with middleware for JSON parsing (20MB limit), CORS, and Passport authentication
- Database: PostgreSQL via Sequelize with TypeScript decorators enabled
- External services: Model Context Protocol SDK, JWT tokens, Redis caching
- Utilities: Lodash, Luxon for date handling, UUID generation
- Groq for LLM inference via groq-sdk

### TypeScript Configuration
- Uses @tsconfig/node20 base configuration
- Path aliases configured: `@/*` maps to `./src/*`
- Decorators enabled for Sequelize models
- Cross-project reference: `@/app/*` points to `../pagefold-app/src/*`


## Technical docs
Detailed technical documentation for each module will be placed in /docs