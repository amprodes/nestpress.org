import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService, MediaItem } from './media.service';
import { CurrentUser, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth('JWT-auth')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
  @ApiOperation({ summary: 'Get all media items' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const result = await this.mediaService.findAll(page, limit);
    return new PaginatedResponseDto<MediaItem>(result.data, result.total, page!, limit!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update media metadata' })
  update(@Param('id') id: string, @Body() data: Partial<MediaItem>) {
    return this.mediaService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete media (Admin only)' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  // Note: File upload endpoint would use @UseInterceptors(FileInterceptor('file'))
  // with multer configuration for actual file handling
}
