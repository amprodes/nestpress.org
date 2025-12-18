/**
 * Type declarations for optional dependencies
 * These allow TypeScript to compile even when optional packages aren't installed
 */

// Firebase Admin SDK
declare module 'firebase-admin' {
  export function initializeApp(options?: any, name?: string): any;
  export function getApp(name?: string): any;
  export function getApps(): any[];
  export function deleteApp(app: any): Promise<void>;
  export function credential(): any;
  export const firestore: any;
  export const auth: any;
  export const storage: any;
}

declare module 'firebase-admin/firestore' {
  export function getFirestore(app?: any): any;
  export class Firestore {
    collection(path: string): any;
    doc(path: string): any;
    batch(): any;
    runTransaction<T>(fn: (transaction: any) => Promise<T>): Promise<T>;
  }
  export class FieldValue {
    static serverTimestamp(): any;
    static increment(n: number): any;
    static arrayUnion(...elements: any[]): any;
    static arrayRemove(...elements: any[]): any;
    static delete(): any;
  }
  export class Timestamp {
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    toDate(): Date;
    seconds: number;
    nanoseconds: number;
  }
}

// MongoDB
declare module 'mongodb' {
  export class MongoClient {
    constructor(uri: string, options?: any);
    connect(): Promise<MongoClient>;
    close(): Promise<void>;
    db(name?: string): Db;
  }
  export class Db {
    collection<T = any>(name: string): Collection<T>;
    listCollections(): any;
  }
  export class Collection<T = any> {
    find(filter?: any, options?: any): FindCursor<T>;
    findOne(filter?: any, options?: any): Promise<T | null>;
    insertOne(doc: T): Promise<any>;
    insertMany(docs: T[]): Promise<any>;
    updateOne(filter: any, update: any, options?: any): Promise<any>;
    updateMany(filter: any, update: any, options?: any): Promise<any>;
    deleteOne(filter: any): Promise<any>;
    deleteMany(filter: any): Promise<any>;
    countDocuments(filter?: any): Promise<number>;
    aggregate(pipeline: any[]): any;
  }
  export class FindCursor<T> {
    toArray(): Promise<T[]>;
    skip(n: number): FindCursor<T>;
    limit(n: number): FindCursor<T>;
    sort(sort: any): FindCursor<T>;
  }
  export class ObjectId {
    constructor(id?: string | number | ObjectId);
    toString(): string;
    toHexString(): string;
    static isValid(id: any): boolean;
  }
}

// AWS DynamoDB
declare module '@aws-sdk/client-dynamodb' {
  export class DynamoDBClient {
    constructor(config?: any);
    send(command: any): Promise<any>;
    destroy(): void;
  }
  export class CreateTableCommand {
    constructor(input: any);
  }
  export class DeleteTableCommand {
    constructor(input: any);
  }
  export class DescribeTableCommand {
    constructor(input: any);
  }
  export class ListTablesCommand {
    constructor(input?: any);
  }
}

declare module '@aws-sdk/lib-dynamodb' {
  export class DynamoDBDocumentClient {
    static from(client: any, options?: any): DynamoDBDocumentClient;
    send(command: any): Promise<any>;
    destroy(): void;
  }
  export class GetCommand {
    constructor(input: any);
  }
  export class PutCommand {
    constructor(input: any);
  }
  export class UpdateCommand {
    constructor(input: any);
  }
  export class DeleteCommand {
    constructor(input: any);
  }
  export class QueryCommand {
    constructor(input: any);
  }
  export class ScanCommand {
    constructor(input: any);
  }
}

// Supabase
declare module '@supabase/supabase-js' {
  export function createClient(supabaseUrl: string, supabaseKey: string, options?: any): SupabaseClient;
  
  export interface SupabaseClient {
    from(table: string): PostgrestQueryBuilder;
    auth: any;
    storage: any;
    rpc(fn: string, params?: any): Promise<any>;
  }
  
  export interface PostgrestQueryBuilder {
    select(columns?: string): PostgrestFilterBuilder;
    insert(values: any | any[], options?: any): PostgrestFilterBuilder;
    upsert(values: any | any[], options?: any): PostgrestFilterBuilder;
    update(values: any, options?: any): PostgrestFilterBuilder;
    delete(options?: any): PostgrestFilterBuilder;
  }
  
  export interface PostgrestFilterBuilder {
    eq(column: string, value: any): this;
    neq(column: string, value: any): this;
    gt(column: string, value: any): this;
    gte(column: string, value: any): this;
    lt(column: string, value: any): this;
    lte(column: string, value: any): this;
    like(column: string, pattern: string): this;
    ilike(column: string, pattern: string): this;
    is(column: string, value: any): this;
    in(column: string, values: any[]): this;
    order(column: string, options?: any): this;
    limit(count: number): this;
    range(from: number, to: number): this;
    single(): this;
    maybeSingle(): this;
    then<TResult1 = any, TResult2 = never>(
      onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;
  }
}

// Google Generative AI (Gemini)
declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string; generationConfig?: any; safetySettings?: any }): GenerativeModel;
  }
  
  export interface GenerativeModel {
    generateContent(prompt: string | any[]): Promise<GenerateContentResult>;
    generateContentStream(prompt: string | any[]): Promise<any>;
    startChat(config?: any): ChatSession;
  }
  
  export interface GenerateContentResult {
    response: {
      text(): string;
      candidates?: any[];
    };
  }
  
  export interface ChatSession {
    sendMessage(message: string): Promise<GenerateContentResult>;
    sendMessageStream(message: string): Promise<any>;
    getHistory(): any[];
  }
  
  export enum HarmCategory {
    HARM_CATEGORY_UNSPECIFIED = 'HARM_CATEGORY_UNSPECIFIED',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
  }
  
  export enum HarmBlockThreshold {
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = 'HARM_BLOCK_THRESHOLD_UNSPECIFIED',
    BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
    BLOCK_NONE = 'BLOCK_NONE',
  }
}

// OpenAI
declare module 'openai' {
  export default class OpenAI {
    constructor(config: { apiKey: string; organization?: string; baseURL?: string });
    chat: {
      completions: {
        create(params: any): Promise<any>;
      };
    };
    completions: {
      create(params: any): Promise<any>;
    };
    embeddings: {
      create(params: any): Promise<any>;
    };
    images: {
      generate(params: any): Promise<any>;
    };
    audio: {
      transcriptions: {
        create(params: any): Promise<any>;
      };
    };
  }
  
  export class OpenAI {
    constructor(config: { apiKey: string; organization?: string; baseURL?: string });
    chat: {
      completions: {
        create(params: any): Promise<any>;
      };
    };
    completions: {
      create(params: any): Promise<any>;
    };
    embeddings: {
      create(params: any): Promise<any>;
    };
    images: {
      generate(params: any): Promise<any>;
    };
    audio: {
      transcriptions: {
        create(params: any): Promise<any>;
      };
    };
  }
}

// Anthropic
declare module '@anthropic-ai/sdk' {
  export default class Anthropic {
    constructor(config: { apiKey: string });
    messages: {
      create(params: {
        model: string;
        max_tokens: number;
        messages: Array<{ role: 'user' | 'assistant'; content: string }>;
        system?: string;
      }): Promise<{
        id: string;
        type: string;
        role: string;
        content: Array<{ type: string; text: string }>;
        model: string;
        stop_reason: string;
        stop_sequence: string | null;
        usage: { input_tokens: number; output_tokens: number };
      }>;
    };
  }
  
  export class Anthropic {
    constructor(config: { apiKey: string });
    messages: {
      create(params: {
        model: string;
        max_tokens: number;
        messages: Array<{ role: 'user' | 'assistant'; content: string }>;
        system?: string;
      }): Promise<{
        id: string;
        type: string;
        role: string;
        content: Array<{ type: string; text: string }>;
        model: string;
        stop_reason: string;
        stop_sequence: string | null;
        usage: { input_tokens: number; output_tokens: number };
      }>;
    };
  }
}
