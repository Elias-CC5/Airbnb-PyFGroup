import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../database/prisma.service';
import { PropertiesService } from '../../properties/services/properties.service';
import { STORAGE_PROVIDER, StorageProvider } from '../interfaces/storage-provider.interface';
import { ConfigService } from '@nestjs/config';
import { PropertyImage } from '@prisma/client';
@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly prisma: PrismaService,
    private readonly properties: PropertiesService,
    private readonly config: ConfigService,
  ) {}

  private validate(file: Express.Multer.File) {
    const allowed = this.config.get<string[]>('storage.allowedMime') ?? [];
    const maxMb = this.config.get<number>('storage.maxSizeMb') ?? 5;

    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(`Formato no permitido. Usa: ${allowed.join(', ')}`);
    }
    if (file.size > maxMb * 1024 * 1024) {
      throw new BadRequestException(`La imagen supera el límite de ${maxMb} MB`);
    }
  }

  /** Sube N imágenes y las asocia al alojamiento manteniendo el orden. */
  async uploadPropertyImages(propertyId: string, files: Express.Multer.File[], user: AuthenticatedUser) {
    if (!files?.length) throw new BadRequestException('No se recibió ninguna imagen');
    await this.properties.ensureCanManage(propertyId, user);
    files.forEach((f) => this.validate(f));

    const existing = await this.prisma.propertyImage.count({ where: { propertyId } });

    const created: PropertyImage[] = [];
    for (const [index, file] of files.entries()) {
      const result = await this.storage.upload(file, `properties/${propertyId}`);
      created.push(
        await this.prisma.propertyImage.create({
          data: {
            propertyId,
            url: result.url,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            order: existing + index,
            isMain: existing === 0 && index === 0,
          },
        }),
      );
    }
    return created;
  }

  async removeImage(imageId: string, user: AuthenticatedUser) {
    const image = await this.prisma.propertyImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Imagen no encontrada');
    await this.properties.ensureCanManage(image.propertyId, user);

    if (image.publicId) await this.storage.remove(image.publicId).catch(() => undefined);
    await this.prisma.propertyImage.delete({ where: { id: imageId } });

    // Si se borró la principal, promovemos la siguiente.
    if (image.isMain) {
      const next = await this.prisma.propertyImage.findFirst({
        where: { propertyId: image.propertyId },
        orderBy: { order: 'asc' },
      });
      if (next) await this.prisma.propertyImage.update({ where: { id: next.id }, data: { isMain: true } });
    }

    return { message: 'Imagen eliminada' };
  }

  async setMainImage(imageId: string, user: AuthenticatedUser) {
    const image = await this.prisma.propertyImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Imagen no encontrada');
    await this.properties.ensureCanManage(image.propertyId, user);

    await this.prisma.$transaction([
      this.prisma.propertyImage.updateMany({ where: { propertyId: image.propertyId }, data: { isMain: false } }),
      this.prisma.propertyImage.update({ where: { id: imageId }, data: { isMain: true } }),
    ]);
    return { message: 'Imagen principal actualizada' };
  }

  /** Reordena por lista de IDs (drag & drop en el panel). */
  async reorder(propertyId: string, imageIds: string[], user: AuthenticatedUser) {
    await this.properties.ensureCanManage(propertyId, user);
    await this.prisma.$transaction(
      imageIds.map((id, order) =>
        this.prisma.propertyImage.update({ where: { id }, data: { order } }),
      ),
    );
    return this.prisma.propertyImage.findMany({ where: { propertyId }, orderBy: { order: 'asc' } });
  }

  async uploadAvatar(file: Express.Multer.File, user: AuthenticatedUser) {
    this.validate(file);
    const result = await this.storage.upload(file, 'avatars');
    await this.prisma.user.update({ where: { id: user.id }, data: { avatarUrl: result.url } });
    return { avatarUrl: result.url };
  }
}
