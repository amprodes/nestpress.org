import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService, Menu, MenuItem } from './menus.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Appearance - Menus')
@Controller('appearance/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all menus (Public)' })
  findAll() {
    return this.menusService.findAll();
  }

  @Public()
  @Get('location/:location')
  @ApiOperation({ summary: 'Get menu by location (Public)' })
  findByLocation(@Param('location') location: string) {
    return this.menusService.findByLocation(location);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.menusService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create menu (Admin/Editor)' })
  create(@Body() data: Partial<Menu>) {
    return this.menusService.create(data);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update menu (Admin/Editor)' })
  update(@Param('id') id: string, @Body() data: Partial<Menu>) {
    return this.menusService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete menu (Admin only)' })
  delete(@Param('id') id: string) {
    return this.menusService.delete(id);
  }

  @Post(':id/items')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Add menu item (Admin/Editor)' })
  addItem(@Param('id') id: string, @Body() item: Omit<MenuItem, 'id'>) {
    return this.menusService.addItem(id, item);
  }

  @Put(':id/items/:itemId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update menu item (Admin/Editor)' })
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() data: Partial<MenuItem>
  ) {
    return this.menusService.updateItem(id, itemId, data);
  }

  @Delete(':id/items/:itemId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Delete menu item (Admin/Editor)' })
  deleteItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.menusService.deleteItem(id, itemId);
  }

  @Post(':id/reorder')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Reorder menu items (Admin/Editor)' })
  reorder(@Param('id') id: string, @Body() data: { itemIds: string[] }) {
    return this.menusService.reorderItems(id, data.itemIds);
  }
}
