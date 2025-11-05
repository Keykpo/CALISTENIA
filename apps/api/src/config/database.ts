import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Extend PrismaClient with custom methods if needed
class DatabaseService extends PrismaClient {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'colorless',
    });

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        logger.debug('Database Query:', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }

    // Log database errors
    this.$on('error', (e) => {
      logger.error('Database Error:', e);
    });

    // Log database info
    this.$on('info', (e) => {
      logger.info('Database Info:', e.message);
    });

    // Log database warnings
    this.$on('warn', (e) => {
      logger.warn('Database Warning:', e.message);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.$disconnect();
      logger.info('🔌 Database disconnected');
    } catch (error) {
      logger.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Custom query methods
  async findUserByEmail(email: string) {
    return this.user.findUnique({
      where: { email },
      include: {
        subscriptions: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });
  }

  async findUserWithProfile(userId: string) {
    return this.user.findUnique({
      where: { id: userId },
      include: {
        workoutSessions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            workout: true,
          },
        },
        courseEnrollments: {
          include: {
            course: true,
          },
        },
        progressEntries: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    });
  }

  async getWorkoutWithExercises(workoutId: string) {
    return this.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getCourseWithLessons(courseId: string) {
    return this.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            progress: true,
          },
        },
      },
    });
  }

  // Analytics methods
  async getUserStats(userId: string) {
    const [
      totalWorkouts,
      totalCourses,
      currentStreak,
      totalProgress,
    ] = await Promise.all([
      this.workoutSession.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
      this.courseEnrollment.count({
        where: { userId },
      }),
      this.getWorkoutStreak(userId),
      this.progressEntry.count({
        where: { userId },
      }),
    ]);

    return {
      totalWorkouts,
      totalCourses,
      currentStreak,
      totalProgress,
    };
  }

  private async getWorkoutStreak(userId: string): Promise<number> {
    const sessions = await this.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: { startTime: 'desc' },
      select: { startTime: true },
    });

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (diffDays === streak + 1) {
        // Allow for one day gap
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }
}

// Create singleton instance
const db = new DatabaseService();

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.disconnect();
});

process.on('SIGINT', async () => {
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});

export { db };
export default db;