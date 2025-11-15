# 🔧 Assessment V3 - Troubleshooting Guide

## Error: "Failed to process D-S assessment"

### Possible Causes

1. **Prisma Client not regenerated**
   ```bash
   cd CALISTENIA
   npx prisma generate
   ```

2. **Database not in sync**
   ```bash
   cd CALISTENIA
   npx prisma db push
   ```

3. **Type mismatch in data**
   - Check that `step3.pullUps`, `step3.dips`, `step3.pushUps` are numbers
   - Check that `step4?.weightedPullUps` and `step4?.weightedDips` are strings

4. **Server cache**
   - Restart the Next.js development server
   - Clear `.next` folder: `rm -rf apps/web/.next`

### How to Debug

1. **Check browser console** (F12 → Console)
   - Look for the actual error message
   - Copy the full stack trace

2. **Check server logs**
   - Look at the terminal where `npm run dev` is running
   - Search for `[D-S_ASSESSMENT]` logs

3. **Check database**
   ```bash
   cd CALISTENIA
   npx prisma studio
   ```
   - Open the User table
   - Verify the new fields exist: pullUpsMax, dipsMax, pushUpsMax, weightedPullUps, weightedDips

### Quick Fix: Rollback V3 Integration

If you need to temporarily disable V3 integration:

1. Comment out the V3 metrics section in `apps/web/src/app/api/assessment/fig-initial/route.ts`:

```typescript
// 🆕 V3 INTEGRATION: Map assessment data to V3 strength metrics
console.log('[D-S_ASSESSMENT] Mapping assessment to V3 strength metrics...');

// TEMPORARILY DISABLED FOR DEBUGGING
/*
const pullUpsMax = step3.pullUps;
const dipsMax = step3.dips;
const pushUpsMax = step3.pushUps;

const weightedPullUpsKg = step4?.weightedPullUps
  ? convertWeightEnumToKg(step4.weightedPullUps)
  : 0;
const weightedDipsKg = step4?.weightedDips
  ? convertWeightEnumToKg(step4.weightedDips)
  : 0;

console.log('[D-S_ASSESSMENT] V3 Strength Metrics:', {
  pullUpsMax,
  dipsMax,
  pushUpsMax,
  weightedPullUps: weightedPullUpsKg,
  weightedDips: weightedDipsKg,
});
*/
```

2. Remove V3 fields from `prisma.user.update()`:

```typescript
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    hasCompletedAssessment: true,
    assessmentDate: new Date(),
    fitnessLevel: overallLevel,
    equipment: JSON.stringify(userEquipment),
    difficultyLevel: assessmentResult.assignedLevel,
    visualRank: assessmentResult.visualRank,
    // 🆕 V3 STRENGTH METRICS: TEMPORARILY DISABLED
    // pullUpsMax,
    // dipsMax,
    // pushUpsMax,
    // weightedPullUps: weightedPullUpsKg,
    // weightedDips: weightedDipsKg,
    // masteryGoals: null,
  },
});
```

3. Remove V3 metrics from response:

```typescript
// 🆕 V3 STRENGTH METRICS: TEMPORARILY DISABLED
/*
v3StrengthMetrics: {
  pullUpsMax,
  dipsMax,
  pushUpsMax,
  weightedPullUps: weightedPullUpsKg,
  weightedDips: weightedDipsKg,
  trainingStage: determineTrainingStageFromMetrics(pullUpsMax, dipsMax, weightedPullUpsKg, weightedDipsKg),
},
*/
```

### Test Helper Functions

Run this to verify the V3 helper functions work:

```bash
node scripts/test-assessment-v3.js
```

Expected output: All tests should PASS

### Verify Database Schema

```bash
npx prisma studio
```

Check that User model has these fields:
- pullUpsMax (Int?)
- dipsMax (Int?)
- pushUpsMax (Int?)
- weightedPullUps (Float?)
- weightedDips (Float?)
- masteryGoals (String?)

### Common Error Messages

**"Cannot read property 'pullUps' of undefined"**
- step3 data is not being passed correctly
- Check FigOnboardingAssessment component

**"Cannot convert undefined to object"**
- step4 might be undefined (this is OK, it's optional)
- Verify optional chaining is used: `step4?.weightedPullUps`

**"Unknown field pullUpsMax for type UserUpdateInput"**
- Prisma Client not regenerated after schema changes
- Run: `npx prisma generate`

### Contact for Help

If the error persists:

1. Share the exact error message from browser console
2. Share any logs from the server terminal
3. Confirm you've run `npx prisma generate` and `npx prisma db push`
