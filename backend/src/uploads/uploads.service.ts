import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  buildFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
