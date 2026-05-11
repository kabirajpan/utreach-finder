import { Hono } from 'hono';
import { Contact } from '../models/Contact';

const contacts = new Hono();

// Get all contacts
contacts.get('/', async (c) => {
  try {
    const allContacts = await Contact.find().sort({ createdAt: -1 });
    return c.json(allContacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add single contact
contacts.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const contact = new Contact(body);
    await contact.save();
    return c.json({ success: true, contact }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Bulk import
contacts.post('/bulk-import', async (c) => {
  try {
    const { contacts: contactList } = await c.req.json();
    if (!Array.isArray(contactList)) {
      throw new Error('Contacts must be an array');
    }
    
    const result = await Contact.insertMany(contactList, { ordered: false });
    return c.json({ success: true, count: result.length });
  } catch (error: any) {
    // Some might fail due to unique constraint, but we return what was inserted
    return c.json({ 
      success: false, 
      error: error.message,
      insertedCount: error.result?.nInserted || 0 
    }, 400);
  }
});

// Delete contact
contacts.delete('/:phone', async (c) => {
  const phone = c.req.param('phone');
  await Contact.findOneAndDelete({ phone });
  return c.json({ success: true });
});

export default contacts;
