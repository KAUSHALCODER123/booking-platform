# Shared Types & Zod Schemas (`shared/types.ts`)

This file lives at the repo root `/shared/types.ts` and is imported by both client and server.
Both `tsconfig.json` files must include a path alias pointing to it.

```typescript
import { z } from 'zod';

// ─── Slot ────────────────────────────────────────────────────────────────────

export interface Slot {
  _id: string;
  date: string;       // "YYYY-MM-DD"
  timeSlot: string;   // "10:00 AM"
  isBooked: boolean;
}

// ─── Expert ──────────────────────────────────────────────────────────────────

export interface Expert {
  _id: string;
  name: string;
  category: ExpertCategory;
  experience: number;       // years
  rating: number;           // 0–5
  bio: string;
  profileImage?: string;
  hourlyRate?: number;
  availableSlots: Slot[];
  createdAt: string;
}

export type ExpertCategory =
  | 'Technology'
  | 'Design'
  | 'Marketing'
  | 'Finance'
  | 'Legal'
  | 'Health'
  | 'Education'
  | 'Other';

export const EXPERT_CATEGORIES: ExpertCategory[] = [
  'Technology', 'Design', 'Marketing', 'Finance',
  'Legal', 'Health', 'Education', 'Other',
];

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed';

export interface Booking {
  _id: string;
  expertId: string;
  expertName: string;
  name: string;
  email: string;
  phone: string;
  date: string;       // "YYYY-MM-DD"
  timeSlot: string;   // "10:00 AM"
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

// ─── Zod Schemas (validation — used on both server and client) ───────────────

export const CreateBookingSchema = z.object({
  expertId: z.string().min(1, 'Expert ID required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlot: z.string().min(1, 'Time slot required'),
  notes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const UpdateStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed']),
});

export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;

// ─── API Response wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Query Params ────────────────────────────────────────────────────────────

export interface ExpertQuery {
  search?: string;
  category?: ExpertCategory;
  page?: number;
  limit?: number;
}

// ─── Socket.io Event Types ───────────────────────────────────────────────────

export interface SlotBookedPayload {
  expertId: string;
  date: string;
  timeSlot: string;
  slotId: string;
}

// Server → Client events
export interface ServerToClientEvents {
  'slot-booked': (payload: SlotBookedPayload) => void;
}

// Client → Server events
export interface ClientToServerEvents {
  'join-expert-room': (expertId: string) => void;
  'leave-expert-room': (expertId: string) => void;
}
```

## Path alias setup

### `server/tsconfig.json` paths section:
```json
{
  "paths": {
    "@shared/*": ["../shared/*"]
  }
}
```

### `client/tsconfig.json` paths section:
```json
{
  "paths": {
    "@shared/*": ["../shared/*"]
  }
}
```

### `client/vite.config.ts` alias:
```typescript
import path from 'path';
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, '../shared'),
  }
}
```

## Import example
```typescript
// In any server or client file:
import type { Expert, Booking, SlotBookedPayload } from '@shared/types';
import { CreateBookingSchema } from '@shared/types';
```