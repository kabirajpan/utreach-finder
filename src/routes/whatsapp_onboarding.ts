import { Hono } from 'hono';
import { config } from '../config/env';

const onboarding = new Hono();

onboarding.post('/exchange-token', async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ success: false, error: 'No code provided' }, 400);
    }

    const appId = config.facebookAppId || '979132894598158'; // Your App ID
    const appSecret = config.facebookAppSecret; // You MUST add this to your .env

    if (!appSecret) {
      return c.json({ success: false, error: 'META_APP_SECRET missing on server' }, 500);
    }

    // Meta API to exchange code for token
    const url = `https://graph.facebook.com/v25.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
    
    const response = await fetch(url);
    const data = await response.json() as any;

    console.log('Token Exchange Response:', data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    // In a real app, you would save this token to a DB. 
    // For now, we'll return it so you can see it's working.
    return c.json({ 
      success: true, 
      access_token: data.access_token 
    });

  } catch (error: any) {
    console.error('Onboarding Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default onboarding;
