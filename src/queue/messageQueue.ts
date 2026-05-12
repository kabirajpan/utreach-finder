import { whatsapp } from '../services/whatsapp';

interface MessageJob {
  id: string;
  phone: string;
  templateName: string;
  language: string;
  variables: string[];
  status: 'queued' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
}

const queue: MessageJob[] = [];
export const logs: MessageJob[] = [];
let isProcessing = false;

export const addToQueue = (phone: string, templateName: string, language: string, variables: string[] = []) => {
  const job: MessageJob = {
    id: Math.random().toString(36).substring(7),
    phone,
    templateName,
    language,
    variables,
    status: 'queued',
    sentAt: new Date().toISOString()
  };
  queue.push(job);
  logs.push(job);
  
  // Trigger processing if not already running
  if (!isProcessing) {
    processQueue();
  }
  
  return job;
};

export const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const job = queue.shift();
  
  if (job) {
    try {
      console.log(`[Queue] Processing message to ${job.phone}...`);
      await whatsapp.sendTemplateMessage(job.phone, job.templateName, job.variables, job.language);
      job.status = 'sent';
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
      console.error(`[Queue] Failed to send to ${job.phone}:`, error.message);
    }
  }
  
  isProcessing = false;
  
  // Continue processing next item immediately
  if (queue.length > 0) {
    setTimeout(processQueue, 100);
  }
};
