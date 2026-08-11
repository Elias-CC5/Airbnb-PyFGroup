import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PropertiesController } from './controllers/properties.controller';
import { PropertiesService } from './services/properties.service';

@Module({
  imports: [AuthModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
