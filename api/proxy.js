export default async function handler(req, res) {
  // Read variables without the VITE_ prefix to keep them out of the frontend bundle.
  // We fall back to VITE_ prefix to ensure compatibility if they are still configured that way.
  let JIRA_BASE_URL = process.env.JIRA_BASE_URL || process.env.VITE_JIRA_BASE_URL;
  if (JIRA_BASE_URL && !JIRA_BASE_URL.startsWith('http')) {
    JIRA_BASE_URL = `https://${JIRA_BASE_URL}`;
  }
  const JIRA_EMAIL = process.env.JIRA_EMAIL || process.env.VITE_JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || process.env.VITE_JIRA_API_TOKEN;

  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    return res.status(500).json({ error: 'JIRA credentials are not configured on the server.' });
  }

  const { endpoint, ...queryParams } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint query parameter is required' });
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    params.append(key, value);
  }

  // Support both Agile and Core APIs
  // If endpoint starts with /search or /issue, it's likely Core V3
  // Otherwise, default to Agile 1.0 for boards/sprints
  let apiPath = '/rest/agile/1.0';
  if (endpoint.startsWith('/search') || endpoint.startsWith('/issue/') || endpoint.startsWith('/user/')) {
    apiPath = '/rest/api/3';
  }

  const urlString = `${JIRA_BASE_URL}${apiPath}${endpoint}${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const authHeader = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    
    const response = await fetch(urlString, {
      method: req.method || 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.text();
    let parsed = {};
    try {
      if (data) parsed = JSON.parse(data);
    } catch(e) { /* ignore */ }
    
    if (!response.ok) {
        return res.status(response.status).json(parsed || { error: `Failed to fetch from JIRA (${response.status})` });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
