# Customization Guide

This guide explains how to customize the JIRA MetalCloud EM-MIS to match your organization's needs.

## 🎨 Branding & Appearance

### Changing the App Name

**File**: `src/config/appConfig.js`
```javascript
app: {
  name: 'Your Company EM-MIS',
  subtitle: 'Your Custom Subtitle',
  version: '1.0.0'
}
```

Also update in:
- `src/App.jsx` - Sidebar header
- `src/components/SecurityOverlay.jsx` - Login screen
- `index.html` - Page title

### Changing Colors

**File**: `src/config/appConfig.js`
```javascript
colors: {
  primary: '#0052CC',    // Main brand color
  secondary: '#2684FF',  // Secondary brand color
  accent: '#00C7E6',     // Accent color
  success: '#00C853',    // Success state
  warning: '#FF9800',    // Warning state
  error: '#C00'          // Error state
}
```

For more detailed color changes, edit CSS files:
- `src/styles/App.css` - Main app colors
- `src/styles/SecurityOverlay.css` - Login screen colors
- `src/styles/Dashboard.css` - Dashboard colors

### Changing Logo

1. **Replace floating logo** in `SecurityOverlay.jsx`:
   - Replace the SVG in the `floating-spice` div
   - Or add an image: `<img src="/logo.png" alt="Logo" />`

2. **Add company logo** to sidebar:
   - Edit `src/App.jsx` in the `sidebar-header` section
   - Add your logo above or replace the title

## 🔐 Security Settings

### Change Access Password

**File**: `src/components/SecurityOverlay.jsx`

Find this line:
```javascript
const CORRECT_PASSWORD = 'metalcloud';
```

Change to:
```javascript
const CORRECT_PASSWORD = 'your-secure-password';
```

**For production**, consider:
- Using environment variables
- Implementing OAuth/SSO
- Adding role-based access control

### Session Timeout

**File**: `src/config/appConfig.js`
```javascript
security: {
  sessionTimeout: 3600000, // 1 hour in milliseconds
}
```

## 📊 Sprint Configuration

### Change Sprint Duration

**File**: `src/config/appConfig.js`
```javascript
sprint: {
  duration: 14, // Change to your sprint length in days
}
```

### Customize Time Periods

**File**: `src/config/appConfig.js`
```javascript
periods: [
  {
    id: 'week1',
    name: 'Week 1',
    description: 'Monday to Sunday'
  },
  // Add or modify periods as needed
]
```

To change the calculation logic:
**File**: `src/services/jiraService.js` → `calculateMetrics()` function

## 📈 Metrics Customization

### Enable/Disable Metrics

**File**: `src/config/appConfig.js`
```javascript
metrics: {
  enabled: {
    tasks: true,
    subtasks: true,
    completionRate: true,
    onTimeRate: true,
    performance: true
  }
}
```

### Change Performance Thresholds

**File**: `src/config/appConfig.js`
```javascript
thresholds: {
  excellent: 90,  // >= 90% shows as excellent
  good: 75,       // >= 75% shows as good
  fair: 60        // >= 60% shows as fair
}
```

### Add Custom Metrics

1. **Update data structure** in `src/services/jiraService.js`:
```javascript
return {
  // ... existing metrics
  customMetric: calculateCustomMetric(periodIssues)
};
```

2. **Display in Dashboard** (`src/components/Dashboard.jsx`):
```javascript
<div className="stat-item">
  <span className="stat-label">Custom Metric</span>
  <span className="stat-value">{period.customMetric}</span>
</div>
```

## 🎯 JIRA Integration

### Include/Exclude Issue Types

**File**: `src/config/appConfig.js`
```javascript
issueTypes: {
  task: true,
  story: true,
  bug: true,
  epic: false,      // Exclude epics
  subtask: true     // Add custom types
}
```

### Fetch Additional Fields

**File**: `src/config/appConfig.js`
```javascript
fields: [
  'summary',
  'status',
  'assignee',
  'priority',      // Add priority
  'labels',        // Add labels
  'customfield_10001' // Add custom fields
]
```

## 🌐 Adding New Features

### Add Export to Excel

1. **Install library**:
```bash
npm install xlsx
```

2. **Create export function**:
```javascript
import * as XLSX from 'xlsx';

export const exportToExcel = (data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Metrics');
  XLSX.writeFile(wb, 'sprint-metrics.xlsx');
};
```

3. **Add button** in Dashboard:
```javascript
<button onClick={() => exportToExcel(metricsData)}>
  Export to Excel
</button>
```

### Add Dark Mode

1. **Update config** (`src/config/appConfig.js`):
```javascript
features: {
  darkMode: true
}
```

2. **Add CSS variables** for dark mode in `App.css`:
```css
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  /* ... other dark mode colors */
}
```

3. **Add toggle** in UI to switch themes

## 🔄 Data Refresh

### Auto-Refresh Configuration

**File**: `src/config/appConfig.js`
```javascript
dataRefresh: {
  interval: 300000,    // 5 minutes (in milliseconds)
  showIndicator: true  // Show "Last updated" timestamp
}
```

### Manual Refresh Button

Add to `Dashboard.jsx`:
```javascript
<button onClick={() => fetchEmployeeMetrics(employee.id)}>
  <RefreshCw size={16} />
  Refresh Data
</button>
```

## 🎨 Advanced Styling

### Animation Speed

**File**: `src/config/appConfig.js`
```javascript
animations: {
  enabled: true,
  duration: 300  // milliseconds
}
```

Apply to CSS:
```css
.element {
  transition: all var(--animation-duration) ease;
}
```

### Sidebar Width

**File**: `src/config/appConfig.js`
```javascript
sidebar: {
  width: 320,      // pixels
  collapsible: true // Enable collapse feature
}
```

## 📱 Responsive Design

Breakpoints are defined in CSS files:
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

Modify in `src/styles/App.css`:
```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

## 🌍 Multi-Language Support

### Enable i18n

1. **Install library**:
```bash
npm install react-i18next i18next
```

2. **Create translation files**:
```
src/
  locales/
    en.json
    hi.json
```

3. **Configure i18next**:
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require('./locales/en.json') },
    hi: { translation: require('./locales/hi.json') }
  },
  lng: 'en',
  fallbackLng: 'en'
});
```

## 🔔 Notifications

### Add Toast Notifications

1. **Install library**:
```bash
npm install react-hot-toast
```

2. **Add to App.jsx**:
```javascript
import { Toaster } from 'react-hot-toast';

<Toaster position="top-right" />
```

3. **Use in components**:
```javascript
import toast from 'react-hot-toast';

toast.success('Data refreshed successfully!');
toast.error('Failed to load metrics');
```

## 📝 Custom Components

### Add Team Overview Card

Create `src/components/TeamOverview.jsx`:
```javascript
const TeamOverview = ({ teamData }) => {
  return (
    <div className="team-overview">
      <h2>Team Performance</h2>
      {/* Your custom content */}
    </div>
  );
};
```

Import and use in Dashboard.

## 🎯 Best Practices

1. **Keep config centralized** in `appConfig.js`
2. **Use CSS variables** for theming
3. **Component modularity** - one component, one purpose
4. **Responsive first** - test on mobile
5. **Performance** - lazy load heavy components
6. **Accessibility** - add ARIA labels

## 🔧 Testing Customizations

After making changes:
1. Test locally: `npm run dev`
2. Build: `npm run build`
3. Preview: `npm run preview`
4. Deploy to staging before production

---

Need help? Check [README.md](README.md) or open an issue on GitHub.
