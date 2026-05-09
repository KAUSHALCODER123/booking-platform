import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  expertId: mongoose.Types.ObjectId;
  userEmail: string;
  date: string;
  slot: string;
  status: string;
}

const bookingSchema: Schema = new Schema({
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  userEmail: { type: String, required: true },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

// Compound unique index to prevent double booking
bookingSchema.index({ expertId: 1, date: 1, slot: 1 }, { unique: true });

export default mongoose.model<IBooking>('Booking', bookingSchema);
