import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseProvider,
  QueryOptions,
  QueryBuilder,
} from '../database.provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * Firebase Firestore Database Provider
 * Implements DatabaseProvider interface for Firebase Firestore
 */
@Injectable()
export class FirebaseService implements DatabaseProvider, OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: any; // Firestore instance
  private app: any; // Firebase app instance
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const provider = this.configService.get<string>('database.provider');
    if (provider === 'firebase') {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid loading Firebase when not needed
      const firebaseAdmin = await import('firebase-admin');

      const projectId = this.configService.get<string>('database.firebase.projectId');
      const clientEmail = this.configService.get<string>('database.firebase.clientEmail');
      const privateKey = this.configService.get<string>('database.firebase.privateKey');

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn('Firebase credentials not configured');
        return;
      }

      // Check if app already initialized
      const existingApps = (firebaseAdmin as any).apps;
      if (existingApps?.length) {
        this.app = existingApps[0];
      } else {
        const credential = (firebaseAdmin as any).credential.cert({
          projectId,
          clientEmail,
          privateKey,
        });
        this.app = firebaseAdmin.initializeApp({ credential });
      }

      this.db = (firebaseAdmin as any).firestore();
      this.initialized = true;
      this.logger.log('Firebase Firestore connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Firebase', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      await this.app.delete();
      this.initialized = false;
      this.logger.log('Firebase disconnected');
    }
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async findAll<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc', filters } = options || {};

    let query = this.db.collection(collection);

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(field, '==', value);
        }
      });
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Apply sorting
    if (sortBy) {
      query = query.orderBy(sortBy, sortOrder);
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    const snapshot = await query.get();
    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    return { data, total };
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    const snapshot = await this.db
      .collection(collection)
      .where(field, '==', value)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const docData = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.db.collection(collection).doc(id).set(docData);
    return docData as T;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const timestamp = new Date().toISOString();
    const updateData = {
      ...data,
      updatedAt: timestamp,
    };

    await this.db.collection(collection).doc(id).update(updateData);
    const updated = await this.findById<T>(collection, id);
    return updated as T;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    await this.db.collection(collection).doc(id).delete();
    return true;
  }

  async exists(collection: string, id: string): Promise<boolean> {
    const doc = await this.db.collection(collection).doc(id).get();
    return doc.exists;
  }

  async query<T>(collection: string, queryBuilder: QueryBuilder): Promise<T[]> {
    let query = this.db.collection(collection);

    // Apply where clauses
    if (queryBuilder.where) {
      for (const condition of queryBuilder.where) {
        const operator = this.mapOperator(condition.operator);
        query = query.where(condition.field, operator, condition.value);
      }
    }

    // Apply ordering
    if (queryBuilder.orderBy) {
      query = query.orderBy(
        queryBuilder.orderBy.field,
        queryBuilder.orderBy.direction,
      );
    }

    // Apply offset
    if (queryBuilder.offset) {
      query = query.offset(queryBuilder.offset);
    }

    // Apply limit
    if (queryBuilder.limit) {
      query = query.limit(queryBuilder.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      '==': '==',
      '!=': '!=',
      '>': '>',
      '>=': '>=',
      '<': '<',
      '<=': '<=',
      'in': 'in',
      'contains': 'array-contains',
    };
    return operatorMap[operator] || '==';
  }
}
