import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { config } from './config/env';
import messages from './routes/messages';
import webhook from './routes/webhook';
import onboarding from './routes/whatsapp_onboarding';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
// We'll keep the messages route but make it stateless
app.route('/messages', messages);
app.route('/webhook', webhook);
app.route('/whatsapp', onboarding);

// Health check
app.get('/', (c) => c.text('WhatsApp Bulk Messaging Backend is running (Stateless Mode)!'));

// Privacy Policy for Meta Verification
app.get('/privacy-policy', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Privacy Policy - Nexora Solutions</title>
        <style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }</style>
    </head>
    <body>
        <h1>Privacy Policy</h1>
        <p>Nexora Solutions provides WhatsApp bulk messaging services. We collect phone numbers provided by our users solely for the purpose of sending authorized marketing and transactional messages.</p>
        <p>We do not share, sell, or trade your personal data with third parties. All data is processed in accordance with Meta's developer policies.</p>
        <p><strong>Contact:</strong> climaxcity31@gmail.com</p>
    </body>
    </html>
  `);
});

// Terms of Service for Meta Verification
app.get('/terms', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Terms of Service - Nexora Solutions</title><style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }</style></head>
    <body>
        <h1>Terms of Service</h1>
        <p>By using Nexora Solutions WhatsApp messaging service, you agree to receive business messages via WhatsApp. You can opt out at any time by replying STOP. We comply with WhatsApp Business Policy and Meta Platform Terms.</p>
    </body>
    </html>
  `);
});

// Data Deletion Instructions for Meta Verification
app.get('/data-deletion', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Data Deletion - Nexora Solutions</title><style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }</style></head>
    <body>
        <h1>Data Deletion Instructions</h1>
        <p>To request deletion of your data, email us at <strong>climaxcity31@gmail.com</strong> with the subject "Data Deletion Request". We will process all requests within 30 days.</p>
    </body>
    </html>
  `);
});

console.log(`Server is running on port ${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
