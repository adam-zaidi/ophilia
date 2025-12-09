# Deployment Guide for Ophilia

## Prerequisites

1. Supabase account and project
2. GitHub account
3. Vercel account

## Step 1: Set up Supabase

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create all tables and policies
4. Go to Authentication > URL Configuration
   - Add your Vercel deployment URL to "Redirect URLs"
   - Add `http://localhost:5173/auth/callback` for local development

## Step 2: Get Supabase Credentials

1. In Supabase dashboard, go to Settings > API
2. Copy your:
   - Project URL (for `VITE_SUPABASE_URL`)
   - Anon/Public key (for `VITE_SUPABASE_ANON_KEY`)

## Step 3: Set up Local Environment

1. Create a `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Test locally:
```bash
npm run dev
```

## Step 4: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

## Step 5: Push to GitHub

1. Create a new repository on GitHub
2. Connect and push:
```bash
git remote add origin https://github.com/yourusername/ophilia.git
git branch -M main
git push -u origin main
```

## Step 6: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"

## Step 7: Configure Custom Domain (ophilia.fun)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain:
   - `ophilia.fun`
   - `www.ophilia.fun` (optional)
3. Follow Vercel's DNS configuration instructions:
   - Add the CNAME or A record as specified by Vercel
   - Wait for DNS propagation (usually 5-60 minutes)
4. Vercel will automatically provision SSL certificates

## Step 8: Update Supabase Redirect URL

1. Go to Supabase > Authentication > URL Configuration
2. Add redirect URLs:
   - `https://ophilia.fun/auth/callback`
   - `https://www.ophilia.fun/auth/callback` (if using www)
   - `https://your-app.vercel.app/auth/callback` (backup Vercel URL)
3. Update email templates if needed to use your custom domain

## Step 8: Test the Deployment

1. Visit your Vercel URL
2. Try signing up with a @uchicago.edu email
3. Check your email for verification link
4. Verify and log in
5. Test posting and messaging

## Troubleshooting

- **Authentication not working**: Check that redirect URLs are correctly set in Supabase
- **Database errors**: Ensure all SQL schema has been run in Supabase SQL Editor
- **Environment variables**: Make sure they're set in Vercel project settings

