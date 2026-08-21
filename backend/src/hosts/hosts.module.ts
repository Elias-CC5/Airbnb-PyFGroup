import { Module } from '@nestjs/common';
import { HostsAdminController } from './controllers/hosts-admin.controller';
import { HostsController } from './controllers/hosts.controller';
import {
  AdminSubscriptionsController,
  HostPlansController,
  HostSubscriptionController,
} from './controllers/subscriptions.controller';
import { HostActiveGuard } from './guards/host-active.guard';
import { HostAdminService } from './services/host-admin.service';
import { HostsService } from './services/hosts.service';
import { SubscriptionsService } from './services/subscriptions.service';

@Module({
  // Las rutas literales van declaradas antes que las que llevan parámetros:
  // Nest resuelve por orden de registro y `/hosts/:id` se come a `/hosts/plans`.
  controllers: [
    HostPlansController,
    HostSubscriptionController,
    HostsController,
    HostsAdminController,
    AdminSubscriptionsController,
  ],
  providers: [HostsService, HostAdminService, SubscriptionsService, HostActiveGuard],
  // SubscriptionsService lo usa PropertiesModule para el límite de publicación.
  exports: [HostsService, HostActiveGuard, SubscriptionsService],
})
export class HostsModule {}
