import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Security middleware
  app.use(helmet());

  // Enable CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // API prefix - use 'api/v1' as the global prefix (no separate versioning)
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestPress CMS API')
      .setDescription(
        'NestPress CMS - A powerful headless CMS combining WordPress-like content management with e-commerce capabilities',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Posts', 'Blog post management endpoints')
      .addTag('Pages', 'Page management endpoints')
      .addTag('Products', 'E-commerce product endpoints')
      .addTag('Orders', 'Order management endpoints')
      .addTag('Media', 'Media library endpoints')
      .addTag('Themes', 'Theme management endpoints')
      .addTag('Settings', 'Site settings endpoints')
      .addTag('AI', 'AI content generation endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    // Serve OpenAPI spec as JSON
    app.getHttpAdapter().get('/api/openapi.json', (req: any, res: any) => {
      res.json(document);
    });
  }

  // Start server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 NestPress CMS Backend is running!                        ║
║                                                               ║
║   📍 API:     http://localhost:${port}/${apiPrefix}                  ║
║   📚 Docs:    http://localhost:${port}/docs                          ║
║   🌍 ENV:     ${configService.get<string>('NODE_ENV') || 'development'}                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
