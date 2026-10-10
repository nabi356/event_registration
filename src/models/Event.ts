import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  category: string;
  startTime: Date;
  endTime: Date;
  venue: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  capacity: number;
  accentColor?: string;
  imageUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'General Event', trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radiusMeters: { type: Number, default: 50 },
    capacity: { type: Number, required: true, min: 1 },
    accentColor: { type: String, default: '#DC2626' },
    imageUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
