# Hexagon Troubleshooting Guide

## Current Status

✅ **All fixes are implemented:**
- Dashboard API auto-creates hexagon if missing (based on user's fitness level)
- `/api/debug/hexagon` endpoint for comprehensive diagnostics
- `/api/fix-hexagon` endpoint for manual hexagon creation
- Next.js cache has been cleared

## Step-by-Step Troubleshooting

### Step 1: Clear Cache and Restart Dev Server

```bash
# Cache has already been cleared, now restart:
npm run dev
```

### Step 2: Check Debug Endpoint

Open in browser or curl:
```bash
curl http://localhost:3000/api/debug/hexagon \
  -H "x-user-id: YOUR_USER_ID"
```

This will show:
- Current user info
- Whether hexagon profile exists
- All hexagon profiles in database
- All users in database
- Diagnosis of the issue

### Step 3: If Hexagon is NULL - Force Create

Call the fix endpoint:
```bash
curl -X POST http://localhost:3000/api/fix-hexagon \
  -H "x-user-id: YOUR_USER_ID"
```

This will:
- Create hexagon based on your current fitness level
- Return the created hexagon profile

### Step 4: Verify in Dashboard

1. Open dashboard: `http://localhost:3000/dashboard`
2. Open browser console (F12)
3. Look for these logs:
   - `🔧 Dashboard: Creating missing hexagon for userId:`
   - `✅ Dashboard: Hexagon created successfully`
   - `📤 Dashboard: Sending hexagon:` (should show `true` and hexagon data)

## Common Issues & Solutions

### Issue 1: "Hexagon exists but shows NULL in dashboard"

**Cause:** Next.js cache serving old code

**Solution:**
```bash
rm -rf apps/web/.next apps/web/.turbo
npm run dev
```

### Issue 2: "Assessment completed but hexagon not created"

**Cause:** Database transaction failed during assessment submission

**Solution:**
1. Check `/api/debug/hexagon` to see if assessment record exists
2. If assessment exists but hexagon doesn't, use `/api/fix-hexagon` to create it
3. Or re-take the assessment at `/onboarding/assessment`

### Issue 3: "Different hexagon values in /results vs /dashboard"

**Cause:** Two different API endpoints returning different data

**Solution:**
- `/onboarding/results` calls `/api/user/profile`
- `/dashboard` calls `/api/dashboard`
- Both should now return same data - verify with browser console logs

### Issue 4: "Hexagon shows all zeros"

**Cause:** Old code created hexagon with zero XP values

**Solution:**
1. Delete the hexagon from database:
```sql
DELETE FROM hexagon_profiles WHERE userId = 'YOUR_USER_ID';
```
2. Refresh dashboard - it will auto-create with correct values based on fitness level

## Database Direct Check

If you want to check the database directly:

```bash
# Open SQLite
sqlite3 prisma/dev.db

# Check user
SELECT id, email, fitnessLevel, hasCompletedAssessment FROM User WHERE id = 'YOUR_USER_ID';

# Check hexagon
SELECT userId, relativeStrength, relativeStrengthXP, relativeStrengthLevel
FROM hexagon_profiles WHERE userId = 'YOUR_USER_ID';

# Check all hexagons
SELECT userId, relativeStrength, relativeStrengthXP, createdAt
FROM hexagon_profiles;
```

## Verification Checklist

After fixes, verify:

- [ ] Dashboard shows hexagon with non-zero values
- [ ] XP progression cards display at bottom of dashboard
- [ ] Profile tab shows correct fitness level calculated from hexagon
- [ ] Completing missions adds XP to hexagon
- [ ] Unlocking achievements distributes XP across all axes

## Auto-Creation Logic

The dashboard now auto-creates hexagon with these XP values:

| Fitness Level | Base XP per Axis | Visual Range | Level |
|--------------|------------------|--------------|-------|
| BEGINNER     | 24,000          | 1.25 (0-2.5) | BEGINNER |
| INTERMEDIATE | 96,000          | 3.75 (2.5-5.0) | INTERMEDIATE |
| ADVANCED     | 264,000         | 6.25 (5.0-7.5) | ADVANCED |
| EXPERT       | 500,000         | 8.5+ (7.5-10.0) | ELITE |

## If All Else Fails

1. **Nuclear option - Reset user's hexagon:**
   ```bash
   # Delete hexagon
   DELETE FROM hexagon_profiles WHERE userId = 'YOUR_USER_ID';

   # Update user to trigger re-assessment
   UPDATE User SET hasCompletedAssessment = 0, fitnessLevel = 'BEGINNER' WHERE id = 'YOUR_USER_ID';
   ```

2. **Re-take assessment:**
   - Go to `/onboarding/assessment`
   - Complete assessment
   - Check `/onboarding/results` - hexagon should display
   - Check `/dashboard` - hexagon should also display

## Contact

If issue persists after following all steps, provide:
1. Output from `/api/debug/hexagon`
2. Browser console logs from dashboard
3. Terminal logs from `npm run dev`
