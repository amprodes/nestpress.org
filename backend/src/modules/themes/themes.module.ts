import { Module } from '@nestjs/common';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { ThemeManagerService } from './theme-manager.service';
import { ThemeManagerController } from './theme-manager.controller';

@Module({
  controllers: [ThemesController, ThemeManagerController],
  providers: [ThemesService, ThemeManagerService],
  exports: [ThemesService, ThemeManagerService],
})
export class ThemesModule {}
