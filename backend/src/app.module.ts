import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import { configValidationSchema } from './config/config.schema';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import aiConfig from './config/ai.config';
import paymentConfig from './config/payment.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { PagesModule } from './modules/pages/pages.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MediaModule } from './modules/media/media.module';
import { ThemesModule } from './modules/themes/themes.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AIModule } from './modules/ai/ai.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { HooksModule } from './modules/hooks/hooks.module';
import { AppearanceModule } from './modules/appearance/appearance.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PluginsModule } from './modules/plugins/plugins.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration module - loads and validates environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [appConfig, databaseConfig, jwtConfig, aiConfig, paymentConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    // Rate limiting - more permissive for development
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 500,
      },
    ]),

    // Core modules
    DatabaseModule.forRoot(),
    HooksModule, // Hook system - must be early to capture lifecycle events
    HealthModule,
    SystemConfigModule,
    AuthModule,
    UsersModule,
    PostsModule,
    PagesModule,
    ProductsModule,
    OrdersModule,
    MediaModule,
    ThemesModule,
    TemplatesModule,
    SettingsModule,
    AIModule,
    AppearanceModule,
    CommentsModule,
    PluginsModule, // WordPress-like plugin system
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
