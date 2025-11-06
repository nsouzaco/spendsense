# Populate Database with Signals & Personas

This guide explains how to populate your Vercel database with all signals and personas so the dashboards work immediately.

## One-Time Setup (After Deployment)

Once your app is deployed to Vercel, run this command **once** to populate everything:

### Using curl:

```bash
curl -X POST https://your-app.vercel.app/api/admin/seed-full
```

### Using browser console:

1. Open your deployed app in a browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste and run:

```javascript
fetch('/api/admin/seed-full', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log('✅ Database populated:', d))
  .catch(e => console.error('❌ Error:', e));
```

## What This Does

The endpoint will:
- ✅ Generate 30d and 180d signals for all users (pure calculation)
- ✅ Assign financial personas based on rules (no AI needed)
- ✅ Save everything to PostgreSQL permanently
- ✅ Skip users that are already processed
- ✅ Return detailed statistics

## Expected Output

```json
{
  "success": true,
  "message": "Successfully populated database with signals and personas",
  "stats": {
    "totalUsers": 75,
    "usersProcessed": 75,
    "signalsGenerated": 150,
    "personasAssigned": 75
  }
}
```

## After Running This

✅ **User Dashboards**: All stat cards, charts, and metrics will show immediately
✅ **Operator Dashboard**: Financial category breakdown will be fully populated
✅ **No Button Clicks**: Users don't need to click "Analyze My Finances"
✅ **Permanent Data**: Everything stays in the database until you clear it

## When to Run

- **First deployment**: Run once after deploying to Vercel
- **After database reset**: If you ever truncate tables, run again
- **Safe to re-run**: It skips already-processed users

## Alternative: Operator Dashboard

You can also use the "🔍 Analyze Users" button in the Operator Dashboard, but the API endpoint above is more comprehensive as it ensures both signals AND personas are generated for all users at once.

