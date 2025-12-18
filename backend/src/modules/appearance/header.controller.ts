import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HeaderService, HeaderSettings } from './header.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Appearance - Header')
@Controller('appearance/header')
export class HeaderController {
  constructor(private readonly headerService: HeaderService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get header settings (Public)' })
  getSettings() {
    return this.headerService.getSettings();
  }

  @Put()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update header settings (Admin only)' })
  updateSettings(@Body() settings: Partial<HeaderSettings>) {
    return this.headerService.updateSettings(settings);
  }
}
