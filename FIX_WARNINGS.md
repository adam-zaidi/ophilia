# Fix Supabase Security Warnings

## Step 1: Fix Function Search Path Warnings

Run the SQL in `supabase-fix-warnings.sql` in your Supabase SQL Editor. This will:
- Add `SET search_path = ''` to both functions to prevent search path manipulation attacks
- Fix the security warnings for `handle_new_user` and `generate_catalog_number`

## Step 2: Enable Leaked Password Protection

1. Go to Supabase Dashboard > Authentication > Policies
2. Or go to Authentication > Settings
3. Find "Leaked Password Protection" or "Password Security"
4. Enable it (this prevents users from using passwords found in data breaches)

Alternatively, you can enable it via SQL (if available in your Supabase version):
```sql
-- This might not be available in all Supabase versions
-- Check Authentication > Settings in the dashboard instead
```

## Step 3: Verify Fixes

After running the migration:
1. Go to Security Advisor in Supabase
2. The warnings should be resolved
3. If not, check the SQL Editor for any errors

