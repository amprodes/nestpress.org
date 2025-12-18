import { Controller, Get, Post, Delete, Param, UseGuards, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ThemesService } from './themes.service';
import { Public, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all installed themes from /themes folder' })
  findAll() {
    return this.themesService.findAll();
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get currently active theme' })
  getActive() {
    return this.themesService.getActiveTheme();
  }

  @Public()
  @Get('rescan')
  @ApiOperation({ summary: 'Rescan /themes folder for new themes' })
  rescan() {
    return this.themesService.rescan();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get theme by ID (folder name)' })
  findOne(@Param('id') id: string) {
    return this.themesService.findById(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Activate a theme (Admin only)' })
  activate(@Param('id') id: string) {
    return this.themesService.setActiveTheme(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a theme (Admin only) - removes from /themes folder' })
  remove(@Param('id') id: string) {
    return this.themesService.remove(id);
  }

  @Public()
  @Get('generated/:slug')
  @ApiOperation({ summary: 'Download generated theme ZIP from AI Theme Factory' })
  async downloadGenerated(@Param('slug') slug: string, @Res() res: any) {
    const fs = require('fs');
    const path = require('path');
    const zipPath = path.join(process.cwd(), 'public', 'downloads', `${slug}.zip`);
    
    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.zip"`);
    fs.createReadStream(zipPath).pipe(res);
  }
}
