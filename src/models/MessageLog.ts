import { Schema, model } from 'mongoose';

const messageLogSchema = new Schema({
  phone: { type: String, required: true },
  templateName: { type: String, required: true },
  variables: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ['queued', 'sent', 'failed'], 
    default: 'queued' 
  },
  wamid: { type: String },
  error: { type: String },
  sentAt: { type: Date }
});

export const MessageLog = model('MessageLog', messageLogSchema);
