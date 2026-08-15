export interface UploadedFileResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

/**
 * Contrato de almacenamiento. Cambiar de Cloudinary a S3 o Supabase
 * sólo requiere una nueva implementación de esta interfaz.
 */
export interface StorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
  remove(publicId: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
