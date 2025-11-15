# 🔄 Assessment ↔ Routine Generator V3 - Synchronization Complete

## 📅 Date: $(date)
## 🎯 Status: **FULLY SYNCHRONIZED**

---

## 📝 Overview

The initial assessment that users complete during onboarding is now **fully synchronized** with the Routine Generator V3. When users complete their assessment, their strength metrics are automatically stored and used to:

1. ✅ Determine their training stage (STAGE_1_2, STAGE_3, or STAGE_4)
2. ✅ Apply skill gating for injury prevention
3. ✅ Generate appropriate weekly routines with Mode 1/Mode 2 split

---

## 🔗 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  USER ONBOARDING FLOW                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Demographics & Goals                                │
│  - Age, height, weight, gender                               │
│  - Training goals (strength, skills, etc.)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Equipment                                           │
│  - Floor, pull-up bar, rings, parallel bars, bands          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Fundamental Tests ⭐ KEY FOR V3                     │
│  - pushUps          → user.pushUpsMax                        │
│  - pullUps          → user.pullUpsMax                        │
│  - dips             → user.dipsMax                           │
│  - deadHangTime, plankTime, squats, etc.                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Advanced Skills ⭐ KEY FOR V3                       │
│  - weightedPullUps  → user.weightedPullUps (converted to kg)│
│  - weightedDips     → user.weightedDips (converted to kg)   │
│  - Handstand, Planche, Front Lever, etc.                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ASSESSMENT PROCESSING                                       │
│  /api/assessment/fig-initial                                 │
│                                                               │
│  1. Calculate D-S Level (D, C, B, A, S)                     │
│  2. Calculate Hexagon XP & Levels                           │
│  3. 🆕 MAP TO V3 STRENGTH METRICS:                           │
│     - pullUpsMax = step3.pullUps                            │
│     - dipsMax = step3.dips                                  │
│     - pushUpsMax = step3.pushUps                            │
│     - weightedPullUps = convertWeightEnumToKg(step4.weight) │
│     - weightedDips = convertWeightEnumToKg(step4.weight)    │
│  4. Determine Training Stage (STAGE_1_2, 3, or 4)          │
│  5. Save to User model                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  USER PROFILE UPDATED                                        │
│  ✅ hasCompletedAssessment = true                            │
│  ✅ difficultyLevel (D-S)                                    │
│  ✅ fitnessLevel (BEGINNER/INTERMEDIATE/ADVANCED/ELITE)      │
│  ✅ hexagonProfile (6 axes with XP)                          │
│  ✅ pullUpsMax, dipsMax, pushUpsMax                          │
│  ✅ weightedPullUps, weightedDips                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ROUTINE GENERATOR V3                                        │
│  /api/routines/generate-v3                                   │
│                                                               │
│  1. Read user strength metrics                              │
│  2. Determine training stage from metrics                   │
│  3. Apply skill gating                                      │
│  4. Generate weekly routine with:                           │
│     - Correct splits by stage                               │
│     - Mode 1 (buffer) for skills                            │
│     - Mode 2 (failure) for strength                         │
│     - Specific warm-ups                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔢 Data Mapping

### Assessment → V3 Strength Metrics

| Assessment Field | V3 Field | Conversion | Notes |
|-----------------|----------|------------|-------|
| `step3.pullUps` | `user.pullUpsMax` | Direct | Max reps without weight |
| `step3.dips` | `user.dipsMax` | Direct | Max reps without weight |
| `step3.pushUps` | `user.pushUpsMax` | Direct | Max reps |
| `step4.weightedPullUps` | `user.weightedPullUps` | Enum → kg | See conversion table below |
| `step4.weightedDips` | `user.weightedDips` | Enum → kg | See conversion table below |

### Weighted Exercise Conversion Table

| Enum Value | Midpoint (lbs) | Converted (kg) |
|-----------|----------------|----------------|
| `'no'` | 0 | 0.0 |
| `'+10-20lbs'` | 15 | 6.8 |
| `'+25-40lbs'` | 32.5 | 14.7 |
| `'+45lbs+'` | 50 | 22.7 |

**Formula**: `kg = lbs × 0.453592`

---

## 🎯 Training Stage Determination

The assessment automatically determines the user's training stage based on their metrics:

```typescript
function determineTrainingStage(metrics) {
  const bodyWeightKg = 75; // Average assumption
  const weightedPullUpPercent = metrics.weightedPullUps / bodyWeightKg;
  const weightedDipPercent = metrics.weightedDips / bodyWeightKg;

  // STAGE 4: Elite
  if (weightedPullUpPercent >= 0.25 || weightedDipPercent >= 0.40) {
    return 'STAGE_4'; // Skills + Weighted bifurcated training
  }

  // STAGE 3: Advanced
  if (metrics.pullUpsMax >= 12 && metrics.dipsMax >= 15) {
    return 'STAGE_3'; // Weighted work focus
  }

  // STAGE 1-2: Foundation
  return 'STAGE_1_2'; // Build base strength
}
```

### Stage Breakdown

| Stage | Criteria | Focus | Split Example |
|-------|----------|-------|---------------|
| **STAGE_1_2** | <12 pull-ups OR <15 dips | Foundation building | Push / Legs / Pull |
| **STAGE_3** | 12+ pull-ups AND 15+ dips | Weighted work | Weighted Push / Legs / Weighted Pull |
| **STAGE_4** | +25% BW pull-ups OR +40% BW dips | Skills + Weighted | Skills Push / Legs / Skills Pull |

---

## 🛡️ Skill Gating Integration

The assessment metrics are used for skill gating:

| Skill Path | Requirement | Check |
|-----------|-------------|-------|
| **Planche** | 15+ dips | `user.dipsMax >= 15` |
| **Front Lever** | 8+ pull-ups | `user.pullUpsMax >= 8` |
| **One-Arm Pull-up** | 15-20 pull-ups | `user.pullUpsMax >= 15` |
| **HSPU** | 20+ push-ups | `user.pushUpsMax >= 20` |
| **Muscle-up** | 10+ pull-ups AND 10+ dips | `user.pullUpsMax >= 10 && user.dipsMax >= 10` |

**Result**: Users who don't meet requirements won't receive dangerous advanced exercises.

---

## 📋 Updated Database Schema

The assessment now populates these V3 fields in the User model:

```prisma
model User {
  // ... existing fields

  // 🆕 V3 Strength Metrics (populated by assessment)
  pullUpsMax      Int?    // Max pull-ups without weight
  dipsMax         Int?    // Max dips without weight
  pushUpsMax      Int?    // Max push-ups
  weightedPullUps Float?  // Additional weight in kg
  weightedDips    Float?  // Additional weight in kg
  masteryGoals    String? // JSON array of MasteryGoal
}
```

---

## 🧪 Example Assessment Flow

### Scenario: Intermediate User

**Input (Step 3)**:
```json
{
  "pushUps": 25,
  "pullUps": 10,
  "dips": 12,
  "deadHangTime": 45,
  "plankTime": 60,
  "hollowBodyHold": 30,
  "squats": 30,
  "pistolSquat": "assisted"
}
```

**Input (Step 4)**:
```json
{
  "weightedPullUps": "+10-20lbs",
  "weightedDips": "+10-20lbs",
  "handstand": "wall_15-60s",
  "planche": "frog_tuck_5-10s",
  // ... other skills
}
```

**Processing**:
1. ✅ `pullUpsMax = 10` (from step3)
2. ✅ `dipsMax = 12` (from step3)
3. ✅ `pushUpsMax = 25` (from step3)
4. ✅ `weightedPullUps = 6.8 kg` (converted from '+10-20lbs')
5. ✅ `weightedDips = 6.8 kg` (converted from '+10-20lbs')
6. ✅ Training Stage = **STAGE_1_2** (doesn't meet Stage 3 criteria)

**Result**:
- User gets Foundation Building routines (100% Mode 2)
- Split: Push / Legs / Pull
- Planche path: **BLOCKED** (needs 15+ dips)
- Front Lever path: **UNLOCKED** (has 10+ pull-ups)

---

## 🔍 API Response Example

When assessment completes, the API returns:

```json
{
  "success": true,
  "assignedLevel": "C",
  "visualRank": "C+",
  "hexagonProfile": { ... },
  "v3StrengthMetrics": {
    "pullUpsMax": 10,
    "dipsMax": 12,
    "pushUpsMax": 25,
    "weightedPullUps": 6.8,
    "weightedDips": 6.8,
    "trainingStage": "STAGE_1_2"
  }
}
```

---

## ✅ Verification Steps

To verify synchronization works:

1. **Complete Assessment**:
   - Navigate to `/onboarding/assessment`
   - Complete all 4 steps
   - Submit assessment

2. **Check Database**:
   ```sql
   SELECT
     id,
     pullUpsMax,
     dipsMax,
     pushUpsMax,
     weightedPullUps,
     weightedDips,
     hasCompletedAssessment
   FROM User
   WHERE id = 'your-user-id';
   ```

3. **Generate V3 Routine**:
   - Navigate to `/routines-v3`
   - Verify training stage badge
   - Verify exercises match your strength level
   - Check skill gating works

4. **Test API Directly**:
   ```bash
   curl http://localhost:3000/api/routines/generate-v3 \
     -H "x-user-id: your-user-id"
   ```

---

## 📚 Related Documentation

- **V3 Guide**: `ROUTINE_GENERATOR_V3_GUIDE.md`
- **Migration Guide**: `MIGRATION_V2_TO_V3.md`
- **V3 Complete**: `V3_MIGRATION_COMPLETE.md`
- **Assessment Logic**: `apps/web/src/lib/assessment-d-s-logic.ts`

---

## 🎓 Key Benefits

1. **Zero Manual Input**: Users never need to re-enter their strength metrics
2. **Automatic Stage Detection**: Training progresses automatically as user improves
3. **Injury Prevention**: Skill gating based on actual assessed strength
4. **Personalized from Day 1**: First routine is perfectly tailored to user's level
5. **Consistent Data**: One source of truth (assessment) feeds all systems

---

## 🔄 Future Enhancements

### Recommended
1. **Re-assessment**: Allow users to update metrics periodically
2. **Auto-progression**: Track workout completion to auto-update metrics
3. **Progress Dashboard**: Show how metrics improve over time
4. **Milestone Notifications**: Alert when user unlocks new training stage

### Advanced
1. **Video Analysis**: Use AI to verify exercise form and reps
2. **Smart Estimation**: Estimate weighted capacity from bodyweight reps
3. **Peer Comparison**: Show percentile ranking vs similar users
4. **Injury History**: Adjust gating based on past injuries

---

## ✅ Conclusion

The assessment system is now **fully synchronized** with Routine Generator V3:

- ✅ All strength metrics captured during onboarding
- ✅ Automatic training stage determination
- ✅ Skill gating for safety
- ✅ Seamless data flow from assessment → routines
- ✅ Zero manual re-entry required

**Users complete ONE assessment and get personalized, safe, expert-level training immediately.**

---

**Integration Date**: 2025-11-15
**Version**: 1.0.0
**Status**: ✅ Production Ready
