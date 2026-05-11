import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { config } from './config/env';
import messages from './routes/messages';
import webhook from './routes/webhook';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
// We'll keep the messages route but make it stateless
app.route('/messages', messages);
app.route('/webhook', webhook);

// Health check
app.get('/', (c) => c.text('WhatsApp Bulk Messaging Backend is running (Stateless Mode)!'));

console.log(`Server is running on port ${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
