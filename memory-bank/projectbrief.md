# SpendSense - Project Brief

## Overview
SpendSense is a web-based financial education platform that analyzes Plaid-style transaction data to detect behavioral spending patterns, assign users to financial personas, and deliver personalized education recommendations with strong consent and eligibility guardrails.

## Core Problem
Many people lack personalized financial guidance that is:
- Accessible regardless of income level
- Transparent and explainable
- Educational rather than product-driven
- Respectful and non-judgmental

## Solution
A full-stack Next.js application that:
1. Ingests synthetic financial data (accounts, transactions, liabilities)
2. Detects behavioral patterns across multiple dimensions (subscriptions, savings, credit, income)
3. Assigns users to one of five financial personas
4. Generates personalized education recommendations using AI
5. Provides separate dashboards for end users and operators
6. Maintains strong guardrails around consent, eligibility, and tone

## Timeline & Scope
- **Duration**: 2-day MVP sprint (completed)
- **Team**: Solo developer using Cursor + AI tools
- **Deployment**: Production (Vercel + PostgreSQL)
- **Status**: ✅ Live and operational

## Success Criteria
- 100% coverage: All users assigned persona with ≥3 detected behaviors
- 100% explainability: All recommendations include data-backed rationales
- < 5 seconds: Recommendation generation latency per user
- 100% auditability: Complete decision traces for all recommendations
- ≥10 passing tests: Unit and integration test coverage

## Key Principles
1. **Transparency over sophistication**: Every recommendation must be explainable
2. **User control over automation**: Consent-first architecture
3. **Education over sales**: Focus on financial literacy, not product pushes
4. **Fairness built in**: No shaming language, accessible to all income levels
5. **Plain language**: Avoid jargon, make content accessible

## Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Frontend**: React with shadcn/ui components
- **Storage**: In-memory (local) / PostgreSQL (production)
- **Database**: @vercel/postgres with async architecture
- **API**: Next.js API routes (fully async)
- **AI**: OpenAI API for content generation
- **Language**: TypeScript
- **Typography**: Geist Mono + Geist Semibold
- **Styling**: Tailwind CSS with purple gradient theme

## Repository
https://github.com/nsouzaco/spendsense

