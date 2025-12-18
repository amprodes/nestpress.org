/**
 * Update Comment DTO
 */

import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from '../entities/comment.entity';

export class UpdateCommentDto {
  @ApiPropertyOptional({ description: 'Comment content' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(65535)
  content?: string;

  @ApiPropertyOptional({ description: 'Comment status', enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}
