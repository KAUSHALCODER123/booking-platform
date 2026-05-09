import mongoose, { Document, Schema } from 'mongoose';

export interface IExpert extends Document {
  name: string;
  expertise: string;
  bio: string;
  availableSlots: string[];
}

const expertSchema: Schema = new Schema({
  name: { type: String, required: true },
  expertise: { type: String, required: true },
  bio: { type: String, required: true },
  availableSlots: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IExpert>('Expert', expertSchema);
