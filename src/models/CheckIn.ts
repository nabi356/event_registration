import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICheckIn extends Document {
  userId?: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  result: 'verified' | 'flagged' | 'denied';
  reason?: string;
  method: 'face' | 'qr' | 'rapid' | 'manual';
  timestamp: Date;
  expiresAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    result: {
      type: String,
      enum: ['verified', 'flagged', 'denied'],
      required: true,
    },
    reason: { type: String },
    method: {
      type: String,
      enum: ['face', 'qr', 'rapid', 'manual'],
      default: 'face',
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// TTL Index for Auto-Clear (Data Retention)
CheckInSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CheckInSchema.index({ eventId: 1, timestamp: -1 });
CheckInSchema.index({ userId: 1, eventId: 1, result: 1 });

export const CheckIn: Model<ICheckIn> =
  mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
