import { Module } from '@nestjs/common';
import { HostsAdminController } from './controllers/hosts-admin.controller';
import { HostsController } from './controllers/hosts.controller';
import { HostActiveGuard } from './guards/host-active.guard';
import { HostAdminService } from './services/host-admin.service';
import { HostsService } from './services/hosts.service';

@Module({
  controllers: [HostsController, HostsAdminController],
  providers: [HostsService, HostAdminService, HostActiveGuard],
  exports: [HostsService, HostActiveGuard],
})
export class HostsModule {}
