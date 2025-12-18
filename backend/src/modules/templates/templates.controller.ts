/**
 * NestPress Templates Controller
 * REST API for template management
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { TemplatesService } from './templates.service';
import {
  Template,
  TemplatePart,
  TemplateAssignment,
  TemplateType,
  TemplateStatus,
  CreateTemplateDto,
  UpdateTemplateDto,
  AssignTemplateDto,
} from './interfaces';
import { Public, Roles, Role } from '../../common/decorators';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ============================================
  // Template CRUD
  // ============================================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Body() data: CreateTemplateDto): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.create(data);
    return { success: true, data: template };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiQuery({ name: 'type', required: false, enum: ['page', 'post', 'archive', 'home', '404', 'header', 'footer', 'sidebar', 'custom'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'draft', 'inactive'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async findAll(
    @Query('type') type?: TemplateType,
    @Query('status') status?: TemplateStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ success: boolean; data: Template[]; total: number }> {
    const result = await this.templatesService.findAll({ type, status, page, limit });
    return { success: true, ...result };
  }

  @Get('types')
  @Public()
  @ApiOperation({ summary: 'Get available template types' })
  @ApiResponse({ status: 200, description: 'List of template types' })
  getTemplateTypes(): { success: boolean; data: { type: string; label: string; description: string }[] } {
    return {
      success: true,
      data: [
        { type: 'page', label: 'Page', description: 'Template for single pages' },
        { type: 'post', label: 'Post', description: 'Template for single blog posts' },
        { type: 'archive', label: 'Archive', description: 'Template for post archives and listings' },
        { type: 'category', label: 'Category', description: 'Template for category archives' },
        { type: 'tag', label: 'Tag', description: 'Template for tag archives' },
        { type: 'author', label: 'Author', description: 'Template for author archives' },
        { type: 'search', label: 'Search', description: 'Template for search results' },
        { type: 'home', label: 'Homepage', description: 'Template for the homepage' },
        { type: 'front-page', label: 'Front Page', description: 'Static front page template' },
        { type: '404', label: '404 Error', description: 'Template for 404 not found pages' },
        { type: 'header', label: 'Header', description: 'Header partial template' },
        { type: 'footer', label: 'Footer', description: 'Footer partial template' },
        { type: 'sidebar', label: 'Sidebar', description: 'Sidebar partial template' },
        { type: 'custom', label: 'Custom', description: 'Custom template' },
      ],
    };
  }

  @Get('defaults')
  @Public()
  @ApiOperation({ summary: 'Get default templates for each type' })
  @ApiResponse({ status: 200, description: 'Default templates by type' })
  async getDefaults(): Promise<{ success: boolean; data: Record<string, Template | null> }> {
    const types: TemplateType[] = ['page', 'post', 'archive', 'home', '404'];
    const defaults: Record<string, Template | null> = {};

    for (const type of types) {
      defaults[type] = await this.templatesService.getDefaultForType(type);
    }

    return { success: true, data: defaults };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findById(@Param('id') id: string): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.findById(id);
    return { success: true, data: template };
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get template by slug' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findBySlug(@Param('slug') slug: string): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.findBySlug(slug);
    return { success: true, data: template };
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTemplateDto,
  ): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.update(id, data);
    return { success: true, data: template };
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async delete(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.templatesService.delete(id);
    return { success: true, message: 'Template deleted successfully' };
  }

  @Post(':id/clone')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Clone an existing template' })
  @ApiResponse({ status: 201, description: 'Template cloned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async clone(
    @Param('id') id: string,
    @Body() body: { name?: string },
  ): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.clone(id, body.name);
    return { success: true, data: template };
  }

  @Post(':id/set-default')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set template as default for its type' })
  @ApiResponse({ status: 200, description: 'Template set as default' })
  async setAsDefault(@Param('id') id: string): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.update(id, { isDefault: true });
    return { success: true, data: template };
  }

  // ============================================
  // Template Assignment
  // ============================================

  @Post('assign')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign template to content' })
  @ApiResponse({ status: 201, description: 'Template assigned successfully' })
  async assignTemplate(
    @Body() data: AssignTemplateDto,
  ): Promise<{ success: boolean; data: TemplateAssignment[] }> {
    const assignments = await this.templatesService.assignTemplate(data);
    return { success: true, data: assignments };
  }

  @Get(':id/assignments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get content assigned to template' })
  @ApiResponse({ status: 200, description: 'List of assignments' })
  async getAssignments(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: TemplateAssignment[] }> {
    const assignments = await this.templatesService.getTemplateAssignments(id);
    return { success: true, data: assignments };
  }

  @Get('for-content/:contentType/:contentId')
  @Public()
  @ApiOperation({ summary: 'Get template for specific content' })
  @ApiResponse({ status: 200, description: 'Template for content' })
  async getTemplateForContent(
    @Param('contentType') contentType: 'page' | 'post' | 'product',
    @Param('contentId') contentId: string,
  ): Promise<{ success: boolean; data: Template }> {
    const template = await this.templatesService.getTemplateForContent(contentType, contentId);
    return { success: true, data: template };
  }

  // ============================================
  // Template Parts
  // ============================================

  @Get('parts/all')
  @Public()
  @ApiOperation({ summary: 'Get all template parts' })
  @ApiQuery({ name: 'area', required: false, enum: ['header', 'footer', 'sidebar', 'general'] })
  @ApiResponse({ status: 200, description: 'List of template parts' })
  async getTemplateParts(
    @Query('area') area?: 'header' | 'footer' | 'sidebar' | 'general',
  ): Promise<{ success: boolean; data: TemplatePart[] }> {
    const parts = await this.templatesService.getTemplateParts(area);
    return { success: true, data: parts };
  }

  @Get('parts/:slug')
  @Public()
  @ApiOperation({ summary: 'Get template part by slug' })
  @ApiResponse({ status: 200, description: 'Template part details' })
  async getTemplatePart(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; data: TemplatePart }> {
    const part = await this.templatesService.getTemplatePart(slug);
    return { success: true, data: part };
  }

  @Patch('parts/:slug')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update template part' })
  @ApiResponse({ status: 200, description: 'Template part updated' })
  async updateTemplatePart(
    @Param('slug') slug: string,
    @Body() data: { content?: string; name?: string },
  ): Promise<{ success: boolean; data: TemplatePart }> {
    const part = await this.templatesService.updateTemplatePart(slug, data);
    return { success: true, data: part };
  }

  // ============================================
  // Template Rendering
  // ============================================

  @Post(':id/render')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Render template with context' })
  @ApiResponse({ status: 200, description: 'Rendered HTML' })
  async renderTemplate(
    @Param('id') id: string,
    @Body() context: any,
  ): Promise<{ success: boolean; data: { html: string } }> {
    const html = await this.templatesService.renderTemplate(id, context);
    return { success: true, data: { html } };
  }
}
