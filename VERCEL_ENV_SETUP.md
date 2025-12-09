# Vercel Environment Variables Setup

## Quick Fix for "Missing Supabase environment variables" Error

Your app works locally because you have a `.env` file, but Vercel needs the environment variables configured separately.

## Steps to Add Environment Variables in Vercel:

1. **Go to your Vercel project dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click on your project (ophilia)

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the two required variables:**

   **Variable 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon/public key (starts with `eyJ...`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy your application**
   - After adding the variables, go to the **Deployments** tab
   - Click the three dots (⋯) on your latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a redeploy

## Where to Find Your Supabase Credentials:

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

## Verify It's Working:

After redeploying, your app should load without the error. The blank screen should be replaced with your Ophilia interface.

## Important Notes:

- Environment variables are case-sensitive
- Make sure there are no extra spaces when copying
- The `VITE_` prefix is required for Vite to expose the variable to the client
- Changes to environment variables require a redeploy to take effect

## About the Vercel Warning

If Vercel shows a warning about `VITE_SUPABASE_ANON_KEY` being exposed to the browser:

**✅ This is SAFE to ignore!**

The Supabase "anon key" (also called "public key") is **designed to be public** and exposed to the browser. It's not a secret key. Your data is protected by:

1. **Row Level Security (RLS)** policies in Supabase
2. **Authentication** - users must be logged in to access protected data
3. **Database permissions** - RLS policies restrict what each user can see/do

The anon key alone cannot access your data without proper authentication and RLS policies. This is the standard way Supabase is designed to work.

You can safely acknowledge/dismiss the warning in Vercel.

