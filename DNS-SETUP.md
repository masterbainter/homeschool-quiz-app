# DNS Configuration for school.bainter.xyz

Your GitHub repository has been created and GitHub Pages is enabled!

**Repository:** https://github.com/masterbainter/homeschool-quiz-app

## DNS Configuration Required

To make your site accessible at `school.bainter.xyz`, you need to configure DNS records with your domain provider (where bainter.xyz is registered).

### Step 1: Add DNS Records

Add the following DNS records for `school.bainter.xyz`:

#### Option A: CNAME Record (Recommended if allowed)

```
Type: CNAME
Name: school
Value: masterbainter.github.io
TTL: 3600 (or Auto)
```

#### Option B: A Records (If CNAME not allowed for subdomain)

If your DNS provider doesn't support CNAME for subdomains, use these A records:

```
Type: A
Name: school
Value: 185.199.108.153
TTL: 3600

Type: A
Name: school
Value: 185.199.109.153
TTL: 3600

Type: A
Name: school
Value: 185.199.110.153
TTL: 3600

Type: A
Name: school
Value: 185.199.111.153
TTL: 3600
```

### Step 2: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Typically takes 15-30 minutes
- You can check DNS propagation at: https://www.whatsmydns.net/#CNAME/school.bainter.xyz

### Step 3: Enable HTTPS (After DNS Propagates)

Once DNS is working (you can access http://school.bainter.xyz):

1. Go to: https://github.com/masterbainter/homeschool-quiz-app/settings/pages
2. Wait for the "Enforce HTTPS" checkbox to become available (GitHub needs to provision SSL certificate)
3. Check the "Enforce HTTPS" box
4. Your site will be secure at: https://school.bainter.xyz

**Note:** GitHub automatically provisions a free SSL certificate once DNS is properly configured. This can take 10-60 minutes after DNS propagates.

## Current Status

✅ GitHub repository created
✅ Code pushed to GitHub
✅ GitHub Pages enabled
✅ CNAME file configured
⏳ Waiting for DNS configuration
⏳ Waiting for HTTPS certificate (after DNS)

## Testing Your Site

Once DNS is configured, your homeschool quiz app will be live at:

- **Temporary URL (works now):** https://masterbainter.github.io/homeschool-quiz-app/
- **Custom domain (after DNS):** https://school.bainter.xyz

## Common DNS Providers

### Cloudflare
1. Log in to Cloudflare dashboard
2. Select bainter.xyz domain
3. Go to DNS > Records
4. Click "Add record"
5. Add CNAME or A records as shown above
6. **Important:** Set proxy status to "DNS only" (gray cloud) for initial setup

### GoDaddy
1. Log in to GoDaddy
2. Go to My Products > DNS
3. Add CNAME or A records as shown above

### Namecheap
1. Log in to Namecheap
2. Domain List > Manage > Advanced DNS
3. Add CNAME or A records as shown above

### Route53 (AWS)
1. Go to Route53 console
2. Select hosted zone for bainter.xyz
3. Create record set with values above

## Verification Commands

After configuring DNS, you can verify with these commands:

```bash
# Check CNAME record
dig school.bainter.xyz CNAME

# Check A records
dig school.bainter.xyz A

# Check if site is accessible
curl -I http://school.bainter.xyz
```

## Next Steps

1. **Configure DNS** with your domain provider using the records above
2. **Wait for propagation** (15-60 minutes typically)
3. **Test the site** at http://school.bainter.xyz
4. **Enable HTTPS** once available in GitHub Pages settings
5. **Set up Firebase** following the README.md instructions

## Need Help?

- Check GitHub Pages status: https://github.com/masterbainter/homeschool-quiz-app/settings/pages
- DNS propagation checker: https://www.whatsmydns.net
- GitHub Pages docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
