import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistration extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: 'Registered' | 'Confirmed' | 'Cancelled';
  ticketId: string;
  seatTier?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: ['Registered', 'Confirmed', 'Cancelled'],
      default: 'Registered',
      required: true,
    },
    ticketId: { type: String, required: true, unique: true },
    seatTier: { type: String, default: 'Standard Admission' },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>('Registration', RegistrationSchema);
