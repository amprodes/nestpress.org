/**
 * NestPress Comments Module
 * WordPress-like comment system
 */

import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { DatabaseModule } from '../database/database.module';
import { HooksModule } from '../hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
