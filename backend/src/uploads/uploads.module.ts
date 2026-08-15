import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AuthModule } from '../auth/auth.module';
import { PropertiesModule } from '../properties/properties.module';
import { UploadsController } from './controllers/uploads.controller';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { CloudinaryStorageService } from './services/cloudinary-storage.service';
import { LocalStorageService } from './services/local-storage.service';
import { UploadsService } from './services/uploads.service';

@Module({
  imports: [
    AuthModule,
    PropertiesModule,
    // memoryStorage: los drivers reciben el archivo en `file.buffer` y deciden
    // ellos mismos dónde guardarlo (disco local o Cloudinary).
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024,
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    LocalStorageService,
    CloudinaryStorageService,
    {
      // El driver se elige con STORAGE_DRIVER=local|cloudinary
      provide: STORAGE_PROVIDER,
      inject: [ConfigService, LocalStorageService, CloudinaryStorageService],
      useFactory: (
        config: ConfigService,
        local: LocalStorageService,
        cloudinary: CloudinaryStorageService,
      ) => (config.get<string>('storage.driver') === 'cloudinary' ? cloudinary : local),
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
