import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  enrollmentNo: string;
  university: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'management';
  faceEmbedding?: number[];
  faceProviderId?: string;
  faceProvider?: string;
  embeddingSource?: 'neural' | 'heuristic' | 'legacy';
  biometricConsent?: boolean;
  biometricConsentDate?: Date;
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
    faceProviderId: { type: String, default: undefined },
    faceProvider: { type: String, default: 'face-api' },
    // Which extractor produced faceEmbedding. Untagged (pre-existing) records are
    // read as 'legacy' and never cross-compared with live neural scans.
    embeddingSource: {
      type: String,
      enum: ['neural', 'heuristic', 'legacy'],
      default: undefined,
    },
    biometricConsent: { type: Boolean, default: false },
    biometricConsentDate: { type: Date, default: undefined },
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
