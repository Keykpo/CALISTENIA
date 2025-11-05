import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logInfo, logError } from '../config/logger';

const prisma = new PrismaClient();

async function main() {
  logInfo('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@calisthenics.com' },
      update: {},
      create: {
        email: 'admin@calisthenics.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin',
        password: adminPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        fitnessLevel: 'EXPERT',
        subscriptionType: 'PRO',
        bio: 'Platform administrator and calisthenics expert',
        goals: ['Maintain platform', 'Help users achieve their goals'],
      },
    });

    logInfo(`✅ Admin user created: ${admin.email}`);

    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        displayName: 'Demo User',
        password: demoPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        fitnessLevel: 'BEGINNER',
        bio: 'New to calisthenics, excited to learn!',
        goals: ['Build strength', 'Learn proper form', 'Stay consistent'],
        height: 175,
        weight: 70,
        gender: 'MALE',
      },
    });

    logInfo(`✅ Demo user created: ${demoUser.email}`);

    // Seed basic exercises
    const exercises = [
      {
        name: 'Push-up',
        description: 'A fundamental upper body exercise that targets chest, shoulders, and triceps.',
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your body in a straight line throughout the movement',
        ],
        difficulty: 'BEGINNER',
        category: 'PUSH',
        muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
        equipment: ['NONE'],
        tags: ['bodyweight', 'upper-body', 'fundamental'],
        isBodyweight: true,
        hasReps: true,
        hasSets: true,
        createdById: admin.id,
      },
      {
        name: 'Pull-up',
        description: 'A challenging upper body exercise that targets back and biceps.',
        instructions: [
          'Hang from a pull-up bar with palms facing away',
          'Pull your body up until chin clears the bar',
          'Lower yourself back to starting position with control',
          'Keep core engaged throughout the movement',
        ],
        difficulty: 'INTERMEDIATE',
        category: 'PULL',
        muscleGroups: ['BACK', 'BICEPS'],
        equipment: ['PULL_UP_BAR'],
        tags: ['bodyweight', 'upper-body', 'strength'],
        isBodyweight: true,
        hasReps: true,
        hasSets: true,
        createdById: admin.id,
      },
      {
        name: 'Squat',
        description: 'A fundamental lower body exercise that targets legs and glutes.',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body by bending knees and hips',
          'Go down until thighs are parallel to floor',
          'Push through heels to return to starting position',
        ],
        difficulty: 'BEGINNER',
        category: 'LEGS',
        muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
        equipment: ['NONE'],
        tags: ['bodyweight', 'lower-body', 'fundamental'],
        isBodyweight: true,
        hasReps: true,
        hasSets: true,
        createdById: admin.id,
      },
      {
        name: 'Plank',
        description: 'An isometric core exercise that builds stability and strength.',
        instructions: [
          'Start in a push-up position',
          'Lower onto forearms, keeping elbows under shoulders',
          'Keep body in straight line from head to heels',
          'Hold position while breathing normally',
        ],
        difficulty: 'BEGINNER',
        category: 'CORE',
        muscleGroups: ['ABS', 'OBLIQUES'],
        equipment: ['NONE'],
        tags: ['bodyweight', 'core', 'isometric'],
        isBodyweight: true,
        hasTime: true,
        createdById: admin.id,
      },
      {
        name: 'Dip',
        description: 'An upper body exercise that targets triceps, chest, and shoulders.',
        instructions: [
          'Position hands on parallel bars or stable surface',
          'Lower body by bending elbows',
          'Go down until shoulders are below elbows',
          'Push back up to starting position',
        ],
        difficulty: 'INTERMEDIATE',
        category: 'PUSH',
        muscleGroups: ['TRICEPS', 'CHEST', 'SHOULDERS'],
        equipment: ['PARALLEL_BARS'],
        tags: ['bodyweight', 'upper-body', 'triceps'],
        isBodyweight: true,
        hasReps: true,
        hasSets: true,
        createdById: admin.id,
      },
      {
        name: 'Burpee',
        description: 'A full-body exercise that combines strength and cardio.',
        instructions: [
          'Start standing, then squat down and place hands on floor',
          'Jump feet back into plank position',
          'Do a push-up (optional)',
          'Jump feet back to squat position',
          'Jump up with arms overhead',
        ],
        difficulty: 'INTERMEDIATE',
        category: 'FULL_BODY',
        muscleGroups: ['FULL_BODY'],
        equipment: ['NONE'],
        tags: ['bodyweight', 'cardio', 'full-body', 'hiit'],
        isBodyweight: true,
        hasReps: true,
        hasSets: true,
        createdById: admin.id,
      },
    ];

    for (const exercise of exercises) {
      await prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {},
        create: exercise,
      });
    }

    logInfo(`✅ Created ${exercises.length} exercises`);

    // Create sample workouts
    const beginnerWorkout = await prisma.workout.upsert({
      where: { id: 'beginner-workout-1' },
      update: {},
      create: {
        id: 'beginner-workout-1',
        name: 'Beginner Full Body',
        description: 'A complete beginner-friendly workout targeting all major muscle groups.',
        difficulty: 'BEGINNER',
        estimatedDuration: 30,
        category: 'FULL_BODY',
        tags: ['beginner', 'full-body', 'bodyweight'],
        createdById: admin.id,
      },
    });

    // Add exercises to the workout
    const workoutExercises = [
      { exerciseName: 'Push-up', sets: 3, reps: 8, duration: null, restTime: 60 },
      { exerciseName: 'Squat', sets: 3, reps: 15, duration: null, restTime: 60 },
      { exerciseName: 'Plank', sets: 3, reps: null, duration: 30, restTime: 60 },
    ];

    for (let i = 0; i < workoutExercises.length; i++) {
      const exerciseData = workoutExercises[i];
      const exercise = await prisma.exercise.findFirst({
        where: { name: exerciseData.exerciseName },
      });

      if (exercise && exerciseData) {
        await prisma.workoutExercise.upsert({
          where: {
            workoutId_exerciseId_order: {
              workoutId: beginnerWorkout.id,
              exerciseId: exercise.id,
              order: i + 1,
            },
          },
          update: {},
          create: {
            workoutId: beginnerWorkout.id,
            exerciseId: exercise.id,
            order: i + 1,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            duration: exerciseData.duration,
            restTime: exerciseData.restTime,
          },
        });
      }
    }

    logInfo('✅ Created beginner workout');

    // Create achievements
    const achievements = [
      {
        name: 'First Workout',
        description: 'Complete your first workout session',
        category: 'WORKOUT',
        type: 'COUNT',
        requirements: { workoutSessions: 1 },
        points: 10,
        rarity: 'COMMON',
      },
      {
        name: 'Week Warrior',
        description: 'Complete 7 workout sessions',
        category: 'WORKOUT',
        type: 'COUNT',
        requirements: { workoutSessions: 7 },
        points: 50,
        rarity: 'UNCOMMON',
      },
      {
        name: 'Push-up Master',
        description: 'Complete 100 push-ups in a single workout',
        category: 'WORKOUT',
        type: 'COUNT',
        requirements: { exercise: 'Push-up', totalReps: 100 },
        points: 100,
        rarity: 'RARE',
      },
      {
        name: 'Consistency King',
        description: 'Work out for 30 consecutive days',
        category: 'STREAK',
        type: 'STREAK',
        requirements: { consecutiveDays: 30 },
        points: 200,
        rarity: 'EPIC',
      },
      {
        name: 'Social Butterfly',
        description: 'Follow 10 other users',
        category: 'SOCIAL',
        type: 'COUNT',
        requirements: { following: 10 },
        points: 25,
        rarity: 'COMMON',
      },
    ];

    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: {},
        create: achievement,
      });
    }

    logInfo(`✅ Created ${achievements.length} achievements`);

    // Create a sample course
    const beginnerCourse = await prisma.course.upsert({
      where: { id: 'beginner-calisthenics-course' },
      update: {},
      create: {
        id: 'beginner-calisthenics-course',
        title: 'Calisthenics Fundamentals',
        description: 'Learn the basics of calisthenics with proper form and progression techniques.',
        shortDescription: 'Master the fundamentals of bodyweight training',
        difficulty: 'BEGINNER',
        category: 'BEGINNER_GUIDE',
        tags: ['beginner', 'fundamentals', 'form', 'progression'],
        duration: 30, // 30 days
        price: 0, // Free course
        isPublished: true,
        prerequisites: [],
        equipment: ['NONE'],
      },
    });

    // Create lessons for the course
    const lessons = [
      {
        title: 'Introduction to Calisthenics',
        description: 'Learn what calisthenics is and its benefits',
        content: 'Welcome to the world of calisthenics! In this lesson, we\'ll explore the fundamentals of bodyweight training...',
        order: 1,
        duration: 15,
        isPreview: true,
      },
      {
        title: 'Proper Warm-up Techniques',
        description: 'Essential warm-up exercises to prevent injury',
        content: 'A proper warm-up is crucial for any workout. Let\'s learn the essential movements...',
        order: 2,
        duration: 20,
      },
      {
        title: 'Push-up Progressions',
        description: 'Master the push-up from beginner to advanced',
        content: 'The push-up is a fundamental movement. We\'ll start with the basics and progress...',
        order: 3,
        duration: 25,
      },
    ];

    for (const lesson of lessons) {
      await prisma.lesson.upsert({
        where: {
          courseId_order: {
            courseId: beginnerCourse.id,
            order: lesson.order,
          },
        },
        update: {},
        create: {
          ...lesson,
          courseId: beginnerCourse.id,
        },
      });
    }

    logInfo(`✅ Created course with ${lessons.length} lessons`);

    // Create sample posts
    const posts = [
      {
        userId: admin.id,
        title: 'Welcome to the Calisthenics Platform!',
        content: 'Welcome everyone! This is your space to share progress, ask questions, and connect with fellow calisthenics enthusiasts. Let\'s build strength together! 💪',
        type: 'TEXT',
        tags: ['welcome', 'community'],
        isPinned: true,
      },
      {
        userId: demoUser.id,
        title: 'My First Week Progress',
        content: 'Just completed my first week of training! Started with 5 push-ups and now I can do 10. Small steps but feeling great! 🎉',
        type: 'PROGRESS_UPDATE',
        tags: ['progress', 'beginner', 'motivation'],
      },
    ];

    for (const post of posts) {
      await prisma.post.create({
        data: post,
      });
    }

    logInfo(`✅ Created ${posts.length} sample posts`);

    logInfo('🎉 Database seeding completed successfully!');

  } catch (error) {
    logError('❌ Error seeding database', error as Error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    logError('Seeding failed', e);
    process.exit(1);
  });