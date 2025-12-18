import { Injectable, Logger } from '@nestjs/common';
import {
  DatabaseProvider,
  QueryOptions,
  QueryBuilder,
} from './database.provider';

/**
 * Database Service
 * Facade that delegates to the configured database provider
 */
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly provider: DatabaseProvider) {
    this.logger.log(`Database service initialized`);
  }

  async connect(): Promise<void> {
    return this.provider.connect();
  }

  async disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    return this.provider.findById<T>(collection, id);
  }

  async findAll<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }> {
    return this.provider.findAll<T>(collection, options);
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    return this.provider.findByField<T>(collection, field, value);
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    return this.provider.create<T>(collection, data);
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    return this.provider.update<T>(collection, id, data);
  }

  async delete(collection: string, id: string): Promise<boolean> {
    return this.provider.delete(collection, id);
  }

  async exists(collection: string, id: string): Promise<boolean> {
    return this.provider.exists(collection, id);
  }

  async query<T>(collection: string, queryFn: QueryBuilder): Promise<T[]> {
    return this.provider.query<T>(collection, queryFn);
  }
}
