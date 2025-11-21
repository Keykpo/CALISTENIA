import {
  detectExerciseCategory,
  calculateExerciseXPRewards,
} from '@/lib/workout-hexagon-sync';

describe('Workout Hexagon Sync', () => {
  describe('detectExerciseCategory', () => {
    it('should detect PUSH exercises', () => {
      expect(detectExerciseCategory('Push-ups')).toBe('PUSH');
      expect(detectExerciseCategory('Flexiones')).toBe('PUSH');
      expect(detectExerciseCategory('Fondos en paralelas')).toBe('PUSH');
      expect(detectExerciseCategory('Dips')).toBe('PUSH');
      expect(detectExerciseCategory('Bench Press')).toBe('PUSH');
    });

    it('should detect PULL exercises', () => {
      expect(detectExerciseCategory('Pull-ups')).toBe('PULL');
      expect(detectExerciseCategory('Dominadas')).toBe('PULL');
      expect(detectExerciseCategory('Rows')).toBe('PULL');
      expect(detectExerciseCategory('Chin-ups')).toBe('PULL');
    });

    it('should detect STATICS exercises', () => {
      expect(detectExerciseCategory('Front Lever')).toBe('STATICS');
      expect(detectExerciseCategory('Planche')).toBe('STATICS');
      expect(detectExerciseCategory('L-sit')).toBe('STATICS');
      expect(detectExerciseCategory('V-sit')).toBe('STATICS');
    });

    it('should detect BALANCE exercises', () => {
      expect(detectExerciseCategory('Handstand')).toBe('BALANCE');
      expect(detectExerciseCategory('Pino')).toBe('BALANCE');
      expect(detectExerciseCategory('Crow pose')).toBe('BALANCE');
      expect(detectExerciseCategory('Frog stand')).toBe('BALANCE');
    });

    it('should detect CORE exercises', () => {
      expect(detectExerciseCategory('Plancha')).toBe('CORE');
      expect(detectExerciseCategory('Plank')).toBe('CORE');
      expect(detectExerciseCategory('Hollow body')).toBe('CORE');
      expect(detectExerciseCategory('Crunches')).toBe('CORE');
    });

    it('should detect LOWER_BODY exercises', () => {
      expect(detectExerciseCategory('Squats')).toBe('LOWER_BODY');
      expect(detectExerciseCategory('Sentadillas')).toBe('LOWER_BODY');
      expect(detectExerciseCategory('Pistol squat')).toBe('LOWER_BODY');
      expect(detectExerciseCategory('Lunges')).toBe('LOWER_BODY');
    });

    it('should detect FLEXIBILITY exercises', () => {
      expect(detectExerciseCategory('Stretching')).toBe('FLEXIBILITY');
      expect(detectExerciseCategory('Split')).toBe('FLEXIBILITY');
      expect(detectExerciseCategory('Bridge')).toBe('FLEXIBILITY');
      expect(detectExerciseCategory('Yoga')).toBe('FLEXIBILITY');
    });

    it('should detect CARDIO exercises', () => {
      expect(detectExerciseCategory('Burpees')).toBe('CARDIO');
      expect(detectExerciseCategory('Jumping jacks')).toBe('CARDIO');
      expect(detectExerciseCategory('EMOM workout')).toBe('CARDIO');
    });

    it('should detect WARM_UP exercises', () => {
      expect(detectExerciseCategory('Calentamiento general')).toBe('WARM_UP');
      expect(detectExerciseCategory('Circulos de brazos')).toBe('WARM_UP');
    });

    it('should default to PUSH for unknown exercises', () => {
      expect(detectExerciseCategory('Unknown exercise')).toBe('PUSH');
    });
  });

  describe('calculateExerciseXPRewards', () => {
    it('should calculate XP for BEGINNER difficulty', () => {
      const rewards = calculateExerciseXPRewards('Push-ups', 'BEGINNER', 1);

      expect(rewards.strength).toBe(250); // Primary axis for PUSH
      expect(rewards.staticHolds).toBe(100); // Secondary axis
    });

    it('should calculate XP for INTERMEDIATE difficulty', () => {
      const rewards = calculateExerciseXPRewards('Pull-ups', 'INTERMEDIATE', 1);

      expect(rewards.strength).toBe(500);
      expect(rewards.staticHolds).toBe(200);
    });

    it('should calculate XP for ADVANCED difficulty', () => {
      const rewards = calculateExerciseXPRewards('Handstand', 'ADVANCED', 1);

      expect(rewards.balance).toBe(1000); // Primary axis for BALANCE
      expect(rewards.staticHolds).toBe(400); // Secondary
      expect(rewards.core).toBe(400); // Secondary
    });

    it('should calculate XP for ELITE difficulty', () => {
      const rewards = calculateExerciseXPRewards('Front Lever', 'ELITE', 1);

      expect(rewards.staticHolds).toBe(2000);
      expect(rewards.balance).toBe(800);
      expect(rewards.core).toBe(800);
    });

    it('should multiply XP by sets', () => {
      const rewardsSingle = calculateExerciseXPRewards('Push-ups', 'BEGINNER', 1);
      const rewardsTriple = calculateExerciseXPRewards('Push-ups', 'BEGINNER', 3);

      expect(rewardsTriple.strength).toBe(rewardsSingle.strength! * 3);
    });

    it('should handle lowercase difficulty', () => {
      const rewards = calculateExerciseXPRewards('Squats', 'beginner', 1);

      expect(rewards.endurance).toBe(250);
    });

    it('should default to BEGINNER for unknown difficulty', () => {
      const rewards = calculateExerciseXPRewards('Push-ups', 'UNKNOWN', 1);

      expect(rewards.strength).toBe(250);
    });
  });
});
