import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { StorageProvider, UploadedFileResult } from '../interfaces/storage-provider.interface';

@Injectable()
export class CloudinaryStorageService implements StorageProvider {
  private readonly baseFolder: string;

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('storage.cloudinary.cloudName'),
      api_key: this.config.get<string>('storage.cloudinary.apiKey'),
      api_secret: this.config.get<string>('storage.cloudinary.apiSecret'),
      secure: true,
    });
    this.baseFolder = this.config.get<string>('storage.cloudinary.folder') ?? 'wasi-peru';
  }

  upload(file: Express.Multer.File, folder = 'properties'): Promise<UploadedFileResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.baseFolder}/${folder}`,
          resource_type: 'image',
          transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(new InternalServerErrorException('No se pudo subir la imagen'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      );
      stream.end(file.buffer);
    });
  }

  async remove(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
