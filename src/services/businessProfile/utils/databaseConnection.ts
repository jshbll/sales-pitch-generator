/**
 * Database Connection Utility
 * 
 * Provides utilities for connecting to and interacting with the PostgreSQL database
 * for the Business Profile Service.
 */
import { Pool, PoolClient, QueryResult } from 'pg';
import logger from './loggerService';
import errorMonitoring from './errorMonitoring';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import { BusinessProfileErrorType } from './errorTypes';
import { executeDbQuery, executeDbTransaction, executeDbInsert, executeDbUpdate, executeDbDelete } from './databaseOperations';
import { ApiResponse } from '../../../types/api';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Host name */
  host: string;
  /** Port number */
  port: number;
  /** Database name */
  database: string;
  /** User name */
  user: string;
  /** Password */
  password: string;
  /** SSL configuration */
  ssl?: boolean;
  /** Maximum number of clients in the pool */
  maxClients?: number;
  /** Idle timeout in milliseconds */
  idleTimeoutMillis?: number;
  /** Connection timeout in milliseconds */
  connectionTimeoutMillis?: number;
}

/**
 * Default database configuration
 */
const DEFAULT_CONFIG: Partial<DatabaseConfig> = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'jaxsaver',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: process.env.POSTGRES_SSL === 'true',
  maxClients: parseInt(process.env.POSTGRES_MAX_CLIENTS || '10', 10),
  idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '5000', 10)
};

/**
 * Database Connection Service
 * 
 * Provides methods for connecting to and interacting with the PostgreSQL database.
 */
export class DatabaseConnectionService {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  
  /**
   * Create a new database connection service
   * 
   * @param config - Database configuration
   */
  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    } as DatabaseConfig;
  }
  
  /**
   * Initialize the database connection pool
   */
  initialize(): void {
    if (this.pool) {
      return;
    }
    
    // Create connection pool
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl,
      max: this.config.maxClients,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis
    });
    
    // Log pool creation
    logger.info(`Database connection pool created for ${this.config.database}@${this.config.host}:${this.config.port}`, {
      component: 'DatabaseConnectionService',
      functionName: 'initialize'
    });
    
    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      const context = createErrorContext({
        component: 'DatabaseConnectionService',
        functionName: 'poolErrorHandler',
        database: {
          operation: 'pool',
          table: 'N/A'
        }
      });
      
      // Log and track error
      logger.error(`Database pool error: ${err.message}`, context, err);
      errorMonitoring.trackDatabaseError(err, context);
    });
  }
  
  /**
   * Get a client from the connection pool
   * 
   * @returns Database client
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      this.initialize();
    }
    
    return this.pool!.connect();
  }
  
  /**
   * Execute a query with error handling
   * 
   * @param text - Query text
   * @param params - Query parameters
   * @param context - Error context
   * @param table - Table name
   * @param queryId - Query ID or description
   * @returns Query result or error response
   */
  async query<T = any>(
    text: string,
    params: any[] = [],
    context?: Partial<BusinessProfileErrorContext>,
    table: string = 'unknown',
    queryId?: string
  ): Promise<ApiResponse<T>> {
    if (!this.pool) {
      this.initialize();
    }
    
    return executeDbQuery<T, QueryResult<T>>(
      async () => this.pool!.query(text, params),
      {
        operation: 'query',
        table,
        queryId,
        context
      }
    );
  }
  
  /**
   * Execute a transaction with error handling
   * 
   * @param callback - Transaction callback
   * @param context - Error context
   * @param table - Table name
   * @param queryId - Query ID or description
   * @returns Transaction result or error response
   */
  async transaction<T = any>(
    callback: (client: PoolClient) => Promise<T>,
    context?: Partial<BusinessProfileErrorContext>,
    table: string = 'unknown',
    queryId?: string
  ): Promise<ApiResponse<T>> {
    if (!this.pool) {
      this.initialize();
    }
    
    return executeDbTransaction<T>(
      async () => {
        const client = await this.pool!.connect();
        
        try {
          await client.query('BEGIN');
          
          const result = await callback(client);
          
          await client.query('COMMIT');
          
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      },
      {
        operation: 'transaction',
        table,
        queryId,
        context
      }
    );
  }
  
  /**
   * Execute an insert query with error handling
   * 
   * @param table - Table name
   * @param data - Data to insert
   * @param context - Error context
   * @param queryId - Query ID or description
   * @returns Insert result or error response
   */
  async insert<T = any>(
    table: string,
    data: Record<string, any>,
    context?: Partial<BusinessProfileErrorContext>,
    queryId?: string
  ): Promise<ApiResponse<T>> {
    if (!this.pool) {
      this.initialize();
    }
    
    // Generate column names and placeholders
    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const values = columns.map(col => data[col]);
    
    // Generate query
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    return executeDbInsert<T, QueryResult<T>>(
      async () => this.pool!.query(query, values),
      {
        operation: 'insert',
        table,
        queryId,
        context
      }
    );
  }
  
  /**
   * Execute an update query with error handling
   * 
   * @param table - Table name
   * @param data - Data to update
   * @param whereClause - Where clause
   * @param whereParams - Where parameters
   * @param context - Error context
   * @param queryId - Query ID or description
   * @returns Update result or error response
   */
  async update<T = any>(
    table: string,
    data: Record<string, any>,
    whereClause: string,
    whereParams: any[] = [],
    context?: Partial<BusinessProfileErrorContext>,
    queryId?: string
  ): Promise<ApiResponse<T>> {
    if (!this.pool) {
      this.initialize();
    }
    
    // Generate column names and placeholders
    const columns = Object.keys(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const values = [...columns.map(col => data[col]), ...whereParams];
    
    // Generate query
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    
    return executeDbUpdate<T, QueryResult<T>>(
      async () => this.pool!.query(query, values),
      {
        operation: 'update',
        table,
        queryId,
        context
      }
    );
  }
  
  /**
   * Execute a delete query with error handling
   * 
   * @param table - Table name
   * @param whereClause - Where clause
   * @param whereParams - Where parameters
   * @param context - Error context
   * @param queryId - Query ID or description
   * @returns Delete result or error response
   */
  async delete<T = any>(
    table: string,
    whereClause: string,
    whereParams: any[] = [],
    context?: Partial<BusinessProfileErrorContext>,
    queryId?: string
  ): Promise<ApiResponse<T>> {
    if (!this.pool) {
      this.initialize();
    }
    
    // Generate query
    const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
    
    return executeDbDelete<T, QueryResult<T>>(
      async () => this.pool!.query(query, whereParams),
      {
        operation: 'delete',
        table,
        queryId,
        context
      }
    );
  }
  
  /**
   * Get a business profile by ID
   * 
   * @param businessId - Business ID
   * @param context - Error context
   * @returns Business profile or error response
   */
  async getBusinessProfileById<T = any>(
    businessId: string,
    context?: Partial<BusinessProfileErrorContext>
  ): Promise<ApiResponse<T>> {
    return this.query<T>(
      'SELECT * FROM businesses WHERE id = $1',
      [businessId],
      context,
      'businesses',
      'getBusinessProfileById'
    );
  }
  
  /**
   * Get a business profile by owner ID
   * 
   * @param ownerId - Owner ID
   * @param context - Error context
   * @returns Business profile or error response
   */
  async getBusinessProfileByOwnerId<T = any>(
    ownerId: string,
    context?: Partial<BusinessProfileErrorContext>
  ): Promise<ApiResponse<T>> {
    return this.query<T>(
      'SELECT * FROM businesses WHERE owner_id = $1',
      [ownerId],
      context,
      'businesses',
      'getBusinessProfileByOwnerId'
    );
  }
  
  /**
   * Create a business profile
   * 
   * @param data - Business profile data
   * @param context - Error context
   * @returns Created business profile or error response
   */
  async createBusinessProfile<T = any>(
    data: Record<string, any>,
    context?: Partial<BusinessProfileErrorContext>
  ): Promise<ApiResponse<T>> {
    return this.insert<T>(
      'businesses',
      data,
      context,
      'createBusinessProfile'
    );
  }
  
  /**
   * Update a business profile
   * 
   * @param businessId - Business ID
   * @param data - Business profile data
   * @param context - Error context
   * @returns Updated business profile or error response
   */
  async updateBusinessProfile<T = any>(
    businessId: string,
    data: Record<string, any>,
    context?: Partial<BusinessProfileErrorContext>
  ): Promise<ApiResponse<T>> {
    return this.update<T>(
      'businesses',
      data,
      'id = $1',
      [businessId],
      context,
      'updateBusinessProfile'
    );
  }
  
  /**
   * Delete a business profile
   * 
   * @param businessId - Business ID
   * @param context - Error context
   * @returns Deleted business profile or error response
   */
  async deleteBusinessProfile<T = any>(
    businessId: string,
    context?: Partial<BusinessProfileErrorContext>
  ): Promise<ApiResponse<T>> {
    return this.delete<T>(
      'businesses',
      'id = $1',
      [businessId],
      context,
      'deleteBusinessProfile'
    );
  }
  
  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      
      logger.info('Database connection pool closed', {
        component: 'DatabaseConnectionService',
        functionName: 'close'
      });
    }
  }
}

// Create and export a default instance
const dbConnection = new DatabaseConnectionService();
export default dbConnection;
