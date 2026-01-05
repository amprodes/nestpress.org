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
  @ApiOperation({ 
    summary: 'Update site settings (Admin only)',
    description: `WordPress-compliant settings update endpoint.
    
    Security:
    - Requires 'manage_options' capability (ADMIN role)
    - Input sanitized server-side (sanitize_text_field, absint equivalents)
    - Cross-field validation (e.g., homepage != posts page)
    - Output escaped by API serialization
    
    Reading Settings:
    - homepageType: 'posts' | 'page' (sanitized enum)
    - homepageId: string (sanitized, validated exists)
    - postsPageId: string (sanitized, cannot equal homepageId)
    - postsPerPage: 1-100 (absint with bounds)
    - feedItemsCount: 1-50 (absint with bounds)
    - feedShowSummary: boolean (checkbox)
    - discourageCrawlers: boolean (checkbox, honors robots.txt request)
    `
  })
  updateSettings(@Body() data: Partial<SiteSettings>) {
    // WordPress equivalent: check_admin_referer() would go here
    // In NestPress, JWT + RolesGuard provides this security
    // Controller acts as capability check (current_user_can('manage_options'))
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
