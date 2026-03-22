# JIRA MetalCloud EM-MIS

Employee Management Information System for JIRA sprint tracking and analytics.

## 🌟 Features

- **Security Layer**: Password-protected access with animated JIRA spice logo
- **Sprint Dashboard**: View employee metrics across 3 time periods:
  - Week 1 (Monday to Sunday)
  - Week 2 (Monday to Sunday)
  - Full Sprint (2 weeks)
- **Comprehensive Metrics**:
  - Task and Subtask counts
  - Completion rates
  - On-time completion percentages
- **Beautiful UI/UX**: Clean white background with eye-catching CSS animations
- **Auto-updating**: Configured for automatic deployment on Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- JIRA account with API access
- Vercel account (for deployment)

## 🚀 Local Setup

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd jira-metalcloud-em-mis
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your JIRA credentials:
```env
VITE_JIRA_BASE_URL=https://your-domain.atlassian.net
VITE_JIRA_EMAIL=your-email@example.com
VITE_JIRA_API_TOKEN=your-api-token-here
```

### How to get JIRA API Token:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name and copy the token
4. Use this token in your `.env` file

4. **Run the development server**:
```bash
npm run dev
```

Visit `http://localhost:3000` and use the password `metalcloud` to access.

## 🔐 Security Configuration

The default access password is `metalcloud`. To change it:

1. Open `src/components/SecurityOverlay.jsx`
2. Modify the `CORRECT_PASSWORD` constant:
```javascript
const CORRECT_PASSWORD = 'your-new-password';
```

## 📦 Building for Production

```bash
npm run build
```

This creates optimized files in the `dist` folder.

## 🚀 Deploying to Vercel

### Option 1: Via GitHub (Recommended - Auto-updates)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jira-metalcloud-em-mis.git
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Add Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_JIRA_BASE_URL`
     - `VITE_JIRA_EMAIL`
     - `VITE_JIRA_API_TOKEN`

4. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Auto-updates:
Every time you push to the `main` branch, Vercel will automatically rebuild and deploy your app.

### Option 2: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📊 Project Structure

```
jira-metalcloud-em-mis/
├── src/
│   ├── components/
│   │   ├── SecurityOverlay.jsx    # Password protection screen
│   │   └── Dashboard.jsx          # Main MIS dashboard
│   ├── services/
│   │   └── jiraService.js         # JIRA API integration
│   ├── styles/
│   │   ├── App.css                # Main app styles
│   │   ├── SecurityOverlay.css    # Security screen styles
│   │   └── Dashboard.css          # Dashboard styles
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Entry point
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── vercel.json                    # Vercel deployment config
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🎨 Customization

### Changing Colors:
Edit the CSS files in `src/styles/` to modify the color scheme.

### Adding New Metrics:
Modify `src/components/Dashboard.jsx` and `src/services/jiraService.js` to add custom calculations.

### Sprint Configuration:
The system automatically calculates metrics based on 2-week sprints (Monday to Sunday periods).

## 🔄 JIRA Integration

The app fetches data from JIRA using the REST API. Key endpoints used:
- `/rest/api/3/board` - Get boards
- `/rest/api/3/sprint` - Get sprints
- `/rest/api/3/sprint/{sprintId}/issue` - Get issues

## 🛠️ Troubleshooting

**CORS Issues**: If you encounter CORS errors, you may need to:
1. Use a backend proxy server
2. Configure JIRA CORS settings (if you have admin access)

**API Token Not Working**: Ensure you're using:
- Email address (not username)
- Valid API token (not password)
- Correct JIRA base URL

## 📝 License

MIT

## 👥 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using React + Vite
