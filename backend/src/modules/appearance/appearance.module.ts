import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MenusService } from './menus.service';
import { WidgetsService } from './widgets.service';
import { HeaderService } from './header.service';
import { MenusController } from './menus.controller';
import { WidgetsController } from './widgets.controller';
import { HeaderController } from './header.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MenusController, WidgetsController, HeaderController],
  providers: [MenusService, WidgetsService, HeaderService],
  exports: [MenusService, WidgetsService, HeaderService],
})
export class AppearanceModule {}
