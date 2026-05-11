import { Hono } from 'hono';
import { whatsapp } from '../services/whatsapp';
import { messageQueue } from '../queue/messageQueue';

const messages = new Hono();

// Simple in-memory log for the current session
let sessionLogs: any[] = [];

// Send bulk messages (Stateless)
messages.post('/send-bulk', async (c) => {
  try {
    const { templateName, contacts, variables } = await c.req.json();

    if (!templateName || !contacts || !Array.isArray(contacts)) {
      return c.json({ success: false, error: 'Missing templateName or contacts array' }, 400);
    }

    console.log(`Starting bulk campaign for ${contacts.length} contacts`);

    // Queue each contact
    contacts.forEach((contact: any) => {
      // The queue will handle the 100ms delay to prevent rate limiting
      messageQueue.enqueue({
        phone: contact.phone,
        templateName,
        variables: contact.variables || variables || []
      });

      // Add to session logs
      sessionLogs.unshift({
        phone: contact.phone,
        templateName,
        status: 'queued',
        sentAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(7)
      });
    });

    // Limit session logs to last 100
    sessionLogs = sessionLogs.slice(0, 100);

    return c.json({
      success: true,
      message: 'Campaign queued successfully',
      total: contacts.length
    });
  } catch (error: any) {
    console.error('Campaign error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get session logs
messages.get('/logs', (c) => {
  return c.json(sessionLogs);
});

export default messages;
