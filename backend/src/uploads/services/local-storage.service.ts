import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { StorageProvider, UploadedFileResult } from '../interfaces/storage-provider.interface';

/**
 * Driver por defecto para desarrollo: guarda en /uploads y sirve como estático.
 * NO usar en producción con varias instancias — ahí conviene Cloudinary o S3.
 */
@Injectable()
export class LocalStorageService implements StorageProvider {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly root = join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService) {}

  async upload(file: Express.Multer.File, folder = 'properties'): Promise<UploadedFileResult> {
    const dir = join(this.root, folder);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(dir, filename), file.buffer);

    const backendUrl = process.env.BACKEND_URL ?? `http://localhost:${this.config.get('app.port')}`;
    return { url: `${backendUrl}/uploads/${folder}/${filename}`, publicId: `${folder}/${filename}` };
  }

  async remove(publicId: string): Promise<void> {
    try {
      await unlink(join(this.root, publicId));
    } catch (error) {
      this.logger.warn(`No se pudo eliminar ${publicId}`);
    }
  }
}
