# Troubleshooting "Invalid Configuration" in Vercel

## Step-by-Step Fix

### Step 1: Check What Vercel Expects

1. In Vercel → **Settings** → **Domains**
2. Click on `ophilia.fun` (or hover over it)
3. Look for the **"Configuration"** section
4. Note the exact DNS record Vercel wants you to add

You should see something like:
- **Type:** CNAME
- **Name:** `@` or `ophilia.fun`
- **Value:** `cname.vercel-dns.com.` (or similar)

### Step 2: Verify Your DNS Records

Check what you actually have configured at your domain registrar:

**Option A: Use a DNS checker**
- Go to [whatsmydns.net](https://www.whatsmydns.net)
- Enter `ophilia.fun`
- Select "CNAME" record type
- See what's actually configured

**Option B: Check at your registrar**
- Log into your domain registrar
- Go to DNS management
- Check what CNAME records exist for `@` or root domain

### Step 3: Common Issues and Fixes

#### Issue 1: Wrong Record Type
**Problem:** You might have an A record instead of CNAME
**Fix:** 
- Delete any A records pointing to IP addresses
- Add a CNAME record instead

#### Issue 2: Wrong Name/Host
**Problem:** The name field might be wrong
**Fix:**
- For root domain (`ophilia.fun`), use `@` as the name
- Some registrars require just leaving it blank or using the domain name
- Check your registrar's documentation

#### Issue 3: Wrong Value/Target
**Problem:** The CNAME value doesn't match Vercel's
**Fix:**
- Copy the EXACT value from Vercel (including the trailing dot `.`)
- Make sure there are no extra spaces
- It should look like: `cname.vercel-dns.com.` (with the dot at the end)

#### Issue 4: Multiple Conflicting Records
**Problem:** You might have both A and CNAME records
**Fix:**
- Remove ALL A records for the root domain
- Keep only the CNAME record

#### Issue 5: DNS Not Propagated Yet
**Problem:** You just added the record
**Fix:**
- Wait 15-30 minutes
- Check propagation at [whatsmydns.net](https://www.whatsmydns.net)
- Vercel checks DNS periodically, so it might take a few minutes

### Step 4: Specific Registrar Fixes

#### If using Cloudflare:
- Make sure the proxy is **OFF** (gray cloud, not orange)
- Vercel needs direct DNS, not proxied
- Type should be CNAME, not A or AAAA

#### If using Namecheap:
- Use `@` as the host
- Make sure you're in "Advanced DNS" not "Basic DNS"
- Value should include the trailing dot: `cname.vercel-dns.com.`

#### If using GoDaddy:
- Use `@` as the name
- Make sure TTL is set (not blank)
- Value should match Vercel exactly

### Step 5: Force Vercel to Re-check

1. In Vercel → **Settings** → **Domains**
2. Click the three dots (⋯) next to your domain
3. Click **"Refresh"** or **"Verify"**
4. Wait a minute and check again

### Step 6: Alternative - Use A Records

If CNAME doesn't work for your registrar:

1. In Vercel, look for A record instructions
2. Vercel will provide IP addresses (usually 2-4 IPs)
3. Add A records pointing to those IPs
4. Note: Some registrars don't support CNAME for root domains, so A records are the alternative

## Quick Checklist

- [ ] DNS record type is CNAME (or A if CNAME not supported)
- [ ] Name/Host is `@` (or blank, depending on registrar)
- [ ] Value matches Vercel EXACTLY (including trailing dot)
- [ ] No conflicting A records for root domain
- [ ] Waited at least 15 minutes after adding record
- [ ] Checked DNS propagation at whatsmydns.net
- [ ] Clicked "Refresh" in Vercel

## Still Not Working?

1. **Screenshot your DNS settings** (blur sensitive parts)
2. **Check what Vercel shows** in the Configuration section
3. **Verify at whatsmydns.net** what's actually live
4. **Try removing and re-adding** the domain in Vercel

## Common DNS Record Examples

**Correct CNAME:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com.
TTL: 3600
```

**If using A records (alternative):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel will provide actual IPs)
TTL: 3600
```

