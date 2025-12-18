import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PagesService, Page } from './pages.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a new page' })
  create(@Body() data: Partial<Page>) {
    return this.pagesService.create(data);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all pages (Admin/Editor)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const result = await this.pagesService.findAll(page, limit);
    return new PaginatedResponseDto<Page>(result.data, result.total, page!, limit!);
  }

  @Public()
  @Get('published')
  @ApiOperation({ summary: 'Get published pages (Public)' })
  findPublished() {
    return this.pagesService.findPublished();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get page by slug (Public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get page by ID' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update page' })
  update(@Param('id') id: string, @Body() data: Partial<Page>) {
    return this.pagesService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete page (Admin only)' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
