import { Module } from '@nestjs/common';
import { AvailabilityController } from './controllers/availability.controller';
import { AvailabilityService } from './services/availability.service';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
