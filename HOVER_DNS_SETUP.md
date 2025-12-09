# Hover DNS Setup for Vercel (ophilia.fun)

## Step-by-Step Instructions for Hover

### Step 1: Get DNS Records from Vercel

1. Go to Vercel → Your Project → **Settings** → **Domains**
2. Add `ophilia.fun` if you haven't already
3. Vercel will show you the DNS configuration needed
4. Note the CNAME value (usually `cname.vercel-dns.com.`)

### Step 2: Configure DNS in Hover

1. **Log in to Hover**
   - Go to [hover.com](https://hover.com) and sign in

2. **Navigate to DNS Settings**
   - Click on **"Domains"** in the top menu
   - Find `ophilia.fun` in your domain list
   - Click on the domain name

3. **Go to DNS Section**
   - You'll see different tabs/sections
   - Click on **"DNS"** or **"DNS & Nameservers"**

4. **Remove Existing A Records (if any)**
   - Look for any **A records** with name `@` or `ophilia.fun`
   - If they exist, delete them (you'll replace with CNAME)

5. **Add CNAME Record**
   - Click **"Add New"** or **"Add Record"**
   - Select **"CNAME"** as the record type
   - **Hostname/Name:** Enter `@` (this represents the root domain)
     - *Note: Some Hover interfaces might require you to leave this blank or use `ophilia.fun`*
   - **Points to/Value:** Enter the CNAME value from Vercel
     - Usually: `cname.vercel-dns.com.`
     - **Important:** Include the trailing dot (`.`) at the end
   - **TTL:** Leave as default or set to 3600 (1 hour)
   - Click **"Save"** or **"Add Record"**

### Step 3: Verify the Record

After adding, you should see:
```
Type: CNAME
Name: @ (or blank)
Value: cname.vercel-dns.com.
```

### Step 4: Wait for Propagation

- DNS changes typically take **15-30 minutes** to propagate
- Can take up to 48 hours in rare cases
- Check propagation at [whatsmydns.net](https://www.whatsmydns.net)

### Step 5: Verify in Vercel

1. Go back to Vercel → **Settings** → **Domains**
2. Click the **refresh icon** or **"Verify"** button next to your domain
3. Wait a minute and check again
4. Status should change from "Invalid Configuration" to "Valid Configuration" ✅

## Troubleshooting for Hover

### If CNAME for root domain doesn't work:

Some DNS providers (including Hover in some cases) don't support CNAME records for the root domain (`@`). If that's the case:

1. **Use A Records instead:**
   - In Vercel, look for A record instructions
   - Vercel will provide 2-4 IP addresses
   - In Hover, add A records:
     - **Type:** A
     - **Name:** `@` (or blank)
     - **Value:** First IP from Vercel
     - Repeat for each IP Vercel provides

### Common Hover-Specific Issues:

**Issue 1: "Hostname" field format**
- Try `@` first
- If that doesn't work, try leaving it blank
- Some Hover interfaces use different terminology

**Issue 2: Trailing dot**
- Make sure the CNAME value includes the trailing dot: `cname.vercel-dns.com.`
- Without the dot, it might not resolve correctly

**Issue 3: Conflicting records**
- Make sure you don't have both A and CNAME records for `@`
- Delete any A records before adding CNAME

**Issue 4: Nameservers**
- Make sure you're using Hover's nameservers (not a third-party DNS)
- Check in Hover → Domain → Nameservers
- Should show Hover's nameservers

## Quick Checklist

- [ ] Logged into Hover
- [ ] Navigated to DNS settings for `ophilia.fun`
- [ ] Removed any existing A records for root domain
- [ ] Added CNAME record with name `@` (or blank)
- [ ] CNAME value matches Vercel exactly (with trailing dot)
- [ ] Saved the record
- [ ] Waited 15-30 minutes
- [ ] Clicked "Refresh" in Vercel
- [ ] Status shows "Valid Configuration"

## Still Having Issues?

1. **Double-check the exact value** Vercel shows you
2. **Screenshot your Hover DNS settings** (blur sensitive info)
3. **Check whatsmydns.net** to see what's actually live
4. **Try using A records** if CNAME doesn't work (Vercel will provide IPs)

## Need Help?

If you're still stuck:
- Check Hover's support documentation
- Verify you're in the right DNS section (not email or other settings)
- Make sure you're editing DNS, not nameservers

