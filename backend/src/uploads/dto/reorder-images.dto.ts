import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ReorderImagesDto {
  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray() @ArrayNotEmpty() @IsUUID('4', { each: true })
  imageIds: string[];
}
