import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  enrollmentNo: string;
  university: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'management';
  faceEmbedding?: number[];
  faceUpdatedAt?: Date;
  deviceId?: string;
  department?: string;
  enrolledYear?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    enrollmentNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    university: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'management'], default: 'student', required: true },
    faceEmbedding: { type: [Number], default: undefined },
    faceUpdatedAt: { type: Date, default: undefined },
    deviceId: { type: String, default: undefined },
    department: { type: String, default: 'Computer Science & Engineering' },
    enrolledYear: { type: String, default: 'Class of 2027' },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation in Next.js development
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
