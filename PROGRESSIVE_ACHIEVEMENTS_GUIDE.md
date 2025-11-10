# 🏆 Progressive Achievements System

## Overview

This is a **progressive, cumulative achievement system** aligned with the FIG level progression (BEGINNER → INTERMEDIATE → ADVANCED → ELITE).

### Key Features

✅ **Never Resets** - Progress is cumulative and never goes back to zero
✅ **Color-Coded Tiers** - Each tier has a color matching FIG levels
✅ **One Achievement Evolves** - Same achievement grows through 4 tiers
✅ **FIG-Aligned** - Categories match your FIG progression system
✅ **Auto-Rewards** - XP and coins automatically granted when tier is reached

---

## How It Works

### Example: "Routine Master" Achievement

```
🎯 Routine Master - Complete training routines to master your progression

Tier 1 (BEGINNER):    10 routines  → 🟢 Green  → +100 XP, +50 coins
Tier 2 (INTERMEDIATE): 25 routines  → 🔵 Blue   → +250 XP, +100 coins
Tier 3 (ADVANCED):     50 routines  → 🟣 Purple → +500 XP, +200 coins
Tier 4 (ELITE):        100 routines → 🟠 Gold   → +1000 XP, +500 coins
```

**User Progress:**
- Completes 10 routines → Unlocks Tier 1 (Green badge)
- Continues to 25 routines → Unlocks Tier 2 (Blue badge)
  *Counter shows: 25/50 (working toward Tier 3)*
- **Progress NEVER resets** - Always accumulating

---

## Architecture

### Schema Structure

```prisma
Achievement {
  id, key, name, description
  category: FIG-aligned (BALANCE, STRENGTH, STATIC_HOLDS, CORE, etc.)
  type: CUMULATIVE | MILESTONE | STREAK | CATEGORY
  tiers → [AchievementTier]
}

AchievementTier {
  tier: 1-4
  level: BEGINNER | INTERMEDIATE | ADVANCED | ELITE
  target: number (goal to reach)
  xpReward, coinsReward
  color: #hex (for badge)
}

UserAchievement {
  currentValue: cumulative count (NEVER RESETS)
  currentTier: highest tier reached (0-4)
  tier1CompletedAt, tier2CompletedAt, tier3CompletedAt, tier4CompletedAt
}
```

---

## Achievements Included

### 📋 Routine & Consistency
- **Routine Master** - Complete routines (10 → 25 → 50 → 100)
- **Unstoppable Streak** - Daily streak (7 → 30 → 90 → 365 days)
- **Constant Warrior** - Total training days (30 → 100 → 300 → 1000)

### ⭐ Skills Mastery
- **Skill Collector** - Total skills (10 → 25 → 50 → 100)
- **Balance Master** - Balance skills (5 → 10 → 20 → 35)
- **Strength Titan** - Strength skills (5 → 15 → 30 → 50)
- **Static Holds Master** - Static skills (3 → 8 → 15 → 25)
- **Iron Core** - Core skills (5 → 12 → 25 → 40)

### 💪 Exercise-Specific
- **Pull-up Master** - Total pull-ups (100 → 500 → 1500 → 5000)
- **Dip King** - Total dips (100 → 500 → 1500 → 5000)
- **Handstand King** - Handstand hold time (1min → 5min → 15min → 1hr)
- **Planche Champion** - Planche hold time (30s → 2min → 5min → 15min)
- **Front Lever Master** - Front lever hold (30s → 2min → 5min → 15min)
- **Plank Master** - Plank hold (5min → 20min → 1hr → 3hrs)

### 🔷 Hexagon Growth
- **Balance Specialist** - Balance axis XP (5k → 15k → 40k → 100k)
- **Strength Specialist** - Strength axis XP
- **Static Holds Specialist** - Static holds axis XP
- **Core Specialist** - Core axis XP
- **Endurance Specialist** - Endurance axis XP
- **Mobility Specialist** - Mobility axis XP

### 🏆 Milestones
- **Unstoppable Ascent** - User level (10 → 25 → 50 → 100)
- **XP Hunter** - Total XP (10k → 50k → 150k → 500k)
- **Treasure Hoarder** - Coins earned (1k → 5k → 15k → 50k)

**Total: 25 achievements × 4 tiers = 100 progressive goals**

---

## Integration Guide

### 1. Update Prisma Schema

Add the new models to your `schema.prisma`:

```bash
# Copy the models from prisma/progressive-achievements-schema.prisma
# to your main schema.prisma file
```

### 2. Run Migration

```bash
npx prisma migrate dev --name add_progressive_achievements
npx prisma generate
```

### 3. Run Seed

```bash
npx ts-node prisma/seeds/progressive-achievements-seed.ts
```

This will create:
- 25 achievements
- 100 tiers (4 per achievement)

### 4. Use in Your Code

```typescript
import {
  updateAchievementProgress,
  trackRoutineCompletion,
  trackSkillCompletion,
  trackHexagonAxisXP,
  getAllAchievementsProgress,
} from '@/lib/progressive-achievements';

// When user completes a routine
const result = await trackRoutineCompletion(userId);

if (result.tiersUnlocked.length > 0) {
  // Show celebration modal!
  console.log(`🎉 Unlocked ${result.tiersUnlocked.length} new tiers!`);
  console.log(`Earned ${result.totalXPEarned} XP and ${result.totalCoinsEarned} coins`);
}

// When user completes a skill
await trackSkillCompletion(userId, 'BALANCE');

// When hexagon axis gets XP
await trackHexagonAxisXP(userId, 'strength', 100);

// Get all achievements with progress
const achievements = await getAllAchievementsProgress(userId);
```

### 5. Create API Endpoints

```typescript
// /api/achievements/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAllAchievementsProgress } from '@/lib/progressive-achievements';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const achievements = await getAllAchievementsProgress(session.user.id);
  return NextResponse.json({ achievements });
}
```

### 6. Auto-Track Achievements

Integrate into existing workflows:

**After completing a workout:**
```typescript
// In /api/workout/complete
await trackRoutineCompletion(userId);
await trackTotalTrainingDays(userId);
```

**After completing a skill:**
```typescript
// In /api/user/skills
await trackSkillCompletion(userId, skill.category);
```

**When updating hexagon:**
```typescript
// In /api/hexagon/add-xp
await trackHexagonAxisXP(userId, axis, xpGained);
```

**When user levels up:**
```typescript
// In level update logic
await trackUserLevel(userId, newLevel);
await trackTotalXP(userId, user.totalXP);
```

---

## UI Components

### Achievement Card Component

```tsx
interface AchievementCardProps {
  achievement: {
    name: string;
    description: string;
    iconUrl: string;
    currentValue: number;
    currentTier: number;
    nextTier: {
      tier: number;
      name: string;
      target: number;
      color: string;
    } | null;
    progressToNextTier: number;
  };
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { name, description, iconUrl, currentValue, currentTier, nextTier, progressToNextTier } = achievement;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{iconUrl}</span>
        <div className="flex-1">
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {/* Tier Badge */}
      {currentTier > 0 && (
        <div
          className="mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: nextTier?.color || '#10b981' }}
        >
          Tier {currentTier} Unlocked
        </div>
      )}

      {/* Progress Bar */}
      {nextTier && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{currentValue} / {nextTier.target}</span>
            <span>{Math.round(progressToNextTier)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progressToNextTier}%`,
                backgroundColor: nextTier.color,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Next: Tier {nextTier.tier} - {nextTier.name}
          </p>
        </div>
      )}

      {/* Completed */}
      {!nextTier && (
        <div className="mt-3 text-amber-600 font-medium">
          ✅ All Tiers Completed!
        </div>
      )}
    </div>
  );
}
```

---

## Color Scheme (FIG Levels)

```typescript
const TIER_COLORS = {
  BEGINNER: '#10b981',     // green-500
  INTERMEDIATE: '#3b82f6', // blue-500
  ADVANCED: '#8b5cf6',     // purple-500
  ELITE: '#f59e0b',        // amber-500
};
```

---

## Testing

### Manual Testing

```typescript
// Test routine completion
await updateAchievementProgress(userId, 'routine_completions', 10);
// Should unlock Tier 1

await updateAchievementProgress(userId, 'routine_completions', 15);
// Should unlock Tier 2 (total: 25)

// Check progress
const progress = await getAchievementProgress(userId, 'routine_completions');
console.log(progress);
// {
//   currentValue: 25,
//   currentTier: 2,
//   nextTier: { tier: 3, target: 50, ... }
// }
```

---

## Migration from Old System

If you have existing achievements, you can:

1. Keep old achievements for historical data
2. Run the new seed to create progressive achievements
3. Gradually migrate users to new system
4. Display both in UI during transition

Or:

1. Backup old achievements
2. Clear achievements table
3. Run new seed
4. Recalculate user progress from WorkoutHistory

---

## Next Steps

✅ Schema designed
✅ Seed created (25 achievements, 100 tiers)
✅ API logic implemented
⏳ Integrate into workout/skill completion flows
⏳ Create UI components
⏳ Add celebration modals for tier unlocks
⏳ Create achievements dashboard page

---

## Support

For questions or issues with the progressive achievements system, refer to:
- `/lib/progressive-achievements.ts` - Core logic
- `/prisma/seeds/progressive-achievements-seed.ts` - Achievement definitions
- `/prisma/progressive-achievements-schema.prisma` - Database schema

---

**Happy achieving! 🚀**
