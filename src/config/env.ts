export const config = {
  whatsappToken: Bun.env.WHATSAPP_TOKEN || '',
  phoneNumberId: Bun.env.PHONE_NUMBER_ID || '',
  webhookVerifyToken: Bun.env.WEBHOOK_VERIFY_TOKEN || '',
  facebookAppId: Bun.env.META_APP_ID || '',
  facebookAppSecret: Bun.env.META_APP_SECRET || '',
  mongoUri: Bun.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp_bulk',
  port: parseInt(Bun.env.PORT || '3000'),
};
