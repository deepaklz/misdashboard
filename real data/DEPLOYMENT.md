# Deployment Guide - JIRA MetalCloud EM-MIS

This guide walks you through deploying your JIRA MetalCloud EM-MIS to Vercel with automatic updates.

## 📋 Prerequisites

Before you begin, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (free tier is fine)
- [ ] JIRA API credentials ready
- [ ] Git installed on your computer

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Initialize Git Repository** (if not done):
```bash
cd jira-metalcloud-em-mis
git init
git add .
git commit -m "Initial commit: JIRA MetalCloud EM-MIS"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository named `jira-metalcloud-em-mis`
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/jira-metalcloud-em-mis.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Login to Vercel**:
   - Go to https://vercel.com
   - Sign up or login (use GitHub for easier integration)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `jira-metalcloud-em-mis` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Click "Deploy" (don't worry about env vars yet)

### Step 3: Add Environment Variables

After the first deployment (it might fail, that's okay):

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_JIRA_BASE_URL` | `https://your-domain.atlassian.net` | All |
| `VITE_JIRA_EMAIL` | `your-email@example.com` | All |
| `VITE_JIRA_API_TOKEN` | `your-api-token` | All |

4. Click "Save"

### Step 4: Redeploy

1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

Your app is now live! 🎉

## 🔄 Automatic Updates

Now that everything is connected, automatic updates work like this:

1. **Make changes** to your code locally
2. **Commit changes**:
```bash
git add .
git commit -m "Description of changes"
```
3. **Push to GitHub**:
```bash
git push origin main
```
4. **Vercel automatically deploys** within seconds! ⚡

You can watch the deployment progress in the Vercel dashboard.

## 🔗 Your App URLs

After deployment, you'll have:
- **Production URL**: `https://your-project.vercel.app`
- **Preview URLs**: Generated for each branch/PR

## 🔐 Security Best Practices

1. **Never commit `.env` file** (it's in `.gitignore`)
2. **Use Vercel environment variables** for secrets
3. **Rotate JIRA API tokens** periodically
4. **Change the access password** in `SecurityOverlay.jsx`

## 🛠️ Advanced Configuration

### Custom Domain

1. Go to Vercel Project → "Settings" → "Domains"
2. Add your domain
3. Update DNS records as instructed
4. Vercel handles SSL automatically

### Preview Deployments

Every branch and PR gets a unique preview URL:
- Create a new branch: `git checkout -b feature-name`
- Push: `git push origin feature-name`
- Vercel creates a preview deployment
- Share the preview URL with team members

### Production vs Preview Environments

You can set different environment variables for:
- **Production**: Only main branch
- **Preview**: All other branches
- **Development**: Local only

## 📊 Monitoring

1. **Deployment Logs**: Vercel Dashboard → Deployments → Select deployment → View Logs
2. **Runtime Logs**: Vercel Dashboard → Your Project → Logs
3. **Analytics**: Vercel Dashboard → Your Project → Analytics (on paid plans)

## 🐛 Troubleshooting

### Deployment Fails

1. Check build logs in Vercel
2. Verify all environment variables are set
3. Test build locally: `npm run build`

### CORS Errors

If you see CORS errors accessing JIRA:
1. Check JIRA API token is valid
2. Verify JIRA base URL is correct
3. Consider using a backend proxy (see Advanced Setup below)

### Environment Variables Not Working

1. Make sure variable names start with `VITE_`
2. Redeploy after adding/changing variables
3. Clear browser cache

## 🔧 Advanced Setup: Backend Proxy

For production environments, consider adding a backend proxy to handle JIRA API calls:

1. Create `/api` folder in your project
2. Add serverless functions
3. Move JIRA credentials to server-side only
4. Update `jiraService.js` to call your API endpoints

Example structure:
```
jira-metalcloud-em-mis/
├── api/
│   ├── boards.js
│   ├── sprints.js
│   └── metrics.js
├── src/
└── ...
```

This keeps your JIRA credentials secure on the server.

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Repository connected to Vercel
- [ ] Environment variables added in Vercel
- [ ] Successful deployment
- [ ] App accessible at Vercel URL
- [ ] Security password changed from default
- [ ] JIRA integration working
- [ ] All metrics displaying correctly

## 🎯 Next Steps

After successful deployment:
1. Share the URL with your team
2. Set up custom domain (optional)
3. Configure access controls
4. Monitor usage and performance
5. Iterate based on feedback

---

Need help? Check the main [README.md](README.md) or open an issue on GitHub.
