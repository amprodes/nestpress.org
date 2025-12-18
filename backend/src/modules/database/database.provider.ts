/**
 * Database Provider Interface
 * All database providers must implement this interface
 */
export interface DatabaseProvider {
  /**
   * Initialize database connection
   */
  connect(): Promise<void>;

  /**
   * Close database connection
   */
  disconnect(): Promise<void>;

  /**
   * Find a single document by ID
   */
  findById<T>(collection: string, id: string): Promise<T | null>;

  /**
   * Find all documents matching query
   */
  findAll<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }>;

  /**
   * Find documents by field value
   */
  findByField<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null>;

  /**
   * Create a new document
   */
  create<T>(collection: string, data: Partial<T>): Promise<T>;

  /**
   * Update an existing document
   */
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a document
   */
  delete(collection: string, id: string): Promise<boolean>;

  /**
   * Check if document exists
   */
  exists(collection: string, id: string): Promise<boolean>;

  /**
   * Query documents with complex filters
   */
  query<T>(collection: string, queryFn: QueryBuilder): Promise<T[]>;
}

/**
 * Query options for findAll
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Query builder for complex queries
 */
export interface QueryBuilder {
  where?: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'contains';
    value: any;
  }>;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}
