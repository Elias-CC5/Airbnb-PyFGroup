import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ format: 'uuid', description: 'Reserva completada que respalda la reseña' })
  @IsUUID()
  reservationId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number) @IsInt() @Min(1) @Max(5)
  rating: number;

  @ApiProperty({ example: 'La casa estaba impecable y la vista es increíble.' })
  @IsString() @MinLength(10) @MaxLength(1000)
  comment: string;
}
