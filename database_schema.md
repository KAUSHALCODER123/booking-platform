# Database Schema — Mongoose Models (TypeScript)

## Expert Model (`server/src/models/Expert.ts`)

```typescript
import mongoose, { Document, Schema } from 'mongoose';
import type { ExpertCategory } from '@shared/types';

export interface ISlot {
  _id: mongoose.Types.ObjectId;
  date: string;
  timeSlot: string;
  isBooked: boolean;
}

export interface IExpert extends Document {
  name: string;
  category: ExpertCategory;
  experience: number;
  rating: number;
  bio: string;
  profileImage?: string;
  hourlyRate?: number;
  availableSlots: ISlot[];
  createdAt: Date;
}

const SlotSchema = new Schema<ISlot>({
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const ExpertSchema = new Schema<IExpert>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Design', 'Marketing', 'Finance', 'Legal', 'Health', 'Education', 'Other'],
    },
    experience: { type: Number, required: true },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    bio: { type: String, default: '' },
    profileImage: { type: String },
    hourlyRate: { type: Number },
    availableSlots: [SlotSchema],
  },
  { timestamps: true }
);

// Index for fast search + filter
ExpertSchema.index({ name: 'text' });
ExpertSchema.index({ category: 1 });

export default mongoose.model<IExpert>('Expert', ExpertSchema);
```

---

## Booking Model (`server/src/models/Booking.ts`)

```typescript
import mongoose, { Document, Schema } from 'mongoose';
import type { BookingStatus } from '@shared/types';

export interface IBooking extends Document {
  expertId: mongoose.Types.ObjectId;
  expertName: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: BookingStatus;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    expertName: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// ─── CRITICAL: Unique compound index prevents double booking ─────────────────
// This is the database-level race condition guard.
// Even if two requests hit simultaneously, MongoDB enforces uniqueness.
BookingSchema.index(
  { expertId: 1, date: 1, timeSlot: 1 },
  { unique: true }
);

// Index for fast email lookup (My Bookings screen)
BookingSchema.index({ email: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
```

---

## Seed Data (`server/src/utils/seedData.ts`)

```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expert from '../models/Expert';

dotenv.config();

const SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

function getNext7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });
}

function buildSlots() {
  const days = getNext7Days();
  return days.flatMap(date =>
    SLOTS.map(timeSlot => ({ date, timeSlot, isBooked: false }))
  );
}

const experts = [
  {
    name: 'Priya Sharma',
    category: 'Technology',
    experience: 8,
    rating: 4.9,
    bio: 'Full-stack engineer specialising in React, Node, and cloud architecture.',
    hourlyRate: 2000,
    availableSlots: buildSlots(),
  },
  {
    name: 'Rahul Mehta',
    category: 'Finance',
    experience: 12,
    rating: 4.7,
    bio: 'Chartered accountant with expertise in startup fundraising and tax planning.',
    hourlyRate: 3000,
    availableSlots: buildSlots(),
  },
  {
    name: 'Anika Patel',
    category: 'Design',
    experience: 6,
    rating: 4.8,
    bio: 'Product designer focused on mobile UX and design systems.',
    hourlyRate: 1800,
    availableSlots: buildSlots(),
  },
  {
    name: 'Vikram Nair',
    category: 'Marketing',
    experience: 10,
    rating: 4.6,
    bio: 'Growth marketer with D2C and SaaS experience across Indian markets.',
    hourlyRate: 2500,
    availableSlots: buildSlots(),
  },
  {
    name: 'Shreya Joshi',
    category: 'Legal',
    experience: 9,
    rating: 4.5,
    bio: 'Corporate lawyer specialising in startup compliance and IP.',
    hourlyRate: 3500,
    availableSlots: buildSlots(),
  },
  {
    name: 'Arjun Kapoor',
    category: 'Health',
    experience: 15,
    rating: 4.9,
    bio: 'Sports medicine physician and certified nutrition consultant.',
    hourlyRate: 2200,
    availableSlots: buildSlots(),
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  await Expert.deleteMany({});
  await Expert.insertMany(experts);
  console.log(`✅ Seeded ${experts.length} experts`);
  await mongoose.disconnect();
}

seed().catch(console.error);
```

## Run seed:
```bash
cd server && npx ts-node src/utils/seedData.ts
```