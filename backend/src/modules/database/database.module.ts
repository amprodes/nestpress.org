import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { FirebaseService } from './providers/firebase.service';
import { MongoDBService } from './providers/mongodb.service';
import { DynamoDBService } from './providers/dynamodb.service';
import { SupabaseService } from './providers/supabase.service';
import { DatabaseProvider } from './database.provider';
import { DataSeederService } from './data-seeder.service';
import { DatabaseController } from './database.controller';

/**
 * Database Module - Dynamic module supporting multiple database providers
 * Uses factory pattern to inject the correct database service based on config
 */
@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule],
      controllers: [DatabaseController],
      providers: [
        FirebaseService,
        MongoDBService,
        DynamoDBService,
        SupabaseService,
        DataSeederService,
        {
          provide: DatabaseService,
          useFactory: (
            configService: ConfigService,
            firebase: FirebaseService,
            mongodb: MongoDBService,
            dynamodb: DynamoDBService,
            supabase: SupabaseService,
          ) => {
            const provider = configService.get<string>(
              'database.provider',
              'firebase',
            );

            const services: Record<string, DatabaseProvider> = {
              firebase,
              mongodb,
              dynamodb,
              supabase,
            };

            const selectedService = services[provider];
            if (!selectedService) {
              throw new Error(`Unknown database provider: ${provider}`);
            }

            return new DatabaseService(selectedService);
          },
          inject: [
            ConfigService,
            FirebaseService,
            MongoDBService,
            DynamoDBService,
            SupabaseService,
          ],
        },
      ],
      exports: [DatabaseService, DataSeederService],
    };
  }
}
