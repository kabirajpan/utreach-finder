import { config } from '../config/env';

export const whatsapp = {
  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: string[] = [],
    languageCode: string = 'en_US'
  ) {
    const url = `https://graph.facebook.com/v25.0/${config.phoneNumberId}/messages`;

    const template: any = {
      name: templateName,
      language: { code: languageCode }
    };

    // Only add components if we have variables
    if (variables && variables.length > 0) {
      template.components = [
        {
          type: 'body',
          parameters: variables.map(v => ({ type: 'text', text: v }))
        }
      ];
    }

    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: template
    };

    console.log('Sending WhatsApp message:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.whatsappToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json() as any;
    console.log('Meta API Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return data;
  }
};
