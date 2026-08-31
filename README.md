# syncboard

-Full-stack collaborative Kanban board

## Prerequisites

- Node.js 20 LTS
- MongoDB Community Server 8.0+
- npm (comes with Node.js)
- Git

## How to Run

### 1. Start MongoDB

Open a terminal:

```bash
mongod

### 2. Start the Backend Server
cd server
npm install
npm run dev

### 3. Start the Frontend Client
cd client
npm install
npm run dev

Create server/.env:
PORT=4000
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/syncboard
```
