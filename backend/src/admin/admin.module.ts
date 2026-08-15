import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { DashboardService } from './services/dashboard.service';
import { AuthModule } from '../auth/auth.module';
import { OccupancyExportService } from './services/occupancy-export.service';
import { OccupancyImportService } from './services/occupancy-import.service';
import { OccupancyService } from './services/occupancy.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [DashboardService, OccupancyService, OccupancyExportService, OccupancyImportService],
  exports: [DashboardService],
})
export class AdminModule {}
