/**
 * Unit tests for unified training stage calculation
 */

import { calculateUnifiedStage, type UnifiedStageParams } from '../training-stages';

describe('calculateUnifiedStage', () => {
  describe('From direct performance metrics', () => {
    test('STAGE_1: beginner with no pull-ups or dips', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 0,
        dipsMax: 0,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_1');
    });

    test('STAGE_2: can do 5 pull-ups and 8 dips', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 5,
        dipsMax: 8,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_2');
    });

    test('STAGE_2: can do 1 pull-up (minimum)', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 1,
        dipsMax: 0,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_2');
    });

    test('STAGE_3: 12+ pull-ups AND 15+ dips', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_3');
    });

    test('NOT STAGE_3: 12+ pull-ups but only 10 dips', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 10,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_2');
    });

    test('STAGE_4: weighted pull-ups with +25% BW (75kg user)', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 75,
        weightedPullUps: 18.75, // 25% of 75kg
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });

    test('STAGE_4: weighted dips with +40% BW (75kg user)', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 75,
        weightedDips: 30, // 40% of 75kg
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });

    test('uses correct body weight for calculations (60kg user)', () => {
      // 60kg user needs +15kg for 25% BW
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 60,
        weightedPullUps: 15, // 25% of 60kg
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });

    test('uses correct body weight for calculations (100kg user)', () => {
      // 100kg user needs +25kg for 25% BW
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 100,
        weightedPullUps: 25, // 25% of 100kg
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });

    test('NOT STAGE_4: weighted but less than required percentage', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 75,
        weightedPullUps: 10, // Only 13.3%, needs 18.75kg (25%)
        weightedDips: 20, // Only 26.7%, needs 30kg (40%)
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_3'); // Not enough weight for STAGE_4
    });
  });

  describe('From hexagon profile (fallback)', () => {
    test('BEGINNER strength level → STAGE_1', () => {
      const params: UnifiedStageParams = {
        strengthLevel: 'BEGINNER',
        strengthXP: 0,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_1');
    });

    test('INTERMEDIATE with low XP → STAGE_2', () => {
      const params: UnifiedStageParams = {
        strengthLevel: 'INTERMEDIATE',
        strengthXP: 100000, // < 144000
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_2');
    });

    test('INTERMEDIATE with high XP → STAGE_3', () => {
      const params: UnifiedStageParams = {
        strengthLevel: 'INTERMEDIATE',
        strengthXP: 200000, // >= 144000
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_3');
    });

    test('ADVANCED with low XP → STAGE_3', () => {
      const params: UnifiedStageParams = {
        strengthLevel: 'ADVANCED',
        strengthXP: 300000, // < 384000
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_3');
    });

    test('ADVANCED with high XP → STAGE_4', () => {
      const params: UnifiedStageParams = {
        strengthLevel: 'ADVANCED',
        strengthXP: 500000, // >= 384000
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });

    test('ELITE strength level → STAGE_4', () => {
      const params: UnifiedStageParams = {
        strengthLevel: 'ELITE',
        strengthXP: 600000,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });
  });

  describe('Priority and fallbacks', () => {
    test('prioritizes direct metrics over hexagon profile', () => {
      const params: UnifiedStageParams = {
        // Direct metrics say STAGE_3
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 75,

        // But hexagon says BEGINNER (should be ignored)
        strengthLevel: 'BEGINNER',
        strengthXP: 0,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_3'); // Uses direct metrics
    });

    test('uses hexagon when no direct metrics', () => {
      const params: UnifiedStageParams = {
        // No direct metrics
        strengthLevel: 'ADVANCED',
        strengthXP: 500000,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4'); // Uses hexagon
    });

    test('defaults to STAGE_1 when no data', () => {
      const params: UnifiedStageParams = {};

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_1'); // Safest default
    });

    test('uses default body weight (75kg) when not provided', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        // No bodyWeight provided - should default to 75kg
        weightedPullUps: 18.75, // This is 25% of 75kg
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4'); // Should work with default weight
    });
  });

  describe('Edge cases', () => {
    test('handles zero values correctly', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 0,
        dipsMax: 0,
        pushUpsMax: 0,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_1');
    });

    test('handles undefined optional fields', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 10,
        dipsMax: 15,
        // pushUpsMax, weightedPullUps, weightedDips undefined
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_2');
    });

    test('exact threshold for STAGE_3 (12 pull-ups, 15 dips)', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 12, // Exactly 12
        dipsMax: 15, // Exactly 15
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_3');
    });

    test('just below threshold for STAGE_3', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 11, // Just below 12
        dipsMax: 15,
        bodyWeight: 75,
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_2');
    });

    test('exact threshold for STAGE_4 (25% weighted pull-ups)', () => {
      const params: UnifiedStageParams = {
        pullUpsMax: 15,
        dipsMax: 20,
        bodyWeight: 80,
        weightedPullUps: 20, // Exactly 25% of 80kg
      };

      const stage = calculateUnifiedStage(params);
      expect(stage).toBe('STAGE_4');
    });
  });
});
