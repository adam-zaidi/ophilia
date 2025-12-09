# Quick Setup Guide

## Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to finish provisioning

2. **Run Database Schema**
   - In Supabase dashboard, go to SQL Editor
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and run it in the SQL Editor
   - This creates all tables, policies, and functions

3. **Get API Credentials**
   - Go to Settings > API
   - Copy:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon/public key** (long string starting with `eyJ...`)

## Step 2: Local Environment

1. **Create `.env` file** in the project root:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Configure Auth Redirect URLs**
   - In Supabase: Authentication > URL Configuration
   - Add to "Redirect URLs":
     - `http://localhost:5173/auth/callback`

3. **Test locally**:
```bash
npm install
npm run dev
```

## Step 3: Deploy to Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ophilia.git
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Custom Domain (ophilia.fun)**:
   - In Vercel project settings, go to "Domains"
   - Add `ophilia.fun` and `www.ophilia.fun`
   - Follow Vercel's DNS instructions to point your domain
   - Wait for DNS propagation (can take a few minutes to hours)

4. **Update Supabase Redirect URL**:
   - In Supabase: Authentication > URL Configuration
   - Add redirect URLs:
     - `https://ophilia.fun/auth/callback`
     - `https://www.ophilia.fun/auth/callback`
     - `https://your-app.vercel.app/auth/callback` (backup)

## Step 4: Test Everything

1. Visit your Vercel URL
2. Sign up with a @uchicago.edu email
3. Check email for verification link
4. Verify and log in
5. Create a post
6. Respond to a post (should open DM)
7. Send a direct message

## Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env` file exists with correct values
- In Vercel, check Environment Variables are set

**"Error fetching posts"**
- Check that `supabase-schema.sql` was run completely
- Verify RLS policies are enabled

**"Authentication not working"**
- Check redirect URLs in Supabase match your deployment URL
- Ensure email verification is enabled in Supabase

**"Cannot find module" errors**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

