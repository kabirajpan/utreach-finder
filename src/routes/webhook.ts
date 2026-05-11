import { Hono } from 'hono';
import { config } from '../config/env';

const webhook = new Hono();

// Meta verification
webhook.get('/', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  if (mode === 'subscribe' && token === config.webhookVerifyToken) {
    console.log('Webhook verified');
    return c.text(challenge || '');
  }

  return c.text('Verification failed', 403);
});

// Inbound messages
webhook.post('/', async (c) => {
  const body = await c.req.json();
  
  // Log the payload for now as per plan
  console.log('Received WhatsApp Webhook:', JSON.stringify(body, null, 2));

  // Acknowledge receipt
  return c.json({ status: 'ok' });
});

export default webhook;
