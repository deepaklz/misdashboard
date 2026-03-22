# JIRA API Setup Guide

This guide will help you set up JIRA API access for the MetalCloud EM-MIS application.

## 📋 What You'll Need

- JIRA Cloud account with admin or appropriate permissions
- Access to create API tokens
- Your JIRA domain (e.g., `yourcompany.atlassian.net`)

## 🔑 Getting Your JIRA API Token

### Step 1: Create API Token

1. **Login to Atlassian**:
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Login with your Atlassian account

2. **Create Token**:
   - Click "Create API token"
   - Label: `MetalCloud EM-MIS` (or any name you prefer)
   - Click "Create"
   - **IMPORTANT**: Copy the token immediately - you won't see it again!

3. **Store Safely**:
   - Save the token in a password manager
   - You'll use this in your `.env` file

### Step 2: Find Your JIRA Details

1. **JIRA Base URL**:
   - Format: `https://your-domain.atlassian.net`
   - Example: `https://metalcloud.atlassian.net`
   - Find it in your browser when logged into JIRA

2. **Email Address**:
   - Use the email address associated with your Atlassian account
   - This is your login email

## ⚙️ Configure the Application

### Local Development

1. **Create `.env` file**:
```bash
cp .env.example .env
```

2. **Edit `.env`**:
```env
VITE_JIRA_BASE_URL=https://your-domain.atlassian.net
VITE_JIRA_EMAIL=your-email@example.com
VITE_JIRA_API_TOKEN=your-api-token-here
```

3. **Example**:
```env
VITE_JIRA_BASE_URL=https://metalcloud.atlassian.net
VITE_JIRA_EMAIL=admin@metalcloud.com
VITE_JIRA_API_TOKEN=ATATxxxxxxxxxxxxxxxxxxxxx
```

### Vercel Deployment

Add the same variables in Vercel:
1. Go to Vercel Project Settings → Environment Variables
2. Add each variable with its value
3. Select "All" environments (Production, Preview, Development)

## 🔍 Testing Your Configuration

### Quick Test

1. **Start the dev server**:
```bash
npm run dev
```

2. **Login to the app**:
   - Default password: `metalcloud`

3. **Check console**:
   - Open browser DevTools (F12)
   - Look for any JIRA API errors
   - Successful connection = no errors

### Common Issues

#### Issue: "401 Unauthorized"
**Solution**:
- Verify email address is correct
- Check API token is copied correctly (no extra spaces)
- Ensure token hasn't been revoked

#### Issue: "404 Not Found"
**Solution**:
- Check JIRA base URL is correct
- Ensure it includes `https://`
- Verify domain name matches your JIRA instance

#### Issue: "CORS Error"
**Solution**:
- This is expected in browser-based apps
- For production, consider implementing a backend proxy
- JIRA Cloud has CORS restrictions

## 🔐 Security Best Practices

### DO:
✅ Use API tokens (never passwords)
✅ Store tokens in environment variables
✅ Rotate tokens every 90 days
✅ Use different tokens for dev/prod
✅ Keep `.env` in `.gitignore`

### DON'T:
❌ Commit tokens to Git
❌ Share tokens in chat/email
❌ Use tokens in client-side code (production)
❌ Reuse the same token across projects

## 📊 Required JIRA Permissions

Your JIRA account needs:
- **Browse Projects**: View project data
- **View Development Tools**: Access sprint information
- **Browse Users**: See assignee details

If you lack permissions:
1. Contact your JIRA administrator
2. Request access to relevant projects
3. Ensure you're added to the appropriate groups

## 🔄 API Token Management

### Rotating Tokens

Every 90 days (recommended):
1. Create new API token
2. Update `.env` locally
3. Update Vercel environment variables
4. Revoke old token
5. Test the application

### Revoking Tokens

If compromised:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Find the token
3. Click "Revoke"
4. Create new token immediately
5. Update all environments

## 📝 JIRA API Endpoints Used

The application uses these JIRA REST API v3 endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/rest/api/3/board` | Get all boards |
| `/rest/api/3/board/{id}/sprint` | Get sprints for a board |
| `/rest/api/3/sprint/{id}/issue` | Get issues in a sprint |

Reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

## 🧪 Testing API Access

Use this curl command to test your credentials:

```bash
curl -u your-email@example.com:YOUR_API_TOKEN \
  https://your-domain.atlassian.net/rest/api/3/myself
```

Successful response:
```json
{
  "accountId": "...",
  "emailAddress": "your-email@example.com",
  "displayName": "Your Name",
  ...
}
```

## 🔧 Troubleshooting Checklist

- [ ] API token created in Atlassian account
- [ ] Token copied without extra spaces
- [ ] Email address is correct
- [ ] JIRA base URL includes `https://`
- [ ] JIRA base URL ends with `.atlassian.net`
- [ ] No `.env` file committed to Git
- [ ] Environment variables set in Vercel (for production)
- [ ] Account has necessary permissions
- [ ] Token not revoked or expired

## 📚 Additional Resources

- [Atlassian API Tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JIRA Permissions](https://support.atlassian.com/jira-cloud-administration/docs/manage-project-permissions/)

## 💡 Pro Tips

1. **Multiple Environments**: Create separate tokens for dev/staging/prod
2. **Token Labels**: Use descriptive names like "EM-MIS Production" 
3. **Documentation**: Keep a secure note of when tokens were created
4. **Monitoring**: Check Atlassian account regularly for active tokens
5. **Team Access**: Share documentation, not tokens

---

Need help? Check [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)
