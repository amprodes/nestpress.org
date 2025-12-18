import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UploadedFile, 
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ThemeManagerService, ThemeMetadata } from './theme-manager.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Theme Manager')
@Controller('theme-manager')
export class ThemeManagerController {
  constructor(private readonly themeManager: ThemeManagerService) {}

  @Public()
  @Get('discover')
  @ApiOperation({ summary: 'Discover all installed themes' })
  async discoverThemes() {
    return this.themeManager.discoverThemes();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get theme details' })
  async getTheme(@Param('slug') slug: string): Promise<ThemeMetadata> {
    return this.themeManager.getThemeMetadata(slug);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('theme'))
  @ApiOperation({ summary: 'Upload and install theme ZIP (Admin only)' })
  async uploadTheme(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.zip')) {
      throw new BadRequestException('Only ZIP files are supported');
    }

    return this.themeManager.installThemeFromZip(file.buffer, file.originalname);
  }

  @Delete(':slug')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete installed theme (Admin only)' })
  async deleteTheme(@Param('slug') slug: string) {
    return this.themeManager.deleteTheme(slug);
  }

  @Post(':slug/activate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Activate theme (Admin only)' })
  async activateTheme(@Param('slug') slug: string) {
    return this.themeManager.activateTheme(slug);
  }
}
