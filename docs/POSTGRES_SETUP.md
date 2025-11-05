# PostgreSQL Setup Guide

SpendSense supports both **in-memory** (default) and **PostgreSQL** storage.

## Quick Start

### Local Development (In-Memory)
```bash
# No setup needed! Just run:
npm run dev
```

### Production (Vercel Postgres)

1. **Create Vercel Postgres Database**
   ```bash
   # In your Vercel project dashboard:
   # Storage → Create → Postgres → Create
   ```

2. **Pull Environment Variables**
   ```bash
   vercel env pull .env.local
   ```

3. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

4. **Seed Database**
   ```bash
   npm run db:seed
   ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required for Postgres:
```env
STORAGE_MODE=postgres
POSTGRES_URL=postgres://...
```

### Automatically set by Vercel:
- `POSTGRES_URL` - Connection string for queries
- `POSTGRES_PRISMA_URL` - Connection pooler URL
- `POSTGRES_URL_NON_POOLING` - Direct connection

## Database Schema

### Core Tables:
- `users` - User profiles and consent status
- `accounts` - Bank accounts (checking, savings, credit cards)
- `transactions` - Financial transactions (~11K rows)
- `liabilities` - Credit cards, loans, mortgages

### Behavioral Data:
- `signals` - Detected behavioral patterns (subscriptions, savings, credit, income)
- `personas` - Assigned financial personas
- `recommendations` - Generated recommendations with AI content

### System:
- `consents` - User consent tracking
- `operator_actions` - Audit log

## Local Development with Docker

If you want to run Postgres locally:

```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: spendsense
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start Postgres
docker-compose up -d

# Set environment
export STORAGE_MODE=postgres
export POSTGRES_URL=postgres://user:password@localhost:5432/spendsense

# Setup database
npm run db:setup

# Run app
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Create database schema |
| `npm run db:seed` | Load synthetic data from JSON |
| `npm run db:setup` | Run both migration and seed |

## Storage Modes

### In-Memory (Default)
```env
STORAGE_MODE=memory
```
- ✅ Fast - everything in RAM
- ✅ No setup required
- ✅ Great for development
- ❌ Data lost on restart

### PostgreSQL
```env
STORAGE_MODE=postgres
POSTGRES_URL=postgres://...
```
- ✅ Persistent storage
- ✅ Production-ready
- ✅ SQL queries for analytics
- ✅ Scalable

## Performance

**Seed Time:** ~30-60 seconds for 75 users + 11K transactions

**Query Performance:**
- User lookup: <10ms (indexed)
- Transaction history: <50ms (indexed by user_id, date)
- Signal detection: Processed in-memory after fetch

## Troubleshooting

### "relation does not exist"
```bash
npm run db:migrate
```

### "no data in database"
```bash
npm run db:seed
```

### Connection issues
Check your `POSTGRES_URL` format:
```
postgres://USER:PASSWORD@HOST:PORT/DATABASE
```

### Vercel deployment
Ensure environment variables are set:
```bash
vercel env ls
```

## Data Flow

```
JSON (source of truth)
    ↓
[npm run db:seed]
    ↓
PostgreSQL
    ↓
[API endpoints]
    ↓
User Dashboard
```

## Monitoring

View your Postgres database in Vercel:
- Dashboard → Storage → [Your DB] → Query
- Run SQL queries directly
- View metrics and logs

