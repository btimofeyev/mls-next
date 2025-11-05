# Security Notes

## ⚠️ CRITICAL: Environment Variables Were Exposed

The `.env.local` file containing Supabase credentials was previously committed to git history in commit `faac9ea`.

### Immediate Actions Required:

1. **Rotate Supabase Keys** (Do this ASAP!)
   - Go to your Supabase project: https://app.supabase.com
   - Navigate to Settings → API
   - Generate new anon/public key
   - Update your `.env.local` file with the new keys
   - Never commit `.env.local` to git again

2. **Verify No Unauthorized Access**
   - Check Supabase logs for any suspicious activity
   - Review any data modifications

3. **Environment Variables for Deployment**
   - Use your deployment platform's environment variable settings
   - For Vercel: Project Settings → Environment Variables
   - For other platforms: Consult their documentation

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials from Supabase.

## Security Best Practices

1. **Never commit sensitive files**:
   - `.env.local`, `.env.production`, etc.
   - API keys, secrets, passwords
   - Private keys or certificates

2. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

3. **Review security advisories**:
   - Check GitHub security alerts
   - Monitor Supabase security announcements

4. **Implement proper authentication**:
   - Server-side middleware validates all admin routes
   - Bearer token authentication for API routes
   - Role-based access control enforced

## Reporting Security Issues

If you discover a security vulnerability, please email [your-security-email] instead of opening a public issue.
