/**
 * NestPress Comments Controller
 * WordPress-like comment API endpoints
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  ModerateCommentDto,
  BulkModerateCommentsDto,
} from './dto';
import { CommentStatus } from './entities/comment.entity';
import { CurrentUser, Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';
import { Comment } from './entities/comment.entity';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // ============================================
  // Public Endpoints
  // ============================================

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a new comment (Public)' })
  @ApiResponse({ status: 201, description: 'Comment submitted for moderation' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.commentsService.create(createCommentDto, undefined, ip, userAgent);
  }

  @Public()
  @Get('post/:postId')
  @ApiOperation({ summary: 'Get approved comments for a post (Public)' })
  @ApiResponse({ status: 200, description: 'List of approved comments' })
  async findByPost(
    @Param('postId') postId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const result = await this.commentsService.findApprovedByPost(postId, page, limit);
    return new PaginatedResponseDto<Comment>(result.data, result.total, page!, limit!);
  }

  @Public()
  @Get('post/:postId/threaded')
  @ApiOperation({ summary: 'Get threaded comments for a post (Public)' })
  @ApiResponse({ status: 200, description: 'Threaded comment tree' })
  async findThreadedByPost(@Param('postId') postId: string) {
    return this.commentsService.findThreadedByPost(postId);
  }

  @Public()
  @Get('recent')
  @ApiOperation({ summary: 'Get recent comments (Public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent comments' })
  async getRecent(@Query('limit') limit?: number) {
    return this.commentsService.getRecent(limit || 5);
  }

  @Public()
  @Post(':parentId/reply')
  @ApiOperation({ summary: 'Reply to a comment (Public)' })
  @ApiResponse({ status: 201, description: 'Reply submitted' })
  async reply(
    @Param('parentId') parentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const { postId, parentId: _, ...replyDto } = createCommentDto;
    return this.commentsService.reply(
      parentId,
      { ...replyDto, postId },
      undefined,
      ip,
      userAgent,
    );
  }

  // ============================================
  // Authenticated Endpoints (logged-in users)
  // ============================================

  @Post('authenticated')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit comment as logged-in user' })
  @ApiResponse({ status: 201, description: 'Comment submitted' })
  async createAuthenticated(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @CurrentUser('email') userEmail: string,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    // Override author info with user details
    const dto = {
      ...createCommentDto,
      authorName: userName || createCommentDto.authorName,
      authorEmail: userEmail || createCommentDto.authorEmail,
    };
    return this.commentsService.create(dto, userId, ip, userAgent);
  }

  // ============================================
  // Admin/Editor Endpoints (Moderation)
  // ============================================

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all comments (Admin/Editor)' })
  @ApiQuery({ name: 'status', enum: CommentStatus, required: false })
  @ApiQuery({ name: 'postId', required: false })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: CommentStatus,
    @Query('postId') postId?: string,
  ) {
    const { page, limit } = paginationDto;
    const result = await this.commentsService.findAll(page, limit, status, postId);
    return new PaginatedResponseDto<Comment>(result.data, result.total, page!, limit!);
  }

  @Get('counts')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get comment counts by status' })
  @ApiQuery({ name: 'postId', required: false })
  @ApiResponse({ status: 200, description: 'Comment counts' })
  async getCounts(@Query('postId') postId?: string) {
    return this.commentsService.getCounts(postId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiResponse({ status: 200, description: 'Comment found' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment;
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Post(':id/moderate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Moderate a comment (approve, spam, trash, etc.)' })
  @ApiResponse({ status: 200, description: 'Comment moderated' })
  async moderate(
    @Param('id') id: string,
    @Body() moderateDto: ModerateCommentDto,
  ) {
    return this.commentsService.moderate(id, moderateDto.action);
  }

  @Post('bulk-moderate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Bulk moderate comments' })
  @ApiResponse({ status: 200, description: 'Bulk moderation result' })
  async bulkModerate(@Body() bulkModerateDto: BulkModerateCommentsDto) {
    return this.commentsService.bulkModerate(
      bulkModerateDto.commentIds,
      bulkModerateDto.action,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete a comment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  async remove(@Param('id') id: string) {
    await this.commentsService.delete(id);
    return { success: true, message: 'Comment deleted' };
  }
}
