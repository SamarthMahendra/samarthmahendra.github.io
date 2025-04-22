import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  datetime: Date;
  participants: string[];
  status: 'pending' | 'confirmed' | 'declined';
  requestedBy: string;
  confirmedBy?: string;
}

const MeetingSchema: Schema = new Schema({
  title: { type: String, required: true },
  datetime: { type: Date, required: true },
  participants: [{ type: String, required: true }],
  status: { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' },
  requestedBy: { type: String, required: true },
  confirmedBy: { type: String },
});

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
