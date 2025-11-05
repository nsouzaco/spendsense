# Deployment Guide

## Deploying to Vercel with PostgreSQL

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- OpenAI API key

### Step 1: Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

### Step 2: Add PostgreSQL Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `spendsense-prod`)
6. Click **Create**

Vercel will automatically create these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Step 3: Configure Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

```env
# Required
OPENAI_API_KEY=sk-proj-...
STORAGE_MODE=postgres

# Automatically set by Postgres addon:
# POSTGRES_URL=...
# POSTGRES_PRISMA_URL=...
```

Or via CLI:
```bash
vercel env add OPENAI_API_KEY
vercel env add STORAGE_MODE
```

### Step 4: Deploy and Setup Database

```bash
# Deploy to production
vercel --prod

# The build will succeed, but database is empty
# Now setup the database:

# Pull env vars locally
vercel env pull .env.local

# Run migrations and seed
npm run db:setup

# Or manually:
npm run db:migrate
npm run db:seed
```

### Step 5: Verify Deployment

1. Visit your production URL
2. Test login flow
3. Click "Analyze My Finances" on a user dashboard
4. Verify recommendations are generated and persisted

## Storage Modes

### Development (Local)
```env
STORAGE_MODE=memory
# Fast, no database needed
```

### Production (Vercel)
```env
STORAGE_MODE=postgres
POSTGRES_URL=postgres://...
# Persistent, scalable
```

## Troubleshooting

### Build Fails
- Check Next.js version compatibility
- Ensure all dependencies installed
- Run `npm run build` locally first

### Database Connection Issues
```bash
# Verify env vars are set
vercel env ls

# Test connection
vercel env pull .env.local
npm run db:migrate
```

### Recommendations Not Persisting
- Ensure `STORAGE_MODE=postgres` is set
- Verify database was seeded: `npm run db:seed`
- Check Vercel logs: `vercel logs`

### OpenAI API Errors
- Verify API key is valid
- Check OpenAI usage limits
- Review Vercel function logs

## Performance Optimization

### Database Indexing
All tables have proper indexes for fast queries:
- `transactions` indexed by `user_id`, `account_id`, `date`
- `recommendations` indexed by `user_id`
- `signals` indexed by `user_id`

### Caching Strategy
Consider adding:
- React Query for client-side caching
- Vercel Edge Caching for API routes
- Redis for session storage (optional)

### Cost Management
- Vercel Postgres free tier: 256MB storage, 60 hours compute/month
- OpenAI API: ~$0.01-0.02 per user for recommendations
- Estimated monthly cost for 1000 users: ~$15-20

## Monitoring

### Vercel Dashboard
- Monitor function execution time
- Track error rates
- View real-time logs

### PostgreSQL Metrics
- Storage usage
- Connection pool status
- Query performance

### Recommended Tools
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for user metrics

## Rollback Strategy

If deployment fails:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push
vercel --prod
```

## Environment-Specific Configuration

### Development
```env
STORAGE_MODE=memory
NODE_ENV=development
```

### Staging
```env
STORAGE_MODE=postgres
POSTGRES_URL=postgres://staging...
NODE_ENV=production
```

### Production
```env
STORAGE_MODE=postgres
POSTGRES_URL=postgres://prod...
NODE_ENV=production
```

## Security Checklist

- ✅ API keys in environment variables (not code)
- ✅ POSTGRES_URL never committed to git
- ✅ `.env` files in `.gitignore`
- ✅ CORS configured properly
- ✅ Rate limiting on API routes (consider adding)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (parameterized queries)

## Next Steps After Deployment

1. Set up custom domain
2. Configure SSL certificate (automatic with Vercel)
3. Add monitoring and alerting
4. Set up CI/CD pipeline
5. Configure staging environment
6. Add E2E tests
7. Set up backup strategy for database

