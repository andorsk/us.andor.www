# Vercel CI/CD Setup Guide

This guide will help you set up automatic deployments to Vercel from GitHub Actions.

## Step 1: Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `GitHub Actions CI`
4. Scope: Full Account
5. Copy the token (you'll only see it once!)

## Step 2: Add GitHub Secrets

Go to: https://github.com/andorsk/us.andor.www/settings/secrets/actions

Click **"New repository secret"** and add these three secrets:

### Secret 1: VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** The token you just created from Vercel

### Secret 2: VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** `team_IKG8BTGogeGArpUDMPSMsyPd`

### Secret 3: VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** `prj_v30fz05zgCPqeFj41Z5t5XdolF3S`

## Step 3: Verify Workflow

Once secrets are added:

1. Push to `main` branch
2. Go to: https://github.com/andorsk/us.andor.www/actions
3. You should see "Vercel Production Deployment" workflow running
4. It will automatically deploy to production on every push to main

## How It Works

- **Trigger:** Every push to `main` branch
- **Build:** Uses Vercel CLI to build the project
- **Deploy:** Deploys to production with environment variables
- **Environment Variables:** Already configured in Vercel (OPENAI_API_KEY, RESEND_API_KEY)

## Benefits

✅ Automatic deployments on every merge to main
✅ Build logs in GitHub Actions
✅ Vercel deployment previews for PRs (automatic from Vercel GitHub integration)
✅ Rollback capability
✅ Zero additional cost (uses Vercel free tier)

## Alternative: Vercel GitHub Integration (Recommended)

For even simpler setup, you can also use Vercel's built-in GitHub integration:

1. Go to https://vercel.com/andorsks-projects/us.andor.www/settings/git
2. Click "Connect Git Repository"
3. Select GitHub and authorize
4. This gives you:
   - Automatic deployments on push
   - Preview deployments for PRs
   - No need to manage tokens

**Note:** You can use both! GitHub Actions gives you more control, Vercel integration is simpler.
