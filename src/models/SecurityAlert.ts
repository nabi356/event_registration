import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISecurityAlert extends Document {
  userId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  type: string;
  note: string;
  timestamp: Date;
  expiresAt: Date;
}

const SecurityAlertSchema = new Schema<ISecurityAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    type: { type: String, required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// TTL Index for Auto-Clear (Data Retention)
SecurityAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SecurityAlertSchema.index({ timestamp: -1 });

export const SecurityAlert: Model<ISecurityAlert> =
  mongoose.models.SecurityAlert ||
  mongoose.model<ISecurityAlert>('SecurityAlert', SecurityAlertSchema);
