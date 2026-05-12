import { Hono } from 'hono';
import { addToQueue, logs } from '../queue/messageQueue';

const messages = new Hono();

// Send bulk messages (Stateless)
messages.post('/send-bulk', async (c) => {
  try {
    const { templateName, contacts, variables, language } = await c.req.json();

    if (!templateName || !contacts || !Array.isArray(contacts)) {
      return c.json({ success: false, error: 'Missing templateName or contacts array' }, 400);
    }

    console.log(`Starting bulk campaign for ${contacts.length} contacts`);

    // Queue each contact
    contacts.forEach((contact: any) => {
      addToQueue(
        contact.phone,
        templateName,
        language || 'en_US',
        contact.variables || variables || []
      );
    });

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

// Get session logs from the central queue
messages.get('/logs', (c) => {
  return c.json(logs);
});

export default messages;
