import { Controller, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DataSeederService } from './data-seeder.service';
import { Roles, Role, Public } from '../../common/decorators';

@ApiTags('Database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly seederService: DataSeederService) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Seed database with demo data (Admin only)' })
  async seedData() {
    await this.seederService.seed();
    return { message: 'Database seeded successfully' };
  }

  @Public()
  @Post('seed/appearance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed appearance data only (menus, widgets, header)' })
  async seedAppearance() {
    await this.seederService.seedAppearanceOnly();
    return { message: 'Appearance data seeded successfully' };
  }

  @Delete('seed')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Clear seeded data (Admin only)' })
  async clearData() {
    await this.seederService.clear();
    return { message: 'Seeded data cleared successfully' };
  }
}
