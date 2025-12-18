/**
 * Moderate Comment DTO
 * For bulk moderation actions
 */

import { IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '../entities/comment.entity';

export enum ModerationAction {
  APPROVE = 'approve',
  UNAPPROVE = 'unapprove',
  SPAM = 'spam',
  TRASH = 'trash',
  DELETE = 'delete',
}

export class ModerateCommentDto {
  @ApiProperty({ description: 'Moderation action', enum: ModerationAction })
  @IsEnum(ModerationAction)
  action: ModerationAction;
}

export class BulkModerateCommentsDto {
  @ApiProperty({ description: 'Comment IDs to moderate' })
  @IsArray()
  @IsUUID('all', { each: true })
  commentIds: string[];

  @ApiProperty({ description: 'Moderation action', enum: ModerationAction })
  @IsEnum(ModerationAction)
  action: ModerationAction;
}
