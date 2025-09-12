# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProjectaLogs is a 3D printing project management platform with a NestJS backend API and React+Refine frontend dashboard. It integrates with Moonraker/Klipper printers via a Python component to track print jobs and associate them with clients and projects.

## Architecture

- **Backend**: NestJS TypeScript API (port 3000)
- **Frontend**: React + Refine dashboard (dev port 5173, prod served by backend)
- **Database**: SQLite (stored in `./data/projectalogs-db.sqlite`)
- **Printer Integration**: `projectalogs.py` Moonraker component (experimental)
- **Static Files**: Served from `public/` directory by backend

Core entities: Project, Client, Job, Printer (all with TypeORM entities in respective module directories)

## Development Commands

### Backend (NestJS)
- **Start development**: `npm run start:dev`
- **Build**: `npm run build` (builds both backend and frontend)
- **Production**: `npm run start:prod`
- **Testing**: `npm run test`, `npm run test:watch`, `npm run test:e2e`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

### Frontend (React + Refine)
Navigate to `dashboard/` directory:
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`

### Combined Development
- **Start all services**: `npm run all` or `./start_all.sh` (uses tmux)
- The tmux script creates three panes: backend, frontend, and shell

### Testing
- **Unit tests**: `npm run test`
- **E2E tests**: `npm run test:e2e`
- **Coverage**: `npm run test:cov`

## Project Structure

### Backend (`src/`)
- `main.ts` - Application entry point
- `app.module.ts` - Root module with TypeORM SQLite configuration
- `project/` - Project management module
- `client/` - Client management module
- `job/` - Print job tracking module
- `printer/` - Printer management module
- `thumbnail/` - Thumbnail handling utilities

Each module follows NestJS conventions with:
- `*.controller.ts` - REST API endpoints
- `*.service.ts` - Business logic
- `entities/*.entity.ts` - TypeORM entity definitions
- `dto/` - Data transfer objects

### Frontend (`dashboard/`)
Built with React, TypeScript, and Refine framework using Ant Design components.

### Data
- SQLite database stored in `./data/` directory
- Thumbnails and uploads stored in `public/` directory

## Configuration

### Backend
- Environment variables in `.env`
- TypeScript configuration allows flexible typing (noImplicitAny: false)
- ESLint with TypeScript and Prettier integration
- Database auto-synchronization enabled for development

### Frontend
- Vite build tool
- TypeScript strict mode
- Refine framework with Ant Design
- API base URL configurable via environment

## Development Notes

- Backend serves frontend static files in production
- Database synchronization is enabled (dev convenience)
- Both backend and frontend have separate package.json files
- Moonraker integration component (`projectalogs.py`) requires manual installation on printer
- Uses conventional REST API patterns with `/api` prefix