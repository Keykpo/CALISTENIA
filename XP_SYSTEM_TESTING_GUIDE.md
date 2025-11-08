# XP System Testing Guide

Complete testing guide for the Hexagon XP Progression System (Part 2B).

## Prerequisites

Before testing, apply the database schema changes:

```bash
# Navigate to project root
cd /home/user/CALISTENIA

# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

---

## Test Flow Overview

```
1. Onboarding Assessment
   ↓ (Calculates initial XP based on scores)
2. Results Page
   ↓ (Shows calculated level from XP)
3. Complete Mission
   ↓ (Awards XP to specific axes)
4. Dashboard Refresh
   ↓ (Shows updated XP and levels)
```

---

## 1. Test Onboarding Assessment

### Start Development Server

```bash
cd apps/web
npm run dev
```

### Test Steps

1. **Navigate to**: `http://localhost:3000/onboarding/assessment`
2. **Complete assessment** with varying scores (e.g., high PUSH, low BALANCE)
3. **Expected Result**:
   - Redirects to `/onboarding/results`
   - Hexagon shows visual values (0-10)
   - Level badge shows calculated level
   - Progress percentage shows % within current level

### Verify Database

```bash
# Check hexagonProfile was created with XP
npx prisma studio

# Or query directly
npx prisma db execute --stdin <<< "SELECT * FROM hexagon_profiles WHERE userId = '<your-user-id>'"
```

**Expected columns:**
- `relativeStrength` (visual 0-10)
- `relativeStrengthXP` (integer, e.g., 600 for BEGINNER)
- `relativeStrengthLevel` (string, e.g., "BEGINNER")
- ... same for other 5 axes

---

## 2. Test Results Page Calculation

### What to Check

**URL**: `/onboarding/results`

**Console logs** (open DevTools):
```javascript
// Should log calculated values
calculatedLevel: "BEGINNER"  // or INTERMEDIATE, etc.
averageXP: 550               // Average across 6 axes
levelProgress: 27            // Percentage (0-100)
```

**Visual checks**:
- ✅ Level badge shows correct level (BEGINNER/INTERMEDIATE/ADVANCED/ELITE)
- ✅ Percentage shows progress within current level
- ✅ Hexagon displays all 6 axes correctly

### Test Cases

| Assessment Level | Expected Avg XP | Expected Progress |
|-----------------|-----------------|-------------------|
| BEGINNER        | ~500           | ~25%              |
| INTERMEDIATE    | ~3500          | ~50%              |
| ADVANCED        | ~7500          | ~50%              |
| EXPERT          | ~12000         | N/A (max level)   |

---

## 3. Test Mission Completion

### Navigate to Dashboard

```bash
# URL: http://localhost:3000/dashboard?userId=<your-user-id>
```

### Complete a Mission

1. **Find active mission** (e.g., "Core Focus")
2. **Click "Complete"**
3. **Expected behavior**:
   - Mission marked as completed
   - Rewards displayed (e.g., +20 XP, +8 coins)
   - Dashboard refreshes

### Verify XP Update

**Check in Prisma Studio** or console logs:

```javascript
// Before mission complete
bodyTensionXP: 500
bodyTensionLevel: "BEGINNER"
bodyTension: 0.625  // visual value

// After completing "Core Focus" mission (20 XP reward)
bodyTensionXP: 514   // +14 XP (70% of 20)
relativeStrengthXP: 506  // +6 XP (30% of 20)
// Levels unchanged (not enough for level up)
```

### Test Level Up

To trigger a level up, complete enough missions to reach 2,000 XP in an axis:

1. **Check current XP** (e.g., `relativeStrengthXP: 1950`)
2. **Complete mission** that rewards relativeStrength
3. **Expected**:
   - `relativeStrengthXP`: 1950 → 2000+
   - `relativeStrengthLevel`: "BEGINNER" → "INTERMEDIATE"
   - `relativeStrength`: ~2.48 → ~2.5 (visual crosses threshold)

---

## 4. Test Dashboard API

### Direct API Test

```bash
# GET dashboard data
curl -X GET "http://localhost:3000/api/dashboard" \
  -H "x-user-id: <your-user-id>"
```

**Expected response**:
```json
{
  "success": true,
  "stats": {
    "totalXP": 150,
    "level": 2,
    "coins": 50,
    "dailyStreak": 1
  },
  "hexagon": {
    "relativeStrength": 0.75,
    "relativeStrengthXP": 600,
    "relativeStrengthLevel": "BEGINNER",
    "muscularEndurance": 0.65,
    "muscularEnduranceXP": 520,
    "muscularEnduranceLevel": "BEGINNER",
    // ... 4 more axes
  },
  "missionsToday": [...]
}
```

---

## 5. Test Hexagon Add-XP API

### Direct API Test

```bash
# POST: Add XP to single axis
curl -X POST "http://localhost:3000/api/hexagon/add-xp" \
  -H "Content-Type: application/json" \
  -H "x-user-id: <your-user-id>" \
  -d '{"axis": "relativeStrength", "xp": 100}'
```

**Expected response**:
```json
{
  "success": true,
  "axis": "relativeStrength",
  "xpAdded": 100,
  "newXP": 700,
  "newLevel": "BEGINNER",
  "newValue": 0.875,
  "profile": { ... }
}
```

### Batch Update Test

```bash
# PUT: Add XP to multiple axes
curl -X PUT "http://localhost:3000/api/hexagon/add-xp" \
  -H "Content-Type: application/json" \
  -H "x-user-id: <your-user-id>" \
  -d '{
    "xpRewards": {
      "relativeStrength": 50,
      "skillTechnique": 20,
      "bodyTension": 30
    }
  }'
```

**Expected response**:
```json
{
  "success": true,
  "axesUpdated": [
    { "axis": "relativeStrength", "xp": 50, "newLevel": "BEGINNER" },
    { "axis": "skillTechnique", "xp": 20, "newLevel": "BEGINNER" },
    { "axis": "bodyTension", "xp": 30, "newLevel": "BEGINNER" }
  ],
  "profile": { ... }
}
```

---

## 6. Complete E2E Flow Test

### Scenario: New User Journey

1. **Create new user** → Register
2. **Complete assessment** → Scores: PUSH=7, PULL=6, CORE=5, BALANCE=3, STATIC=4, MOBILITY=6, ENDURANCE=7
3. **Check results page**:
   - Expected level: BEGINNER (avg XP ~500-800)
   - Expected progress: ~25-40%
4. **Go to dashboard** → See 3 daily missions
5. **Complete "Core Focus" mission** (+20 XP)
   - bodyTensionXP should increase by ~14
   - relativeStrengthXP should increase by ~6
6. **Refresh dashboard** → Verify updated values
7. **Complete 10 more missions** over simulated days
8. **Verify level up** when axis reaches 2,000 XP

---

## 7. Debugging Tips

### Enable Verbose Logging

Add to mission complete handler:
```typescript
console.log('[Mission Complete] XP Rewards:', xpRewards);
console.log('[Mission Complete] Updated Profile:', updatedProfile);
```

### Check Database State

```sql
-- View all hexagon profiles
SELECT userId,
       relativeStrengthXP, relativeStrengthLevel,
       muscularEnduranceXP, muscularEnduranceLevel
FROM hexagon_profiles;

-- View mission completion history
SELECT * FROM DailyMission
WHERE completed = true
ORDER BY createdAt DESC
LIMIT 10;
```

### Common Issues

**Issue**: "Cannot read property 'relativeStrengthXP'"
- **Cause**: Schema not migrated
- **Fix**: Run `npx prisma db push`

**Issue**: Level not updating
- **Cause**: XP not reaching threshold
- **Fix**: Check XP thresholds (BEGINNER: 0-2000, INTERMEDIATE: 2000-5000)

**Issue**: Visual value incorrect
- **Cause**: Visual calculation from XP+Level
- **Fix**: Verify `getVisualValueFromXP()` logic

---

## 8. Acceptance Criteria

### ✅ Checklist

- [ ] Assessment creates hexagonProfile with XP/Level fields
- [ ] Results page calculates level from average XP
- [ ] Results page shows progress percentage
- [ ] Mission complete awards XP to correct axes
- [ ] Dashboard returns hexagon with XP/Level fields
- [ ] XP accumulation works correctly
- [ ] Level transitions at correct thresholds (2k, 5k, 10k)
- [ ] Visual values (0-10) update based on XP
- [ ] No errors in console
- [ ] Database persists all XP/Level values

---

## 9. Performance Test

### Load Testing

```bash
# Complete 100 missions rapidly
for i in {1..100}; do
  curl -X POST "http://localhost:3000/api/missions/complete" \
    -H "Content-Type: application/json" \
    -H "x-user-id: test-user" \
    -d "{\"missionId\": \"mission-$i\", \"userId\": \"test-user\"}"
done
```

**Expected**:
- No race conditions
- XP accumulates correctly
- Level transitions at correct points
- Response time < 500ms per request

---

## 10. Final Verification

After completing all tests:

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

**All should pass without errors.**

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Assessment initializes XP | ✅ | |
| Results page shows dynamic level | ✅ | |
| Missions award XP | ✅ | |
| Dashboard includes XP fields | ✅ | |
| Level ups occur at thresholds | ✅ | |
| Visual values sync with XP | ✅ | |
| E2E flow works | ✅ | |

---

## Next Steps

After successful testing:

1. **Commit changes**
2. **Create pull request**
3. **Deploy to staging**
4. **Monitor production metrics**
5. **Collect user feedback**

---

## Support

If you encounter issues:

1. Check Prisma schema is up to date
2. Verify database migrations applied
3. Review console logs for errors
4. Check this guide for troubleshooting tips
5. Create issue with detailed error logs

---

**System is ready for testing! 🚀**
