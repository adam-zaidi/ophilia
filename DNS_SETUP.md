# DNS Setup Guide for Vercel (ophilia.fun)

## Step-by-Step DNS Configuration

### Step 1: Add Domain in Vercel

1. Go to your Vercel project dashboard
2. Click on your project (ophilia)
3. Go to **Settings** → **Domains**
4. Enter your domain: `ophilia.fun`
5. Click **Add**

### Step 2: Get DNS Records from Vercel

After adding the domain, Vercel will show you the DNS records you need to configure. You'll typically see:

**Option A: CNAME Record (Recommended)**
- **Type:** CNAME
- **Name:** `@` or `ophilia.fun` (depending on your DNS provider)
- **Value:** `cname.vercel-dns.com.` (Vercel will show you the exact value)

**Option B: A Record (Alternative)**
- **Type:** A
- **Name:** `@` or `ophilia.fun`
- **Value:** Vercel's IP addresses (Vercel will provide these)

### Step 3: Configure DNS at Your Domain Registrar

The steps depend on where you registered `ophilia.fun`. Common registrars:

#### If using Namecheap:
1. Log in to Namecheap
2. Go to **Domain List** → Click **Manage** next to `ophilia.fun`
3. Go to **Advanced DNS** tab
4. Add a new record:
   - **Type:** CNAME Record
   - **Host:** `@`
   - **Value:** `cname.vercel-dns.com.` (or what Vercel shows)
   - **TTL:** Automatic (or 3600)
   - Click **Save**

#### If using GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **DNS** next to `ophilia.fun`
3. Scroll to **Records** section
4. Add a new record:
   - **Type:** CNAME
   - **Name:** `@`
   - **Value:** `cname.vercel-dns.com.` (or what Vercel shows)
   - **TTL:** 1 hour
   - Click **Save**

#### If using Cloudflare:
1. Log in to Cloudflare
2. Select your domain `ophilia.fun`
3. Go to **DNS** → **Records**
4. Add a new record:
   - **Type:** CNAME
   - **Name:** `@` (or `ophilia.fun`)
   - **Target:** `cname.vercel-dns.com.` (or what Vercel shows)
   - **Proxy status:** DNS only (gray cloud) - **Important!**
   - Click **Save**

#### If using Google Domains:
1. Log in to Google Domains
2. Click on `ophilia.fun`
3. Go to **DNS** tab
4. Scroll to **Custom resource records**
5. Add:
   - **Name:** `@`
   - **Type:** CNAME
   - **Data:** `cname.vercel-dns.com.` (or what Vercel shows)
   - Click **Add**

#### If using other registrars:
- Look for "DNS Management" or "DNS Settings"
- Add a CNAME record pointing `@` to Vercel's CNAME value
- If CNAME isn't supported for root domain, use A records (Vercel will provide IPs)

### Step 4: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes** for most changes
- You can check propagation status at [whatsmydns.net](https://www.whatsmydns.net)

### Step 5: Verify in Vercel

1. Go back to Vercel → **Settings** → **Domains**
2. You should see a status indicator:
   - **Valid Configuration** ✅ = DNS is set up correctly
   - **Pending** ⏳ = Still waiting for DNS propagation
   - **Invalid Configuration** ❌ = Check your DNS settings

### Step 6: SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates for your domain. This usually happens within a few minutes after DNS is configured.

## Optional: Add www Subdomain

If you want `www.ophilia.fun` to also work:

1. In Vercel → **Settings** → **Domains**, add `www.ophilia.fun`
2. In your DNS provider, add:
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `cname.vercel-dns.com.` (same as root domain)

## Troubleshooting

### "Invalid Configuration" in Vercel
- Double-check the CNAME value matches exactly what Vercel shows
- Make sure there's no trailing space
- Wait a few more minutes for DNS propagation

### Domain not resolving
- Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
- Verify the CNAME record is correct in your DNS provider
- Clear your browser cache and try again

### SSL Certificate not issued
- Wait up to 24 hours (usually much faster)
- Make sure DNS is fully propagated
- Check Vercel dashboard for SSL status

## Quick Reference

**What you need:**
- Domain: `ophilia.fun`
- DNS Record Type: CNAME (preferred) or A
- DNS Name: `@` (root domain)
- DNS Value: Provided by Vercel (usually `cname.vercel-dns.com.`)

**After setup:**
- Your site will be available at `https://ophilia.fun`
- SSL is automatic
- Both `ophilia.fun` and `www.ophilia.fun` can work (if configured)

