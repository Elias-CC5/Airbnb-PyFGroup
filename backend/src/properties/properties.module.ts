import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HostsModule } from '../hosts/hosts.module';
import { PropertiesController } from './controllers/properties.controller';
import { PropertiesService } from './services/properties.service';
import { ViewsCounterService } from './services/views-counter.service';

@Module({
  imports: [AuthModule, HostsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, ViewsCounterService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
