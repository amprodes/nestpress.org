import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseProvider,
  QueryOptions,
  QueryBuilder,
} from '../database.provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * DynamoDB Database Provider
 * Implements DatabaseProvider interface for AWS DynamoDB
 */
@Injectable()
export class DynamoDBService implements DatabaseProvider, OnModuleInit {
  private readonly logger = new Logger(DynamoDBService.name);
  private client: any; // DynamoDB client
  private docClient: any; // DynamoDB document client
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const provider = this.configService.get<string>('database.provider');
    if (provider === 'dynamodb') {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    if (this.initialized) return;

    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');

      const region = this.configService.get<string>('database.dynamodb.region');
      const accessKeyId = this.configService.get<string>('database.dynamodb.accessKeyId');
      const secretAccessKey = this.configService.get<string>('database.dynamodb.secretAccessKey');
      const endpoint = this.configService.get<string>('database.dynamodb.endpoint');

      if (!accessKeyId || !secretAccessKey) {
        this.logger.warn('DynamoDB credentials not configured');
        return;
      }

      const clientConfig: any = {
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      };

      // For local development with DynamoDB Local
      if (endpoint) {
        clientConfig.endpoint = endpoint;
      }

      this.client = new DynamoDBClient(clientConfig);
      this.docClient = DynamoDBDocumentClient.from(this.client);
      this.initialized = true;
      this.logger.log('DynamoDB connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to DynamoDB', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.destroy();
      this.initialized = false;
      this.logger.log('DynamoDB disconnected');
    }
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const { GetCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const result = await this.docClient.send(
      new GetCommand({
        TableName: collection,
        Key: { id },
      }),
    );

    return (result.Item as T) || null;
  }

  async findAll<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }> {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const { page = 1, limit = 10, filters } = options || {};

    const scanParams: any = {
      TableName: collection,
      Limit: limit,
    };

    // Apply filters
    if (filters && Object.keys(filters).length > 0) {
      const filterExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(filters).forEach(([field, value], index) => {
        if (value !== undefined && value !== null) {
          const nameKey = `#field${index}`;
          const valueKey = `:value${index}`;
          filterExpressions.push(`${nameKey} = ${valueKey}`);
          expressionAttributeNames[nameKey] = field;
          expressionAttributeValues[valueKey] = value;
        }
      });

      if (filterExpressions.length > 0) {
        scanParams.FilterExpression = filterExpressions.join(' AND ');
        scanParams.ExpressionAttributeNames = expressionAttributeNames;
        scanParams.ExpressionAttributeValues = expressionAttributeValues;
      }
    }

    // Note: DynamoDB pagination works differently
    // For proper pagination, you'd use LastEvaluatedKey
    const result = await this.docClient.send(new ScanCommand(scanParams));

    const data = (result.Items as T[]) || [];
    const total = result.Count || 0;

    return { data, total };
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

    const result = await this.docClient.send(
      new ScanCommand({
        TableName: collection,
        FilterExpression: '#field = :value',
        ExpressionAttributeNames: { '#field': field },
        ExpressionAttributeValues: { ':value': value },
        Limit: 1,
      }),
    );

    return result.Items?.[0] as T | null;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const { PutCommand } = await import('@aws-sdk/lib-dynamodb');

    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const item = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: collection,
        Item: item,
      }),
    );

    return item as T;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');

    const timestamp = new Date().toISOString();
    const updateData = { ...data, updatedAt: timestamp };

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updateData).forEach(([key, value], index) => {
      const nameKey = `#attr${index}`;
      const valueKey = `:val${index}`;
      updateExpressions.push(`${nameKey} = ${valueKey}`);
      expressionAttributeNames[nameKey] = key;
      expressionAttributeValues[valueKey] = value;
    });

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: collection,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }),
    );

    return result.Attributes as T;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb');

    await this.docClient.send(
      new DeleteCommand({
        TableName: collection,
        Key: { id },
      }),
    );

    return true;
  }

  async exists(collection: string, id: string): Promise<boolean> {
    const item = await this.findById(collection, id);
    return item !== null;
  }

  async query<T>(collection: string, queryBuilder: QueryBuilder): Promise<T[]> {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

    const scanParams: any = {
      TableName: collection,
    };

    // Build filter expression
    if (queryBuilder.where && queryBuilder.where.length > 0) {
      const filterExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      queryBuilder.where.forEach((condition, index) => {
        const nameKey = `#field${index}`;
        const valueKey = `:value${index}`;
        const operator = this.mapOperator(condition.operator);
        filterExpressions.push(`${nameKey} ${operator} ${valueKey}`);
        expressionAttributeNames[nameKey] = condition.field;
        expressionAttributeValues[valueKey] = condition.value;
      });

      scanParams.FilterExpression = filterExpressions.join(' AND ');
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    if (queryBuilder.limit) {
      scanParams.Limit = queryBuilder.limit;
    }

    const result = await this.docClient.send(new ScanCommand(scanParams));
    return (result.Items as T[]) || [];
  }

  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      '==': '=',
      '!=': '<>',
      '>': '>',
      '>=': '>=',
      '<': '<',
      '<=': '<=',
      'in': 'IN',
      'contains': 'contains',
    };
    return operatorMap[operator] || '=';
  }
}
