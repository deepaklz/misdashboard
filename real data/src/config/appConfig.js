// Application Configuration
// Modify these settings to customize the application

export const appConfig = {
  // Application Info
  app: {
    name: 'JIRA MetalCloud EM-MIS',
    subtitle: 'Employee Management Information System',
    version: '1.0.0'
  },

  // Security Settings
  security: {
    // Change this password for production
    accessPassword: 'metalcloud',
    sessionTimeout: 3600000, // 1 hour in milliseconds
  },

  // Sprint Configuration
  sprint: {
    // Default sprint duration in days
    duration: 14,
    
    // Sprint periods configuration
    periods: [
      {
        id: 'week1',
        name: 'Week 1',
        description: 'Monday to Sunday'
      },
      {
        id: 'week2', 
        name: 'Week 2',
        description: 'Monday to Sunday'
      },
      {
        id: 'full',
        name: 'Full Sprint',
        description: '2 Weeks'
      }
    ]
  },

  // UI/UX Settings
  ui: {
    // Color scheme
    colors: {
      primary: '#0052CC',
      secondary: '#2684FF',
      accent: '#00C7E6',
      success: '#00C853',
      warning: '#FF9800',
      error: '#C00'
    },

    // Animation settings
    animations: {
      enabled: true,
      duration: 300 // milliseconds
    },

    // Sidebar settings
    sidebar: {
      width: 320,
      collapsible: false
    }
  },

  // Data Refresh Settings
  dataRefresh: {
    // Auto-refresh interval in milliseconds (0 = disabled)
    interval: 300000, // 5 minutes
    
    // Show refresh indicator
    showIndicator: true
  },

  // Metrics Configuration
  metrics: {
    // Metrics to display
    enabled: {
      tasks: true,
      subtasks: true,
      completionRate: true,
      onTimeRate: true,
      performance: true
    },

    // Performance thresholds for color coding
    thresholds: {
      excellent: 90, // >= 90% = excellent
      good: 75,      // >= 75% = good
      fair: 60       // >= 60% = fair, < 60% = needs improvement
    }
  },

  // JIRA Settings
  jira: {
    // Fields to fetch from JIRA
    fields: [
      'summary',
      'status',
      'assignee',
      'created',
      'resolutiondate',
      'duedate',
      'subtasks',
      'issuetype'
    ],

    // Issue types to include
    issueTypes: {
      task: true,
      story: true,
      bug: true,
      epic: false // Don't include epics in metrics
    }
  },

  // Feature Flags
  features: {
    exportToPDF: true,
    exportToExcel: true,
    emailReports: false,
    darkMode: false,
    multiLanguage: false
  },

  // Date/Time Format
  dateFormat: {
    display: 'MMM DD, YYYY',
    api: 'YYYY-MM-DD'
  }
};

export default appConfig;
