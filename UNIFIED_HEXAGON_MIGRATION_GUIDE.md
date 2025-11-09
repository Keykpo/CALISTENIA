# Unified Hexagon System - Migration Guide

## 📊 Overview

This document describes the **Unified Hexagon System** - a simplified and better-aligned version of the skill hexagon that maps directly to FIG categories.

## ✨ What's New

### 🔄 Simplified Axis Names

**Old System (6 axes):**
- `relativeStrength` → **NEW:** `strength`
- `muscularEndurance` → **NEW:** `endurance`
- `balanceControl` → **NEW:** `balance`
- `jointMobility` → **NEW:** `mobility`
- `bodyTension` → **NEW:** `core`
- `skillTechnique` → **NEW:** `staticHolds`

### 🎯 Direct FIG Alignment

The new system maps 1:1 with FIG skill categories:

| FIG Category | Hexagon Axis | Description |
|-------------|--------------|-------------|
| **BALANCE** | `balance` | Handstands, press handstands, rings handstands |
| **STRENGTH** | `strength` | Pull-ups, dips, muscle-ups, pistol squats |
| **SKILL_STATIC** | `staticHolds` | Planche, front lever, back lever, iron cross, flag |
| **CORE** | `core` | Ab wheel, L-sit/Manna progressions |
| *Transversal* | `endurance` | Calculated from workout volume/duration |
| *Transversal* | `mobility` | Based on flexibility/ROM requirements |

### 🎨 Unified Components

1. **`UnifiedHexagon`** - New visualization component with clearer labels and icons
2. **`UnifiedSkillAssessment`** - Combines old "Skill Profile" + "Skill Level Assessment" into ONE card
3. **Backward Compatible** - Works alongside existing system via migration function

---

## 📂 Files Created

### Core System Files

| File | Path | Description |
|------|------|-------------|
| **unified-hexagon-system.ts** | `apps/web/src/lib/` | Core unified hexagon logic, types, XP calculation |
| **unified-fig-hexagon-mapping.ts** | `apps/web/src/lib/` | FIG skill → Hexagon axis mapping, XP distribution |

### Component Files

| File | Path | Description |
|------|------|-------------|
| **UnifiedHexagon.tsx** | `apps/web/src/components/` | New hexagon visualization with 6 simplified axes |
| **UnifiedSkillAssessment.tsx** | `apps/web/src/components/` | Unified Profile + Assessment component |

### API Endpoints

| File | Path | Description |
|------|------|-------------|
| **route.ts** | `apps/web/src/app/api/hexagon/recalculate/` | Recalculate hexagon from FIG assessments |

### Updated Files

| File | Changes |
|------|---------|
| **ProfileView.tsx** | Now uses `UnifiedSkillAssessment` instead of two separate cards |
| **DashboardOverview.tsx** | Now uses `UnifiedHexagon` component |

---

## 🔧 Implementation Status

### ✅ **What's Implemented**

1. ✅ New unified hexagon system with simplified axis names
2. ✅ FIG → Hexagon mapping with multi-axis contributions
3. ✅ Migration function `migrateToUnifiedHexagon()` for backward compatibility
4. ✅ `UnifiedHexagon` component with improved visuals
5. ✅ `UnifiedSkillAssessment` component (combines Profile + Assessment)
6. ✅ API endpoint `/api/hexagon/recalculate` for FIG-based recalculation
7. ✅ Dashboard integration with fallback to old system
8. ✅ Profile page integration

### 🔄 **Backward Compatibility Approach**

The new system works **alongside** the existing database schema. It uses a **migration function** to map old field names to new ones:

```typescript
// Example: Converting old hexagon to new unified format
const oldHexagon = {
  relativeStrength: 5.2,
  balanceControl: 3.8,
  // ... other old fields
};

const unifiedHexagon = migrateToUnifiedHexagon(oldHexagon);
// Result: { strength: 5.2, balance: 3.8, ... }
```

This means:
- ✅ **No breaking changes** to existing database
- ✅ **No data migration required** immediately
- ✅ Components work with both old and new formats
- ✅ Gradual migration path available

---

## 🚀 How to Use

### 1. Using UnifiedHexagon Component

```tsx
import UnifiedHexagon from '@/components/UnifiedHexagon';
import { migrateToUnifiedHexagon } from '@/lib/unified-hexagon-system';

// In your component:
const oldHexProfile = userData.hexagon; // From database

<UnifiedHexagon
  profile={migrateToUnifiedHexagon(oldHexProfile)}
  showCard={true}
  animated={true}
  size={400}
  showRanks={true}
  showAxisDetails={true}
/>
```

### 2. Using UnifiedSkillAssessment Component

```tsx
import UnifiedSkillAssessment from '@/components/UnifiedSkillAssessment';
import { migrateToUnifiedHexagon } from '@/lib/unified-hexagon-system';

<UnifiedSkillAssessment
  userId={userId}
  hexagonProfile={hexProfile ? migrateToUnifiedHexagon(hexProfile) : null}
  onUpdate={() => refetchUserData()}
/>
```

### 3. Recalculating Hexagon from FIG Assessments

The `UnifiedSkillAssessment` component has a built-in "Recalculate from FIG Assessments" button that:

1. Reads all user's FIG skill assessment scores
2. Maps each skill to hexagon axes based on `unified-fig-hexagon-mapping.ts`
3. Calculates XP for each axis
4. Updates the hexagon profile in the database

**API Call (if calling manually):**
```typescript
const response = await fetch('/api/hexagon/recalculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  },
});
```

---

## 📊 XP Distribution Logic

### Primary Axis Assignment

Each FIG skill has a **primary axis** where most XP goes:

```typescript
HANDSTAND → balance (70% of XP)
PLANCHE → staticHolds (60% of XP)
PULL_UPS → strength (70% of XP)
AB_WHEEL → core (80% of XP)
```

### Secondary Contributions

Some skills contribute to multiple axes:

```typescript
HANDSTAND: {
  balance: 0.7,    // 70% primary
  core: 0.2,       // 20% secondary (core stability required)
  mobility: 0.1    // 10% tertiary (shoulder mobility)
}

PLANCHE: {
  staticHolds: 0.6,  // 60% primary
  strength: 0.3,     // 30% secondary (straight arm strength)
  core: 0.1          // 10% tertiary (core compression)
}
```

### Endurance Bonus

Workouts longer than 5 minutes receive an **endurance bonus**:
- Bonus = `min(totalXP * 0.2, duration * 10)`
- Capped at 20% of base XP

---

## 🎨 Visual Differences

### Old Hexagon vs Unified Hexagon

| Feature | Old SkillHexagon | New UnifiedHexagon |
|---------|-----------------|-------------------|
| **Axis Labels** | "Relative Strength", "Balance Control" | "Strength 💪", "Balance ⚖️" |
| **Icons** | None | Emoji icons for each axis |
| **Detail View** | Separate component | Built-in axis breakdown |
| **Level Display** | Rank only | Rank + Level + Progress % |
| **Colors** | Single purple | Unique color per axis |

### Profile View Changes

**Before:**
- 🔲 Card 1: "Skill Profile" (level badge + recalculate button)
- 🔲 Card 2: "Skill Level Assessment" (warning + retake button)

**After:**
- 🔲 **Single Unified Card:** "Skill Assessment"
  - Full hexagon visualization
  - Overall level badge
  - Detailed axis breakdown
  - "Recalculate from FIG" button
  - "Retake Assessments" button
  - All in one place!

---

## 🔮 Optional: Full Database Migration

If you want to **fully migrate** to the new system (optional), you can:

### Option 1: Keep Both Systems (Current Approach)

- ✅ **Recommended** for now
- No schema changes needed
- Works with existing data
- Can switch back easily

### Option 2: Migrate Database Schema (Advanced)

**⚠️ Only do this if you want to fully commit to new names**

1. Create a Prisma migration to rename fields:
```prisma
model HexagonProfile {
  // Old names (deprecated):
  // relativeStrength → strength
  // balanceControl → balance
  // skillTechnique → staticHolds
  // bodyTension → core
  // muscularEndurance → endurance
  // jointMobility → mobility

  // New unified names:
  balance Float @default(0)
  strength Float @default(0)
  staticHolds Float @default(0)
  core Float @default(0)
  endurance Float @default(0)
  mobility Float @default(0)

  balanceXP Int @default(0)
  strengthXP Int @default(0)
  staticHoldsXP Int @default(0)
  coreXP Int @default(0)
  enduranceXP Int @default(0)
  mobilityXP Int @default(0)

  balanceLevel String @default("BEGINNER")
  strengthLevel String @default("BEGINNER")
  staticHoldsLevel String @default("BEGINNER")
  coreLevel String @default("BEGINNER")
  enduranceLevel String @default("BEGINNER")
  mobilityLevel String @default("BEGINNER")
}
```

2. Run migration:
```bash
npx prisma migrate dev --name unified_hexagon_rename
```

3. Update all API routes to use new field names

4. Remove `migrateToUnifiedHexagon()` calls (no longer needed)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Navigate to Profile page → Should see new unified "Skill Assessment" card
- [ ] Click "Recalculate from FIG Assessments" → Should update hexagon based on FIG data
- [ ] Navigate to Dashboard → Should see new hexagon visualization
- [ ] Check that old hexagon still renders if unified version fails
- [ ] Verify XP distribution works correctly after completing workouts
- [ ] Test with users who have NO assessments (should initialize with defaults)

### Integration Points to Verify

1. **Profile Page** (`/dashboard?tab=profile`)
   - [ ] UnifiedSkillAssessment renders correctly
   - [ ] Recalculate button works
   - [ ] Retake assessments navigates correctly

2. **Dashboard Overview** (`/dashboard`)
   - [ ] UnifiedHexagon displays with correct values
   - [ ] Falls back to old hexagon if needed
   - [ ] Real-time updates work

3. **API Endpoint** (`/api/hexagon/recalculate`)
   - [ ] Reads FIG assessments correctly
   - [ ] Calculates XP accurately
   - [ ] Updates database
   - [ ] Returns updated profile

4. **XP Distribution** (after workout completion)
   - [ ] XP goes to correct axes
   - [ ] Multi-axis contributions work
   - [ ] Endurance bonus applies when appropriate

---

## 📖 Developer Notes

### Key Design Decisions

1. **Why keep old schema?**
   - Avoids breaking existing code
   - Allows gradual migration
   - Easier to test and validate

2. **Why migration function instead of database migration?**
   - Safer approach
   - Reversible
   - Can A/B test both systems

3. **Why unify Profile + Assessment?**
   - Reduces UI clutter
   - Better UX (one place for all skill info)
   - Matches user mental model

### Future Improvements

- [ ] Add "Compare with Previous" feature (show hexagon changes over time)
- [ ] Add "Recommended Training" based on weakest axes
- [ ] Add axis-specific drill recommendations
- [ ] Create admin panel for manual hexagon adjustments
- [ ] Add achievement unlocks for reaching certain axis levels

---

## 🐛 Troubleshooting

### Issue: Hexagon shows all zeros

**Cause:** No FIG assessments or hexagon profile
**Fix:** User needs to complete initial FIG skill assessments

### Issue: Recalculate button doesn't work

**Check:**
1. User ID is passed correctly to component
2. `/api/hexagon/recalculate` endpoint exists
3. Database connection is working
4. Check browser console for errors

### Issue: Old hexagon still showing in Dashboard

**Expected:** If `hexProfile` is null, fallback renders
**Fix:** Make sure user has hexagon data in database

### Issue: Type errors with `migrateToUnifiedHexagon`

**Cause:** Old profile object missing fields
**Fix:** Add type guards or default values:
```typescript
const unifiedProfile = hexProfile
  ? migrateToUnifiedHexagon(hexProfile)
  : initializeUnifiedHexagonProfile();
```

---

## 📞 Support

If you have questions or issues:
1. Check this migration guide
2. Review code comments in `unified-hexagon-system.ts`
3. Test with `console.log()` in components
4. Verify API responses in Network tab

---

## ✅ Summary

The Unified Hexagon System provides:
- ✨ **Simpler axis names** (balance, strength, staticHolds, core, endurance, mobility)
- 🎯 **Direct FIG alignment** (1:1 mapping with FIG skill categories)
- 🎨 **Better UI/UX** (unified assessment card, clearer visualizations)
- 🔄 **Backward compatible** (works with existing database)
- 🚀 **Easy to extend** (multi-axis contributions, endurance bonuses)

**Next Steps:**
1. Test the new components in Profile and Dashboard
2. Verify recalculation works with your FIG assessment data
3. Optionally plan full schema migration if you want to commit fully
4. Enjoy the improved hexagon system! 🎉
