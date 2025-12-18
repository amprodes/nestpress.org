import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService, SiteSettings } from './settings.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get site settings (Public)' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Public()
  @Get('seo')
  @ApiOperation({ summary: 'Get SEO settings (Public)' })
  getSEOSettings() {
    return this.settingsService.getSEOSettings();
  }

  @Public()
  @Get('social')
  @ApiOperation({ summary: 'Get social links (Public)' })
  getSocialLinks() {
    return this.settingsService.getSocialLinks();
  }

  @Patch()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update site settings (Admin only)' })
  updateSettings(@Body() data: Partial<SiteSettings>) {
    return this.settingsService.updateSettings(data);
  }

  @Patch('social')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update social links (Admin only)' })
  updateSocialLinks(@Body() links: SiteSettings['socialLinks']) {
    return this.settingsService.updateSocialLinks(links);
  }
}
