import { NextResponse } from 'next/server';

export async function GET() {
  const JIRA_URL = process.env.JIRA_DOMAIN_URL;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    // Return dummy data for development without credentials
    return NextResponse.json({
      issues: [
        {
          id: '1001',
          key: 'MIS-1',
          fields: {
            summary: 'Implement Dashboard Sidebar',
            description: 'Create the sidebar to show all distinct assignees.',
            status: { name: 'In Progress' },
            assignee: { displayName: 'Deepak' },
            reporter: { displayName: 'Rohit' },
            created: '2026-05-01T10:00:00.000+0000',
            updated: '2026-05-08T10:00:00.000+0000',
            duedate: '2026-05-10',
          },
        },
        {
          id: '1002',
          key: 'MIS-2',
          fields: {
            summary: 'Fetch Data from Jira API',
            description: null, // intentionally null to test missing desc alert
            status: { name: 'To Do' },
            assignee: { displayName: 'Deepak' },
            reporter: { displayName: 'Rohit' },
            created: '2026-05-02T10:00:00.000+0000',
            updated: '2026-05-03T10:00:00.000+0000', // Stagnant (> 2 days)
            duedate: null, // missing due date
          },
        },
        {
          id: '1003',
          key: 'MIS-3',
          fields: {
            summary: 'Design Card Details View',
            description: 'Design the card UI to show dates, reporters, etc.',
            status: { name: 'Done' },
            assignee: { displayName: 'Rohit' },
            reporter: { displayName: 'Deepak' },
            created: '2026-05-04T10:00:00.000+0000',
            updated: '2026-05-08T10:00:00.000+0000',
            duedate: '2026-05-07', // Overdue
          },
        },
      ],
      isDummy: true,
      message: "Warning: Missing JIRA credentials in .env.local, returning dummy data.",
    });
  }

  try {
    const authBuffer = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    // Fetch issues assigned to anyone, or specific to project. Adjust JQL as needed.
    const jql = 'assignee is not EMPTY ORDER BY updated DESC';
    const response = await fetch(`${JIRA_URL}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100`, {
      headers: {
        'Authorization': `Basic ${authBuffer}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Jira API Error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Jira:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
