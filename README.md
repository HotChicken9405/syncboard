# syncboard

-Full-stack collaborative Kanban board

## Prerequisites

- Node.js 20 LTS
- MongoDB Community Server 8.0+
- npm (comes with Node.js)
- Git

## How to Run

### 1. Start MongoDB

Open a terminal: <br>
mongod

### 2. Start the Backend Server

cd server <br>
npm install <br>
npm run dev

### 3. Start the Frontend Client

cd client <br>
npm install <br>
npm run dev <br>

Create server/.env: <br>
PORT=4000 <br>
JWT_SECRET=your-secret-key-here <br>
MONGODB_URI=mongodb://localhost:27017/syncboard <br>
