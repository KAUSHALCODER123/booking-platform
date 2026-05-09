# Expert Session Booking System — Master Context

## What We're Building
A **Real-Time Expert Session Booking System** — full-stack TypeScript web app.
Users browse experts, view availability, and book sessions. Slots update live via Socket.io.

## Deadline
**10th May 2026 by 2 PM**

## Tech Stack (NON-NEGOTIABLE)
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io (typed) |
| HTTP client | Axios |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Validation | Zod (shared schemas) |
| Build | tsc + ts-node-dev (server), Vite (client) |

## Submission Requirements
- GitHub repository link
- One video of the application working
- Deployment optional but preferred

---

## Screens Required

### 1. Expert Listing Screen (`/`)
- Display experts: name, category, experience, rating
- Search by name
- Filter by category
- Pagination
- Proper loading & error states

### 2. Expert Detail Screen (`/experts/:id`)
- Show all expert details
- Display available time slots grouped by date
- Slots update in **real-time** when booked by another user
- Booked slots visually disabled

### 3. Booking Screen (`/experts/:id/book`)
Form fields: Name, Email, Phone, Date, Time Slot, Notes
- Client + server validation via Zod
- Success message after booking
- Booked slot disabled immediately

### 4. My Bookings Screen (`/bookings`)
- User enters email → fetches their bookings
- Display status: Pending / Confirmed / Completed

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/experts` | List with pagination + filter |
| GET | `/api/experts/:id` | Single expert + slots |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/:id/status` | Update status |
| GET | `/api/bookings?email=` | Get by email |

---

## Critical Requirements

### Prevent Double Booking
- MongoDB unique compound index on `{ expertId, date, timeSlot }`
- Atomic `findOneAndUpdate` — never check-then-insert
- Return 409 Conflict if slot taken

### Real-Time Updates
- Socket.io shares the http server with Express
- Booking success → emit `slot-booked` to room `expert-{expertId}`
- Client joins room on mount, leaves on unmount
- On event → disable that slot in UI without reload

### Error Handling
- All responses: `{ success: boolean, data?: T, error?: string }`
- 400 validation / 404 not found / 409 conflict / 500 server
- All secrets via `.env` — never hardcoded

---

## Environment Variables

### `server/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expertbooking
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### `client/.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Full Folder Structure

```
/
├── shared/
│   └── types.ts               ← shared TS types + Zod schemas (imported by both)
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExpertCard.tsx
│   │   │   ├── SlotPicker.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── pages/
│   │   │   ├── ExpertListPage.tsx
│   │   │   ├── ExpertDetailPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   └── MyBookingsPage.tsx
│   │   ├── hooks/
│   │   │   ├── useExperts.ts
│   │   │   ├── useExpert.ts
│   │   │   └── useSocket.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── socket.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── expertController.ts
│   │   │   └── bookingController.ts
│   │   ├── models/
│   │   │   ├── Expert.ts
│   │   │   └── Booking.ts
│   │   ├── routes/
│   │   │   ├── expertRoutes.ts
│   │   │   └── bookingRoutes.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts
│   │   ├── socket/
│   │   │   └── socketManager.ts
│   │   ├── utils/
│   │   │   └── seedData.ts
│   │   └── index.ts
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```