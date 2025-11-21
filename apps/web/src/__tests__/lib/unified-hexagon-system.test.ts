import {
  getUnifiedLevelFromXP,
  getUnifiedVisualValueFromXP,
  updateUnifiedAxisXP,
  initializeUnifiedHexagonProfile,
  getUnifiedXPToNextLevel,
  getUnifiedLevelProgress,
  formatUnifiedXP,
  UNIFIED_XP_THRESHOLDS,
} from '@/lib/unified-hexagon-system';

describe('Unified Hexagon System', () => {
  describe('getUnifiedLevelFromXP', () => {
    it('should return BEGINNER for XP < 48000', () => {
      expect(getUnifiedLevelFromXP(0)).toBe('BEGINNER');
      expect(getUnifiedLevelFromXP(1000)).toBe('BEGINNER');
      expect(getUnifiedLevelFromXP(47999)).toBe('BEGINNER');
    });

    it('should return INTERMEDIATE for XP 48000-143999', () => {
      expect(getUnifiedLevelFromXP(48000)).toBe('INTERMEDIATE');
      expect(getUnifiedLevelFromXP(100000)).toBe('INTERMEDIATE');
      expect(getUnifiedLevelFromXP(143999)).toBe('INTERMEDIATE');
    });

    it('should return ADVANCED for XP 144000-383999', () => {
      expect(getUnifiedLevelFromXP(144000)).toBe('ADVANCED');
      expect(getUnifiedLevelFromXP(250000)).toBe('ADVANCED');
      expect(getUnifiedLevelFromXP(383999)).toBe('ADVANCED');
    });

    it('should return ELITE for XP >= 384000', () => {
      expect(getUnifiedLevelFromXP(384000)).toBe('ELITE');
      expect(getUnifiedLevelFromXP(500000)).toBe('ELITE');
      expect(getUnifiedLevelFromXP(1000000)).toBe('ELITE');
    });
  });

  describe('getUnifiedVisualValueFromXP', () => {
    it('should return 0-2.5 for BEGINNER', () => {
      expect(getUnifiedVisualValueFromXP(0, 'BEGINNER')).toBe(0);
      expect(getUnifiedVisualValueFromXP(24000, 'BEGINNER')).toBeCloseTo(1.25, 1);
      expect(getUnifiedVisualValueFromXP(47999, 'BEGINNER')).toBeLessThan(2.5);
    });

    it('should return 2.5-5.0 for INTERMEDIATE', () => {
      expect(getUnifiedVisualValueFromXP(48000, 'INTERMEDIATE')).toBeCloseTo(2.5, 1);
      expect(getUnifiedVisualValueFromXP(96000, 'INTERMEDIATE')).toBeCloseTo(3.75, 1);
    });

    it('should return 5.0-7.5 for ADVANCED', () => {
      expect(getUnifiedVisualValueFromXP(144000, 'ADVANCED')).toBeCloseTo(5.0, 1);
    });

    it('should return 7.5-10.0 for ELITE', () => {
      expect(getUnifiedVisualValueFromXP(384000, 'ELITE')).toBeCloseTo(7.5, 1);
    });

    it('should cap at 10', () => {
      expect(getUnifiedVisualValueFromXP(2000000, 'ELITE')).toBeLessThanOrEqual(10);
    });
  });

  describe('initializeUnifiedHexagonProfile', () => {
    it('should create profile with default values', () => {
      const profile = initializeUnifiedHexagonProfile();

      expect(profile.balance).toBe(0);
      expect(profile.strength).toBe(0);
      expect(profile.staticHolds).toBe(0);
      expect(profile.core).toBe(0);
      expect(profile.endurance).toBe(0);
      expect(profile.mobility).toBe(0);

      expect(profile.balanceLevel).toBe('BEGINNER');
      expect(profile.strengthLevel).toBe('BEGINNER');
    });

    it('should create profile with initial XP', () => {
      const profile = initializeUnifiedHexagonProfile({
        strength: 50000,
        core: 150000,
      });

      expect(profile.strengthXP).toBe(50000);
      expect(profile.strengthLevel).toBe('INTERMEDIATE');

      expect(profile.coreXP).toBe(150000);
      expect(profile.coreLevel).toBe('ADVANCED');
    });
  });

  describe('updateUnifiedAxisXP', () => {
    it('should add XP to an axis', () => {
      const profile = initializeUnifiedHexagonProfile();
      const updated = updateUnifiedAxisXP(profile, 'strength', 1000);

      expect(updated.strengthXP).toBe(1000);
      expect(updated.strengthLevel).toBe('BEGINNER');
    });

    it('should update level when XP crosses threshold', () => {
      const profile = initializeUnifiedHexagonProfile({ strength: 47000 });
      const updated = updateUnifiedAxisXP(profile, 'strength', 2000);

      expect(updated.strengthXP).toBe(49000);
      expect(updated.strengthLevel).toBe('INTERMEDIATE');
    });

    it('should update visual value', () => {
      const profile = initializeUnifiedHexagonProfile();
      const updated = updateUnifiedAxisXP(profile, 'balance', 24000);

      expect(updated.balance).toBeGreaterThan(0);
      expect(updated.balance).toBeLessThan(2.5);
    });
  });

  describe('getUnifiedXPToNextLevel', () => {
    it('should calculate XP needed for next level', () => {
      expect(getUnifiedXPToNextLevel(0)).toBe(48000);
      expect(getUnifiedXPToNextLevel(40000)).toBe(8000);
      expect(getUnifiedXPToNextLevel(48000)).toBe(96000); // 144000 - 48000
    });

    it('should return 0 for ELITE', () => {
      expect(getUnifiedXPToNextLevel(400000)).toBe(0);
    });
  });

  describe('getUnifiedLevelProgress', () => {
    it('should return 0% at level start', () => {
      expect(getUnifiedLevelProgress(0)).toBe(0);
      expect(getUnifiedLevelProgress(48000)).toBe(0);
    });

    it('should return 50% at level midpoint', () => {
      expect(getUnifiedLevelProgress(24000)).toBe(50);
      expect(getUnifiedLevelProgress(96000)).toBe(50);
    });

    it('should cap at 100%', () => {
      expect(getUnifiedLevelProgress(47999)).toBeLessThanOrEqual(100);
    });
  });

  describe('formatUnifiedXP', () => {
    it('should format small numbers as is', () => {
      expect(formatUnifiedXP(500)).toBe('500');
      expect(formatUnifiedXP(999)).toBe('999');
    });

    it('should format large numbers with k suffix', () => {
      expect(formatUnifiedXP(1000)).toBe('1.0k');
      expect(formatUnifiedXP(5500)).toBe('5.5k');
      expect(formatUnifiedXP(48000)).toBe('48.0k');
    });
  });
});
