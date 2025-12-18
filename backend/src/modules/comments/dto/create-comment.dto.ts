/**
 * Create Comment DTO
 * WordPress-like comment submission
 */

import { IsString, IsEmail, IsOptional, IsUrl, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Post ID the comment belongs to' })
  @IsUUID()
  postId: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Comment author name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  authorName: string;

  @ApiProperty({ description: 'Comment author email' })
  @IsEmail()
  authorEmail: string;

  @ApiPropertyOptional({ description: 'Comment author website URL' })
  @IsOptional()
  @IsUrl()
  authorUrl?: string;

  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @MinLength(1)
  @MaxLength(65535)
  content: string;
}
