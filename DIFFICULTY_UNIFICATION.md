# Difficulty System Unification

## Overview
The calisthenics platform now uses a **unified 4-tier difficulty system** across all features:

```
BEGINNER → INTERMEDIATE → ADVANCED → ELITE
```

## Changes Made

### Before (Inconsistent)
- **User fitness level**: BEGINNER, INTERMEDIATE, ADVANCED, ELITE ✅
- **Exercise/Workout difficulty**: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT ❌
- **Exercise ranking**: D, C, B, A, S (separate system)

### After (Unified)
All systems now use: **BEGINNER, INTERMEDIATE, ADVANCED, ELITE**

## Mapping Guide

### Rank to Difficulty
The 5-level Rank system maps to 4-level Difficulty:

| Rank | Difficulty | Description |
|------|------------|-------------|
| D | BEGINNER | Fundamentals & basics |
| C | INTERMEDIATE | Lower intermediate |
| B | INTERMEDIATE | Upper intermediate |
| A | ADVANCED | Proficient & skilled |
| S | ELITE | Mastery & expert |

### Numeric Scores
For calculations and comparisons:

| Difficulty | Score (0-10) |
|------------|-------------|
| BEGINNER | 2 |
| INTERMEDIATE | 5 |
| ADVANCED | 8 |
| ELITE | 10 |

## Updated Schema

### Models Using Difficulty

1. **User**
   - `fitnessLevel: Difficulty` (was FitnessLevel)

2. **Exercise**
   - `difficulty: Difficulty`
   - `rank: Rank?` (optional fine-grained classification)

3. **Workout**
   - `difficulty: Difficulty`

4. **Course**
   - `difficulty: Difficulty`

5. **Skill**
   - `difficulty: Difficulty`

6. **TrainingGoal**
   - `difficulty: Difficulty`

7. **WorkoutHistory**
   - `difficulty: Difficulty`

8. **UserSkillProgress**
   - `currentLevel: String` (BEGINNER/INTERMEDIATE/ADVANCED/ELITE)

## Migration Steps

### For Developers

1. **Update Prisma schema** ✅
   ```bash
   # Already done - schema.prisma updated
   ```

2. **Generate Prisma client**
   ```bash
   cd prisma
   npx prisma generate
   ```

3. **Create migration**
   ```bash
   npx prisma migrate dev --name unify_difficulty_levels
   ```

4. **Update database** (if needed)
   ```sql
   -- SQLite will handle enum changes automatically
   -- No manual updates needed for new installations
   ```

### For Existing Data

If you have existing data with EXPERT values:

```typescript
import { migrateLegacyDifficulty } from '@/lib/difficulty-utils';

// Convert old values
const newDifficulty = migrateLegacyDifficulty(oldValue);
// EXPERT → ELITE
// Others remain unchanged
```

## Usage Examples

### In Components

```typescript
import { getDifficultyClasses, getDifficultyDescription } from '@/lib/difficulty-utils';

// Get Tailwind classes for badges
const classes = getDifficultyClasses('INTERMEDIATE');
// Returns: 'bg-blue-100 text-blue-800 border-blue-300'

// Get description
const desc = getDifficultyDescription('ADVANCED');
// Returns: 'Proficient & skilled - Mastering techniques'
```

### In Assessments

```typescript
import { scoreToDifficulty } from '@/lib/difficulty-utils';

// Convert assessment score to difficulty
const totalScore = 7; // from 0-9 assessment
const level = scoreToDifficulty(totalScore);
// Returns: 'ADVANCED'
```

### In Exercise Filtering

```typescript
import { rankToDifficulty } from '@/lib/difficulty-utils';

// Filter exercises by unified difficulty
const exercises = allExercises.filter(ex => {
  const exDifficulty = ex.rank 
    ? rankToDifficulty(ex.rank)
    : ex.difficulty;
  return exDifficulty === userLevel;
});
```

## UI Color Scheme

Consistent colors across the platform:

| Difficulty | Color | Tailwind Classes |
|------------|-------|------------------|
| BEGINNER | Green | `bg-green-100 text-green-800 border-green-300` |
| INTERMEDIATE | Blue | `bg-blue-100 text-blue-800 border-blue-300` |
| ADVANCED | Purple | `bg-purple-100 text-purple-800 border-purple-300` |
| ELITE | Red | `bg-red-100 text-red-800 border-red-300` |

## Benefits

1. **Consistency**: Single difficulty system across entire platform
2. **Clarity**: Clear progression path for users
3. **Maintainability**: Easier to manage and update
4. **Scalability**: Easy to add features aligned with difficulty levels
5. **UX**: Consistent user experience everywhere

## Future Enhancements

Possible future additions while maintaining 4-tier core:

- **Sub-levels**: INTERMEDIATE_LOW, INTERMEDIATE_HIGH (internal use only)
- **Progress bars**: Visual indicators within each tier
- **Skill-specific tiers**: Per-branch difficulty tracking (already implemented)

## Questions?

Contact the development team or refer to:
- `/lib/difficulty-utils.ts` - Utility functions
- `/lib/fig-level-progressions.ts` - FIG skill progressions
- `prisma/schema.prisma` - Database schema
