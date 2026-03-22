import 'dotenv/config';
import fetch from 'node-fetch';

async function testJira() {
  const JIRA_BASE_URL = process.env.VITE_JIRA_BASE_URL || process.env.JIRA_BASE_URL;
  const JIRA_EMAIL = process.env.VITE_JIRA_EMAIL || process.env.JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.VITE_JIRA_API_TOKEN || process.env.JIRA_API_TOKEN;

  let baseUrl = JIRA_BASE_URL;
  if (baseUrl && !baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }

  const authHeader = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  console.log(`Connecting to: ${baseUrl}`);

  try {
    // 1. Get Boards
    const bRes = await fetch(`${baseUrl}/rest/agile/1.0/board`, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    const bData = await bRes.json();
    const board = bData.values?.[0];
    if (!board) return console.log("No boards found");
    
    console.log(`Board found: ${board.name} (${board.id})`);

    // 2. Get Active Sprints
    const sRes = await fetch(`${baseUrl}/rest/agile/1.0/board/${board.id}/sprint?state=active`, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    const sData = await sRes.json();
    const sprint = sData.values?.[0];
    if (!sprint) return console.log("No active sprints found");

    console.log(`Active Sprint: ${sprint.name} (Start: ${sprint.startDate}, End: ${sprint.endDate})`);

    // 3. Get Issues
    const iRes = await fetch(`${baseUrl}/rest/agile/1.0/sprint/${sprint.id}/issue?fields=summary,status,assignee,created,resolutiondate,duedate,subtasks,issuetype`, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    const iData = await iRes.json();
    console.log(`Loaded ${iData.issues?.length} issues.`);
    
    let subtasks = 0, tasks = 0, done = 0, onTime = 0;
    
    iData.issues?.forEach(issue => {
      const type = issue.fields.issuetype?.name;
      const status = issue.fields.status?.name;
      const isDone = issue.fields.status?.statusCategory?.key === 'done';
      const due = issue.fields.duedate;
      const res = issue.fields.resolutiondate;
      
      if (type === 'Sub-task') subtasks++;
      else tasks++;
      
      if (isDone) {
        done++;
        if (due && res && new Date(res) <= new Date(due)) {
          onTime++;
        } else if (!due) {
          // If no due date, is it considered on time?
          onTime++; 
        }
      }
    });

    console.log(`\nMetrics Summary:\nTasks (excluding subtasks): ${tasks}\nSubtasks: ${subtasks}\nDone Total: ${done}\nOn-Time (of Done): ${onTime}`);
  } catch(e) {
    console.error(e);
  }
}

testJira();
