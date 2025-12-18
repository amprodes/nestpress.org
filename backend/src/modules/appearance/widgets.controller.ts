import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WidgetsService, Widget } from './widgets.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Appearance - Widgets')
@Controller('appearance/widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all widgets (Public)' })
  findAll() {
    return this.widgetsService.findAll();
  }

  @Public()
  @Get('area/:area')
  @ApiOperation({ summary: 'Get widgets by area (Public)' })
  findByArea(@Param('area') area: string) {
    return this.widgetsService.findByArea(area);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get widget by ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.widgetsService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create widget (Admin/Editor)' })
  create(@Body() data: Partial<Widget>) {
    return this.widgetsService.create(data);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update widget (Admin/Editor)' })
  update(@Param('id') id: string, @Body() data: Partial<Widget>) {
    return this.widgetsService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete widget (Admin only)' })
  delete(@Param('id') id: string) {
    return this.widgetsService.delete(id);
  }

  @Post('area/:area/reorder')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder widgets in area (Admin/Editor)' })
  reorder(@Param('area') area: string, @Body() data: { widgetIds: string[] }) {
    return this.widgetsService.reorderWidgets(area, data.widgetIds);
  }
}
