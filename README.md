# SyncBoard

A real-time collaborative Kanban board application built with the MERN stack. Teams can create boards, manage tasks across custom columns, and see each other's changes update live.

**Live Demo:** https://syncboard-rose.vercel.app  
**API:** https://syncboard-api-i7kz.onrender.com

> ⚠️ The server runs on Render's free tier and may take up to 50 seconds to wake up after inactivity.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Real-Time | Socket.io |
| Auth | JWT + Refresh Tokens (httpOnly cookies) |
| Testing | Jest + Supertest (server), Vitest + React Testing Library (client) |
| CI/CD | GitHub Actions |
| Containerisation | Docker + Docker Compose |
| Deployment | Vercel (client), Render (server) |

---

## Features

- **Authentication** — Register, login, JWT access tokens (15 min) with httpOnly refresh tokens (7 days), token rotation
- **Multi-Board Workspace** — Create, rename, and delete boards with colour coding
- **Custom Columns** — Add, rename, reorder and delete columns (replaces hardcoded To Do / Doing / Done)
- **Task Management** — Create tasks with title, description, assignee, due date and priority
- **Drag & Drop** — Reorder tasks within and across columns using @dnd-kit, order persisted to DB
- **Real-Time Collaboration** — Socket.io syncs task, column and board changes across all connected clients instantly
- **Board Members** — Invite teammates by email, accept/decline via notification panel, remove members
- **Notifications** — In-app bell icon with unread badge, real-time delivery via WebSockets
- **Presence Indicators** — See who else is viewing the same board
- **Comments & Activity** — Per-task comment threads and automatic activity log timeline
- **Search & Filters** — Live search by title/assignee, filter by priority and due date, sort by multiple criteria
- **Due Date Styling** — Overdue tasks highlighted in red, due today in amber
- **Offline Support** — Tasks cached in localStorage, queued actions sync when connection restores
- **Conflict Detection** — Version numbers on tasks, 409 returned on concurrent edit conflicts

---

## Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│   React Client  │ ─────────────► │  Express API    │
│   (Vercel)      │ ◄───────────── │  (Render)       │
│                 │    WebSocket   │                 │
│  React 19       │ ◄────────────► │  Socket.io      │
│  Vite           │                │  Mongoose       │
│  @dnd-kit       │                │  JWT Auth       │
└─────────────────┘                └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │  MongoDB Atlas  │
                                   │  (Cloud)        │
                                   └─────────────────┘
```

### Folder Structure

```
syncboard/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/               # API request functions
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth + Notification providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Route-level page components
│   │   ├── reducers/          # useReducer state logic
│   │   ├── socket/            # Socket.io client singleton
│   │   └── utils/             # localStorage cache helpers
│   ├── Dockerfile
│   └── vitest.config.js
│
├── server/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Environment config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routers
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── services/          # Business logic
│   │   ├── socket/            # Socket.io handler
│   │   └── tests/             # Jest + Supertest test suites
│   ├── Dockerfile
│   └── jest.config.js
│
├── docker-compose.yml         # Local multi-service setup
└── .github/
    └── workflows/
        └── ci.yml             # GitHub Actions CI pipeline
```

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PATCH  /api/auth/me
PATCH  /api/auth/password
DELETE /api/auth/me

GET    /api/boards
POST   /api/boards
GET    /api/boards/:id
PATCH  /api/boards/:id
DELETE /api/boards/:id
GET    /api/boards/:id/members
POST   /api/boards/:id/invite
DELETE /api/boards/:id/members/:userId

GET    /api/boards/:boardId/columns
POST   /api/boards/:boardId/columns
POST   /api/boards/:boardId/columns/reorder
PATCH  /api/boards/:boardId/columns/:columnId
DELETE /api/boards/:boardId/columns/:columnId

GET    /api/boards/:boardId/tasks
POST   /api/boards/:boardId/tasks
POST   /api/boards/:boardId/tasks/reorder
GET    /api/boards/:boardId/tasks/:id
PATCH  /api/boards/:boardId/tasks/:id
DELETE /api/boards/:boardId/tasks/:id

GET    /api/boards/:boardId/tasks/:id/comments
POST   /api/boards/:boardId/tasks/:id/comments
DELETE /api/boards/:boardId/tasks/:id/comments/:commentId
GET    /api/boards/:boardId/tasks/:id/activity

GET    /api/notifications
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read
POST   /api/notifications/:id/accept
POST   /api/notifications/:id/decline
```

---

## WebSocket Events

```
CLIENT → SERVER:
  board:join       { boardId, userName }
  board:leave      { boardId }

SERVER → CLIENT (board room):
  task:created     task object
  task:updated     task object
  task:deleted     { taskId }
  task:reordered   { orderedIds }
  column:created   column object
  column:updated   column object
  column:deleted   { columnId }
  column:reordered { orderedIds }
  board:presence   [{ userId, name }]
  board:deleted    { boardId }
  board:member_added   { member }
  board:member_removed { userId }

SERVER → CLIENT (personal room):
  notify:new       notification object
  boards:refresh   {}
  board:deleted    { boardId }
```

---

## Local Setup

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Docker Desktop (optional, for Docker setup)

### Standard Setup

```bash
# Clone the repo
git clone https://github.com/HotChicken9405/syncboard.git
cd syncboard

# Server setup
cd server
cp .env.example .env        # fill in your values
npm install
npm run dev

# Client setup (new terminal)
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

### Environment Variables (server/.env)

```
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/syncboard
JWT_SECRET=your-secret-key-min-32-characters
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Docker Setup

```bash
# In the root syncboard/ folder
cp .env.example .env        # fill in your values
docker-compose up --build
```

Open `http://localhost:5173`

---

## Running Tests

```bash
# Server tests (19 tests)
cd server && npm test

# Client tests (18 tests)
cd client && npm test
```

The CI pipeline runs both test suites automatically on every push to `main` and `dev`.

---

## Security

- JWT access tokens (15 min expiry) stored in memory only
- Refresh tokens (7 days) stored in httpOnly cookies — inaccessible to JavaScript
- Token rotation on every refresh
- Helmet.js HTTP security headers
- Rate limiting — 10 req/15min on auth routes, 200 req/15min on API routes
- MongoDB sanitization against NoSQL injection
- Zod input validation on all routes
- CORS restricted to allowed origins
- Password strength enforcement (min 8 chars, uppercase, number, special char)

---

## Known Limitations

- Render free tier spins down after inactivity — first request may take up to 50 seconds
- No email verification on registration
- No email notifications for overdue tasks
- File attachments not supported
- Mobile experience not fully optimised
- Board export (CSV/PDF) not implemented

---

## Milestones

| # | Milestone | Description |
|---|-----------|-------------|
| M1 | Static Front-End | React scaffold, Board/Column/TaskCard UI, mock data |
| M2 | Working REST API | Express CRUD, JWT auth, wired to real endpoints |
| M3 | Persistence & Offline | MongoDB, Mongoose, localStorage caching, conflict detection |
| M4 | Test Suite & CI | Jest + Supertest, Vitest + RTL, GitHub Actions |
| M5 | Real-Time & DevOps | Socket.io, Docker Compose, deployed to Vercel + Render |
