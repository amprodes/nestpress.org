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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from './entities/post.entity';
import { CurrentUser, Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';
import { Post as PostEntity } from './entities/post.entity';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all posts (Admin/Editor)' })
  @ApiQuery({ name: 'status', enum: PostStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of posts' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: PostStatus,
    @Query('authorId') authorId?: string,
  ) {
    const { page, limit } = paginationDto;
    const result = await this.postsService.findAll(page, limit, status, authorId);
    return new PaginatedResponseDto<PostEntity>(result.data, result.total, page!, limit!);
  }

  @Public()
  @Get('published')
  @ApiOperation({ summary: 'Get published posts (Public)' })
  @ApiResponse({ status: 200, description: 'List of published posts' })
  async findPublished(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const result = await this.postsService.findPublishedForDisplay(page, limit);
    return new PaginatedResponseDto<PostEntity>(result.data, result.total, page!, limit!);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get post by slug (Public)' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findBySlug(@Param('slug') slug: string) {
    const post = await this.postsService.findBySlugForDisplay(slug);
    if (post) {
      // Increment views for public access
      await this.postsService.incrementViews(post.id);
    }
    return post;
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Publish post' })
  @ApiResponse({ status: 200, description: 'Post published' })
  async publish(@Param('id') id: string) {
    return this.postsService.publish(id);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Unpublish post' })
  @ApiResponse({ status: 200, description: 'Post unpublished' })
  async unpublish(@Param('id') id: string) {
    return this.postsService.unpublish(id);
  }

  @Post(':id/trash')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiOperation({ summary: 'Move post to trash' })
  @ApiResponse({ status: 200, description: 'Post moved to trash' })
  async trash(@Param('id') id: string) {
    return this.postsService.trash(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Permanently delete post (Admin only)' })
  @ApiResponse({ status: 200, description: 'Post deleted' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
