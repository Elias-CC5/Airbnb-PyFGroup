import { Module } from '@nestjs/common';
import { AmenitiesController } from './controllers/amenities.controller';
import { AmenitiesService } from './services/amenities.service';

@Module({
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
