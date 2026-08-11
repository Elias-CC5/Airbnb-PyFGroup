import { registerAs } from '@nestjs/config';

export default registerAs('whatsapp', () => ({
  defaultPhone: process.env.WHATSAPP_DEFAULT_PHONE ?? '',
  baseUrl: 'https://wa.me',
}));
