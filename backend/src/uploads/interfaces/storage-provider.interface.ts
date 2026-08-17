export interface UploadedFileResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}


export interface StorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
  remove(publicId: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
