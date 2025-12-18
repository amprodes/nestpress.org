import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseProvider,
  QueryOptions,
  QueryBuilder,
} from '../database.provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * MongoDB Database Provider
 * Implements DatabaseProvider interface for MongoDB
 */
@Injectable()
export class MongoDBService
  implements DatabaseProvider, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MongoDBService.name);
  private client: any; // MongoDB client
  private db: any; // MongoDB database
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const provider = this.configService.get<string>('database.provider');
    if (provider === 'mongodb') {
      await this.connect();
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.initialized) return;

    try {
      const { MongoClient } = await import('mongodb');
      const uri = this.configService.get<string>('database.mongodb.uri');

      if (!uri) {
        this.logger.warn('MongoDB URI not configured');
        return;
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();
      this.initialized = true;
      this.logger.log('MongoDB connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.initialized = false;
      this.logger.log('MongoDB disconnected');
    }
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    const result = await this.db.collection(collection).findOne({ id });
    return result as T | null;
  }

  async findAll<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc', filters } = options || {};

    const query: Record<string, any> = {};

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          query[field] = value;
        }
      });
    }

    // Get total count
    const total = await this.db.collection(collection).countDocuments(query);

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['createdAt'] = -1;
    }

    // Apply pagination
    const skip = (page - 1) * limit;

    const data = await this.db
      .collection(collection)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return { data: data as T[], total };
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    const result = await this.db
      .collection(collection)
      .findOne({ [field]: value });
    return result as T | null;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    
    // Use existing id if provided, otherwise generate new UUID
    const id = (data as any).id || uuidv4();
    const timestamp = new Date().toISOString();
    const doc = {
      ...data,
      id,
      createdAt: (data as any).createdAt || timestamp,
      updatedAt: timestamp,
    };

    await this.db.collection(collection).insertOne(doc);
    return doc as T;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    
    const timestamp = new Date().toISOString();
    
    // Remove immutable fields that shouldn't be updated
    const { _id, id: dataId, createdAt, ...updateableData } = data as any;
    
    const updateData = {
      ...updateableData,
      updatedAt: timestamp,
    };

    await this.db.collection(collection).updateOne(
      { id },
      { $set: updateData },
    );

    const updated = await this.findById<T>(collection, id);
    return updated as T;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    const result = await this.db.collection(collection).deleteOne({ id });
    return result.deletedCount > 0;
  }

  async exists(collection: string, id: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    const count = await this.db
      .collection(collection)
      .countDocuments({ id }, { limit: 1 });
    return count > 0;
  }

  async query<T>(collection: string, queryBuilder: QueryBuilder): Promise<T[]> {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    
    const filter: Record<string, any> = {};

    // Build where conditions
    if (queryBuilder.where) {
      for (const condition of queryBuilder.where) {
        filter[condition.field] = this.mapCondition(
          condition.operator,
          condition.value,
        );
      }
    }

    let cursor = this.db.collection(collection).find(filter);

    // Apply ordering
    if (queryBuilder.orderBy) {
      const sort: Record<string, 1 | -1> = {
        [queryBuilder.orderBy.field]:
          queryBuilder.orderBy.direction === 'asc' ? 1 : -1,
      };
      cursor = cursor.sort(sort);
    }

    // Apply offset
    if (queryBuilder.offset) {
      cursor = cursor.skip(queryBuilder.offset);
    }

    // Apply limit
    if (queryBuilder.limit) {
      cursor = cursor.limit(queryBuilder.limit);
    }

    return cursor.toArray() as Promise<T[]>;
  }

  private mapCondition(operator: string, value: any): any {
    const operatorMap: Record<string, (v: any) => any> = {
      '==': (v) => v,
      '!=': (v) => ({ $ne: v }),
      '>': (v) => ({ $gt: v }),
      '>=': (v) => ({ $gte: v }),
      '<': (v) => ({ $lt: v }),
      '<=': (v) => ({ $lte: v }),
      'in': (v) => ({ $in: v }),
      'contains': (v) => ({ $elemMatch: { $eq: v } }),
    };

    const mapper = operatorMap[operator];
    return mapper ? mapper(value) : value;
  }
}
