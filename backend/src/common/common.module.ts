import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [HealthController],
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class CommonModule {}
