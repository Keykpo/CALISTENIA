# Database Seeding Guide

This directory contains the seed data and scripts to populate the CALISTENIA database with initial skills and achievements.

## Overview

- **45 Advanced Skills** (Rank A and S) extracted from `exercises_biomech_modified.json`
- **70+ Achievements** across multiple categories
- Proper skill progression with **prerequisite chains**
- Skills organized into **7 branches**: EMPUJE, TRACCION, CORE, EQUILIBRIO, TREN_INFERIOR, ESTATICOS, CALENTAMIENTO

## Files

### 1. `skills-from-exercises.ts`
Converts rank A (Advanced) and S (Expert) exercises into unlockable skills with:
- **Branch mapping** based on muscle groups and exercise categories
- **Difficulty levels**: ADVANCED, EXPERT
- **Prerequisite chains** for skill progression (e.g., Tuck Planche → Advanced Tuck Planche → Frog Planche → Straddle Planche → Full Planche)
- **RPG rewards**: XP and coins based on difficulty
- **Requirements**: Required reps/duration and consistency days

### 2. `achievements-data.ts`
Contains 70+ achievements across categories:
- **Skill Mastery** (20): Complete skills in different branches
- **Branch Completion** (7): Master entire skill branches
- **Level Milestones** (10): Reach specific user levels
- **Daily Missions** (10): Complete daily mission streaks
- **XP & Strength** (8): Accumulate XP and strength points
- **Special Events** (10): Special holiday and event achievements
- **Workout Count** (5): Complete workout milestones

### 3. `seed.ts`
Main seeding script that:
1. Creates all 45 skills in the database
2. Establishes prerequisite relationships between skills
3. Seeds all achievements
4. Provides detailed logging of the process

## Skill Progression Examples

### Front Lever Progression
```
Tuck Front Lever (A)
  ↓
Advanced Tuck Front Lever (A)
  ↓
Front Lever (Una Pierna) (A)
  ↓
Straddle Front Lever (A)
  ↓
Full Front Lever (A)
```

### Planche Progression
```
Tuck Planche (S)
  ↓
Advanced Tuck Planche (S)
  ↓
Frog Planche (S)
  ↓
Straddle Planche (S)
  ↓
Full Planche (S)
```

### Muscle Up Progression
```
Archer Pull Up (A)
  ↓
L-Sit Pull-Ups (A)
  ↓
Negative Muscle Up (S)
  ↓
Muscle Up (Final Integration) (S)
  ↓
Kipping Muscle Up (S)
```

## Running the Seed Script

### Prerequisites
1. Ensure Prisma client is generated:
   ```bash
   npx prisma generate
   ```

2. Ensure the database is created (if using migrations):
   ```bash
   npx prisma migrate dev
   ```

   Or push the schema directly:
   ```bash
   npx prisma db push
   ```

### Run Seeding
```bash
npm run db:seed
```

This will:
- ✅ Create 45 skills across all branches
- ✅ Establish ~50+ prerequisite relationships
- ✅ Create 70 achievements
- ✅ Provide detailed console output of progress

## Skill Distribution by Branch

| Branch | Skills | Description |
|--------|--------|-------------|
| **ESTATICOS** | ~16 | Static holds (Front Lever, Back Lever, Planche variations, L-Sit, V-Sit) |
| **TRACCION** | ~10 | Pull exercises (Archer Pull Up, Muscle Up variations, L-Sit Pull-Ups) |
| **EMPUJE** | ~7 | Push exercises (Archer Push Up, Pseudo Planche Push-ups, Handstand Push-up) |
| **CORE** | ~12 | Core strength (L-Sit variations, V-Sit, static core holds) |

## Skill Difficulty Breakdown

- **ADVANCED (A)**: 25 skills
  - Require 25 strength points
  - Award 8 strength points
  - Award 26 XP and 13 coins
  - Require 3 days of consistency

- **EXPERT (S)**: 20 skills
  - Require 40 strength points
  - Award 12 strength points
  - Award 38 XP and 19 coins
  - Require 5 days of consistency

## Achievement Rarity Distribution

| Rarity | Count | Points Range |
|--------|-------|--------------|
| COMMON | ~15 | 10-20 points |
| UNCOMMON | ~20 | 25-40 points |
| RARE | ~15 | 50-75 points |
| EPIC | ~10 | 100-150 points |
| LEGENDARY | ~10 | 200-500 points |

## Troubleshooting

### Error: "@prisma/client did not initialize yet"
**Solution**: Run `npx prisma generate` to generate the Prisma client.

### Error: "Table doesn't exist"
**Solution**: Run `npx prisma db push` or `npx prisma migrate dev` to create database tables.

### Error: "Unique constraint failed"
**Solution**: The seed script uses `upsert`, so it's safe to run multiple times. If you want to start fresh, you can delete the database and run migrations again.

## Verification

After seeding, verify the data:

```bash
# Open Prisma Studio
npx prisma studio
```

Then check:
1. **Skills table**: Should have 45 records
2. **SkillPrerequisite table**: Should have ~50+ prerequisite relationships
3. **Achievement table**: Should have 70 records

## Next Steps

After seeding:
1. Test skill unlocking logic in the app
2. Verify prerequisite chains work correctly
3. Test achievement triggering based on user actions
4. Adjust XP/coin rewards if needed
5. Add more skills from other difficulty ranks (B, C, D) if desired

## Notes

- Skills are sourced from `database/exercises_biomech_modified.json`
- Only rank A (Advanced) and S (Expert) exercises are converted to skills
- Prerequisites are defined based on common calisthenics progression patterns
- All skills include visual assets (thumbnailUrl) when available from exercises
