import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  driver: (process.env.STORAGE_DRIVER ?? 'local') as 'local' | 'cloudinary',
  maxSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '5', 10),
  allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER ?? 'wasi-peru',
  },
}));
