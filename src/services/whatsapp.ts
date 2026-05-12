import { config } from '../config/env';

export const whatsapp = {
  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: string[] = [],
    languageCode: string = 'en_US'
  ) {
    if (config.watiToken && config.watiEndpoint) {
      return this.sendWithWati(to, templateName, variables);
    }

    // Meta Fallback
    const url = `https://graph.facebook.com/v25.0/${config.phoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: variables.length > 0 ? [
          {
            type: 'body',
            parameters: variables.map(v => ({ type: 'text', text: v }))
          }
        ] : []
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.whatsappToken}`
      },
      body: JSON.stringify(body)
    });

    return response.json();
  },

  async sendWithWati(to: string, templateName: string, variables: string[]) {
    // Standard WATI v1 endpoint
    const cleanNumber = to.replace('+', '').replace(/\s/g, '');
    const url = `${config.watiEndpoint}/api/v1/sendTemplateMessage?whatsappNumber=${cleanNumber}`;

    const body = {
      template_name: templateName,
      broadcast_name: `Bulk_Campaign_${new Date().toISOString().split('T')[0]}`,
      parameters: variables.map((v, index) => ({
        name: (index + 1).toString(), // Maps to {{1}}, {{2}}, etc.
        value: v
      }))
    };

    console.log(`[WATI] Dispatching to ${cleanNumber}:`, templateName);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.watiToken.startsWith('Bearer ') ? config.watiToken : `Bearer ${config.watiToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('[WATI] Error:', data.message || 'Unknown error');
      throw new Error(data.message || 'WATI API Error');
    }

    return data;
  }
};
