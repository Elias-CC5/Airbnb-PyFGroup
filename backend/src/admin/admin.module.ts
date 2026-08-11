import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  controllers: [AdminController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class AdminModule {}
