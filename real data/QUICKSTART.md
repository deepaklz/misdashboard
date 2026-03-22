# Quick Start Guide

Get your JIRA MetalCloud EM-MIS up and running in 5 minutes!

## ⚡ Fast Track Setup

### 1. Install Dependencies (1 minute)

```bash
cd jira-metalcloud-em-mis
npm install
```

### 2. Configure JIRA (2 minutes)

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your details:
```env
VITE_JIRA_BASE_URL=https://your-company.atlassian.net
VITE_JIRA_EMAIL=your-email@company.com
VITE_JIRA_API_TOKEN=get-from-atlassian-account
```

**Get API Token**: https://id.atlassian.com/manage-profile/security/api-tokens

### 3. Run the App (30 seconds)

```bash
npm run dev
```

Visit: http://localhost:3000

**Password**: `metalcloud`

## 🎉 You're Done!

The app is now running locally. You should see:
- ✅ Security login screen with floating logo
- ✅ Sidebar with sprint navigation
- ✅ Dashboard showing metrics (once you select an employee)

## 🚀 Deploy to Vercel (5 minutes)

### Option A: Automatic (Recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/jira-metalcloud-em-mis.git
git push -u origin main

# Go to vercel.com
# Click "Import Project"
# Select your repo
# Add environment variables
# Deploy!
```

### Option B: Manual

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📋 Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with JIRA credentials
- [ ] App runs locally (`npm run dev`)
- [ ] Can login with password
- [ ] Data loads from JIRA
- [ ] (Optional) Deployed to Vercel

## 🆘 Troubleshooting

**App won't start?**
- Check Node.js version: `node -v` (need 18+)
- Delete `node_modules` and run `npm install` again

**Can't login?**
- Password is `metalcloud` (lowercase)
- Change in `src/components/SecurityOverlay.jsx`

**No data showing?**
- Verify JIRA credentials in `.env`
- Check browser console for errors (F12)
- Ensure JIRA API token is valid

**CORS errors?**
- Expected in development
- JIRA Cloud has CORS restrictions
- Works better when deployed to Vercel

## 📚 Next Steps

1. ✅ **Read**: [JIRA_SETUP.md](JIRA_SETUP.md) for detailed JIRA configuration
2. ✅ **Deploy**: [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
3. ✅ **Customize**: [CUSTOMIZATION.md](CUSTOMIZATION.md) to brand the app
4. ✅ **Full Docs**: [README.md](README.md) for complete documentation

## 💡 Pro Tips

- Change default password immediately
- Use separate JIRA tokens for dev/prod
- Enable auto-deploy via GitHub + Vercel
- Customize colors in `src/config/appConfig.js`

## 🎯 Common First Tasks

**Change the password**:
```javascript
// src/components/SecurityOverlay.jsx
const CORRECT_PASSWORD = 'your-new-password';
```

**Change app name**:
```javascript
// src/config/appConfig.js
app: {
  name: 'Your Company MIS'
}
```

**Change colors**:
```javascript
// src/config/appConfig.js
colors: {
  primary: '#YOUR_COLOR'
}
```

---

**Need Help?** Open an issue on GitHub or check the full documentation.

**Ready to customize?** See [CUSTOMIZATION.md](CUSTOMIZATION.md)

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md)
