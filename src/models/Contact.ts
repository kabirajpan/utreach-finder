import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  variables: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const Contact = model('Contact', contactSchema);
