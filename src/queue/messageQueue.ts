import { whatsapp } from '../services/whatsapp';

interface MessageJob {
  phone: string;
  templateName: string;
  variables: string[];
}

class MessageQueue {
  private queue: MessageJob[] = [];
  private isProcessing = false;
  private delay = 100; // 100ms delay between messages (10 messages per second)

  enqueue(job: MessageJob) {
    this.queue.push(job);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const job = this.queue.shift();

    if (job) {
      try {
        console.log(`Sending message to ${job.phone}...`);
        const result = await whatsapp.sendTemplateMessage(
          job.phone,
          job.templateName,
          job.variables
        );
        console.log(`Success for ${job.phone}:`, result.messages?.[0]?.id);
      } catch (error: any) {
        console.error(`Failed to send to ${job.phone}:`, error.message);
      }
    }

    // Wait and process next
    setTimeout(() => this.processQueue(), this.delay);
  }
}

export const messageQueue = new MessageQueue();
