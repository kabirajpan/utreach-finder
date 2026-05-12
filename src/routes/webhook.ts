import { Hono } from 'hono';
import { config } from '../config/env';

const webhook = new Hono();

const VERIFY_TOKEN = config.webhookVerifyToken || "dev_outreach_secret";

// Webhook verification
webhook.get('/', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return c.text(challenge || '');
  }
  
  return c.text('Forbidden', 403);
});

// Receive incoming events (messages, status, echoes)
webhook.post('/', async (c) => {
  const body = await c.req.json();
  
  // Log the full body so you can see it in Render logs
  console.log('--- WhatsApp Webhook Received ---');
  console.log(JSON.stringify(body, null, 2));

  return c.text('OK', 200);
});

export default webhook;
