import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  name: string;
  email: string;
  about: string;
  skills: string[];
  // Add more fields as needed
}

const ProfileSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  about: { type: String, required: true },
  skills: [{ type: String }],
});

export default mongoose.model<IProfile>('Profile', ProfileSchema);
