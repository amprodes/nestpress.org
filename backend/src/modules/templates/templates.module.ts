/**
 * NestPress Templates Module
 */

import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { DatabaseModule } from '../database/database.module';
import { HooksModule } from '../hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
