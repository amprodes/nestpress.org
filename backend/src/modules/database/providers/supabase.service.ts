import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseProvider,
  QueryOptions,
  QueryBuilder,
} from '../database.provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * Supabase Database Provider
 * Implements DatabaseProvider interface for Supabase (PostgreSQL)
 */
@Injectable()
export class SupabaseService implements DatabaseProvider, OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: any; // Supabase client
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const provider = this.configService.get<string>('database.provider');
    if (provider === 'supabase') {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    if (this.initialized) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');

      const url = this.configService.get<string>('database.supabase.url');
      const key = this.configService.get<string>('database.supabase.serviceRoleKey') ||
                  this.configService.get<string>('database.supabase.key');

      if (!url || !key) {
        this.logger.warn('Supabase credentials not configured');
        return;
      }

      this.client = createClient(url, key);
      this.initialized = true;
      this.logger.log('Supabase connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Supabase', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Supabase client doesn't need explicit disconnection
    this.initialized = false;
    this.logger.log('Supabase disconnected');
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(collection)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Row not found
      throw error;
    }

    return data as T;
  }

  async findAll<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc', filters } = options || {};

    // Get total count
    const { count } = await this.client
      .from(collection)
      .select('*', { count: 'exact', head: true });

    // Build query
    let query = this.client.from(collection).select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(field, value);
        }
      });
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw error;

    return { data: (data as T[]) || [], total: count || 0 };
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    const { data, error } = await this.client
      .from(collection)
      .select('*')
      .eq(field, value)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as T;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const insertData = {
      ...data,
      id,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const { data: result, error } = await this.client
      .from(collection)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return result as T;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const timestamp = new Date().toISOString();
    const updateData = {
      ...data,
      updated_at: timestamp,
    };

    const { data: result, error } = await this.client
      .from(collection)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return result as T;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from(collection)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  }

  async exists(collection: string, id: string): Promise<boolean> {
    const { count, error } = await this.client
      .from(collection)
      .select('*', { count: 'exact', head: true })
      .eq('id', id);

    if (error) throw error;

    return (count || 0) > 0;
  }

  async query<T>(collection: string, queryBuilder: QueryBuilder): Promise<T[]> {
    let query = this.client.from(collection).select('*');

    // Apply where conditions
    if (queryBuilder.where) {
      for (const condition of queryBuilder.where) {
        query = this.applyCondition(query, condition);
      }
    }

    // Apply ordering
    if (queryBuilder.orderBy) {
      query = query.order(queryBuilder.orderBy.field, {
        ascending: queryBuilder.orderBy.direction === 'asc',
      });
    }

    // Apply limit and offset
    if (queryBuilder.limit) {
      const from = queryBuilder.offset || 0;
      const to = from + queryBuilder.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as T[]) || [];
  }

  private applyCondition(query: any, condition: { field: string; operator: string; value: any }): any {
    const { field, operator, value } = condition;

    switch (operator) {
      case '==':
        return query.eq(field, value);
      case '!=':
        return query.neq(field, value);
      case '>':
        return query.gt(field, value);
      case '>=':
        return query.gte(field, value);
      case '<':
        return query.lt(field, value);
      case '<=':
        return query.lte(field, value);
      case 'in':
        return query.in(field, value);
      case 'contains':
        return query.contains(field, [value]);
      default:
        return query.eq(field, value);
    }
  }
}
