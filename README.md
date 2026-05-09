# Expert Booking Platform

This project is a full-stack MERN application that allows users to browse experts and book available slots.

## Setup Instructions

### 1. Database Configuration
Ensure your MongoDB credentials are set up in `server/.env`.
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Booking?retryWrites=true&w=majority
```

### 2. Running the Server
```bash
cd server
npm install
npm run seed  # Optional: Seed the database with dummy experts
npm start
```

### 3. Running the Client
The client requires a `.env` file containing `VITE_API_URL=http://localhost:5000` or whichever URL your backend is running on.
```bash
cd client
npm install
npm run dev
```

## Architecture

- **Backend**: Express + TypeScript + MongoDB
- **Frontend**: React + Vite + TailwindCSS + TypeScript
- **Real-Time updates**: Socket.io is used to broadcast slot booking events to connected clients, allowing real-time disabling of booked slots without requiring a page refresh.

## Concurrency and Race Conditions

Double-booking is prevented robustly at the database level.
The `Booking` schema in MongoDB employs a compound unique index on `{ expertId: 1, date: 1, slot: 1 }`.
If two users attempt to book the same slot at the precise same moment, MongoDB natively throws an `11000` error (Duplicate Key) for the second transaction. The server intercepts this error and gracefully returns a `409 Conflict` status, which is displayed to the user via toast notifications.
