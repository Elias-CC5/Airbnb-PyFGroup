import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReorderImagesDto } from '../dto';
import { UploadsService } from '../services/uploads.service';

const MAX_FILES = 15;

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('properties/:id/images')
  @Roles(Role.HOST, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Sube una o varias imágenes de un alojamiento' })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES))
  uploadPropertyImages(
    @Param('id', ParseUUIDPipe) propertyId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadsService.uploadPropertyImages(propertyId, files, user);
  }

  @Patch('properties/:id/images/reorder')
  @Roles(Role.HOST, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reordena las imágenes de un alojamiento' })
  reorder(
    @Param('id', ParseUUIDPipe) propertyId: string,
    @Body() dto: ReorderImagesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadsService.reorder(propertyId, dto.imageIds, user);
  }

  @Patch('images/:imageId/main')
  @Roles(Role.HOST, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Marca una imagen como principal' })
  setMain(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadsService.setMainImage(imageId, user);
  }

  @Delete('images/:imageId')
  @Roles(Role.HOST, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Elimina una imagen del alojamiento y del almacenamiento' })
  remove(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadsService.removeImage(imageId, user);
  }

  /**
   * Fotos del documento para la solicitud de anfitrión.
   *
   * Cualquier usuario autenticado puede subirlas —todavía no es HOST, por eso
   * no lleva `@Roles`—. Las URLs no se guardan aquí: se devuelven para que el
   * formulario las envíe junto con la solicitud, y se borran al resolverla.
   */
  @Post('host-documents')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Sube anverso, reverso y selfie del documento' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ]),
  )
  async uploadHostDocuments(
    @UploadedFiles()
    files: {
      front?: Express.Multer.File[];
      back?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const subir = async (archivo?: Express.Multer.File) =>
      archivo ? (await this.uploadsService.uploadHostDocuments([archivo], user.id))[0] : undefined;

    return {
      documentFrontUrl: await subir(files.front?.[0]),
      documentBackUrl: await subir(files.back?.[0]),
      selfieUrl: await subir(files.selfie?.[0]),
    };
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Sube el avatar del usuario autenticado' })
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadsService.uploadAvatar(file, user);
  }
}
