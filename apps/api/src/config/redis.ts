import Redis from 'ioredis';
import { logger } from './logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('🚀 Redis is ready to accept commands');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('🔌 Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔄 Redis reconnecting...');
});

// Cache key prefixes
export const CACHE_KEYS = {
  USER: 'user:',
  WORKOUT: 'workout:',
  COURSE: 'course:',
  SESSION: 'session:',
  RATE_LIMIT: 'rate_limit:',
  EMAIL_VERIFICATION: 'email_verify:',
  PASSWORD_RESET: 'password_reset:',
  REFRESH_TOKEN: 'refresh_token:',
  LEADERBOARD: 'leaderboard:',
  POPULAR_WORKOUTS: 'popular_workouts',
  POPULAR_COURSES: 'popular_courses',
} as const;

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  SESSION: 604800, // 7 days
  EMAIL_VERIFICATION: 3600, // 1 hour
  PASSWORD_RESET: 1800, // 30 minutes
  REFRESH_TOKEN: 2592000, // 30 days
} as const;

// Redis utility class
class RedisService {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', { key, error });
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', { key, error });
      return false;
    }
  }

  async del(key: string | string[]): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', { key, error });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', { key, error });
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXPIRE error:', { key, ttl, error });
      return false;
    }
  }

  // JSON operations
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET JSON error:', { key, error });
      return null;
    }
  }

  async setJSON<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.set(key, jsonValue, ttl);
    } catch (error) {
      logger.error('Redis SET JSON error:', { key, error });
      return false;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error('Redis HGET error:', { key, field, error });
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', { key, field, error });
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.error('Redis HGETALL error:', { key, error });
      return null;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number | null> {
    try {
      return await this.client.lpush(key, ...values);
    } catch (error) {
      logger.error('Redis LPUSH error:', { key, error });
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE error:', { key, start, stop, error });
      return [];
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number | null> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      logger.error('Redis SADD error:', { key, error });
      return null;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', { key, error });
      return [];
    }
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number | null> {
    try {
      return await this.client.zadd(key, score, member);
    } catch (error) {
      logger.error('Redis ZADD error:', { key, score, member, error });
      return null;
    }
  }

  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    try {
      if (withScores) {
        return await this.client.zrange(key, start, stop, 'WITHSCORES');
      }
      return await this.client.zrange(key, start, stop);
    } catch (error) {
      logger.error('Redis ZRANGE error:', { key, start, stop, error });
      return [];
    }
  }

  // Rate limiting
  async rateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, window);
      }

      const ttl = await this.client.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime,
      };
    } catch (error) {
      logger.error('Redis rate limit error:', { key, limit, window, error });
      return { allowed: true, remaining: limit, resetTime: Date.now() + (window * 1000) };
    }
  }

  // Session management
  async createSession(sessionId: string, userId: string, data: object, ttl = CACHE_TTL.SESSION): Promise<boolean> {
    const sessionData = {
      userId,
      createdAt: Date.now(),
      ...data,
    };
    return await this.setJSON(`${CACHE_KEYS.SESSION}${sessionId}`, sessionData, ttl);
  }

  async getSession(sessionId: string): Promise<any | null> {
    return await this.getJSON(`${CACHE_KEYS.SESSION}${sessionId}`);
  }

  async destroySession(sessionId: string): Promise<boolean> {
    return await this.del(`${CACHE_KEYS.SESSION}${sessionId}`);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('🔌 Redis disconnected gracefully');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }
}

// Create service instance
const redisService = new RedisService(redis);

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisService.disconnect();
});

process.on('SIGTERM', async () => {
  await redisService.disconnect();
});

export { redis, redisService, RedisService };
export default redisService;