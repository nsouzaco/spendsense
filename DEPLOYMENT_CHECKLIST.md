# 🚀 Post-Deployment Checklist for PostgreSQL

Your app is deployed! Now let's set up PostgreSQL:

## ✅ Step 1: Create Vercel Postgres Database

1. Go to https://vercel.com/natalyscst-gmailcoms-projects/spendsense
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name it: `spendsense-prod`
6. Region: Choose closest to your users
7. Click **Create**

## ✅ Step 2: Configure Environment Variables

Vercel will automatically add these variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

You need to add manually:

1. Go to **Settings** → **Environment Variables**
2. Add these:

```
Name: OPENAI_API_KEY
Value: sk-proj-... (your OpenAI key)
Environment: Production, Preview, Development

Name: STORAGE_MODE  
Value: postgres
Environment: Production, Preview
```

## ✅ Step 3: Pull Environment Variables Locally

```bash
cd /Users/nat/spendsense
vercel env pull .env.local
```

This will download the Postgres connection strings.

## ✅ Step 4: Run Database Migrations

```bash
npm run db:migrate
```

This creates all tables and indexes.

## ✅ Step 5: Seed the Database

```bash
npm run db:seed
```

This loads all 75 users and 11K+ transactions.

## ✅ Step 6: Redeploy to Pick Up Env Vars

```bash
vercel --prod
```

Or just trigger a redeploy from the Vercel dashboard.

## ✅ Step 7: Test Your Production App

Visit: https://spendsense-404wwifz6-natalyscst-gmailcoms-projects.vercel.app

1. Click **"Get started"**
2. Select **"End User"**
3. Enter `user_000000`
4. Click **"Analyze My Finances"**
5. Wait ~2-3 minutes for AI recommendations
6. Recommendations should persist between page refreshes ✨

## 🔍 Verify Database

Check if data loaded:

```bash
# In Vercel dashboard:
# Storage → spendsense-prod → Query

SELECT COUNT(*) FROM users;  -- Should be 75
SELECT COUNT(*) FROM transactions;  -- Should be 11000+
SELECT COUNT(*) FROM accounts;  -- Should be 225
```

## 📊 Monitor Your App

- **Logs**: `vercel logs --prod`
- **Metrics**: Vercel Dashboard → Analytics
- **Database**: Vercel Dashboard → Storage → spendsense-prod

## 🎯 Current Status

- ✅ App Deployed
- ⏳ Database Setup (follow steps above)
- ⏳ Environment Variables  
- ⏳ Data Seeded
- ⏳ Final Testing

## 🆘 Troubleshooting

### "Storage initialized with 75 users" but no data persists

You're still using in-memory mode. Make sure:
1. `STORAGE_MODE=postgres` is set in Vercel
2. `POSTGRES_URL` exists in environment
3. You've redeployed after adding env vars

### Database connection errors

```bash
# Test connection locally:
vercel env pull .env.local
npm run db:migrate
```

### Recommendations not generating

1. Check OpenAI API key is set
2. Check quota/billing on OpenAI account
3. View logs: `vercel logs --prod`

## 📝 Next Steps

After PostgreSQL is set up:
- [ ] Set up custom domain
- [ ] Configure monitoring/alerts
- [ ] Run evaluation metrics script
- [ ] Create demo video
- [ ] Write technical writeup

## 🎉 When Everything Works

Your app will:
- ✨ Load instantly (serverless)
- 💾 Persist data between sessions (Postgres)
- 🤖 Generate AI recommendations (OpenAI)
- 📊 Track analytics (Vercel)
- 🔒 Stay secure (env vars, guardrails)

Production URL: https://spendsense-404wwifz6-natalyscst-gmailcoms-projects.vercel.app

