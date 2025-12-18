import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostHooksService } from './post-hooks.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostHooksService],
  exports: [PostsService],
})
export class PostsModule {}
