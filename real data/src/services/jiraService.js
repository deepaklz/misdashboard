import axios from 'axios';

const JIRA_BASE_URL = process.env.VITE_JIRA_BASE_URL || 'https://your-domain.atlassian.net';
const JIRA_EMAIL = process.env.VITE_JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.VITE_JIRA_API_TOKEN;

const jiraClient = axios.create({
  baseURL: `${JIRA_BASE_URL}/rest/api/3`,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: JIRA_EMAIL,
    password: JIRA_API_TOKEN
  }
});

export const jiraService = {
  // Get all boards
  async getBoards() {
    try {
      const response = await jiraClient.get('/board');
      return response.data.values;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  // Get sprints for a board
  async getSprints(boardId) {
    try {
      const response = await jiraClient.get(`/board/${boardId}/sprint`);
      return response.data.values;
    } catch (error) {
      console.error('Error fetching sprints:', error);
      throw error;
    }
  },

  // Get active sprint
  async getActiveSprint(boardId) {
    try {
      const response = await jiraClient.get(`/board/${boardId}/sprint?state=active`);
      return response.data.values[0];
    } catch (error) {
      console.error('Error fetching active sprint:', error);
      throw error;
    }
  },

  // Get issues for a sprint
  async getSprintIssues(sprintId) {
    try {
      const response = await jiraClient.get(`/sprint/${sprintId}/issue`, {
        params: {
          fields: 'summary,status,assignee,created,resolutiondate,duedate,subtasks'
        }
      });
      return response.data.issues;
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
      throw error;
    }
  },

  // Get employee metrics for a sprint
  async getEmployeeMetrics(sprintId, employeeAccountId, sprintStartDate, sprintEndDate) {
    try {
      const issues = await this.getSprintIssues(sprintId);
      
      // Filter issues assigned to the employee
      const employeeIssues = issues.filter(
        issue => issue.fields.assignee?.accountId === employeeAccountId
      );

      // Calculate metrics for different periods
      const metrics = this.calculateMetrics(employeeIssues, sprintStartDate, sprintEndDate);
      
      return metrics;
    } catch (error) {
      console.error('Error getting employee metrics:', error);
      throw error;
    }
  },

  // Calculate metrics for different time periods
  calculateMetrics(issues, sprintStartDate, sprintEndDate) {
    const startDate = new Date(sprintStartDate);
    const endDate = new Date(sprintEndDate);
    
    // Week 1: Monday to Sunday
    const week1Start = new Date(startDate);
    const week1End = new Date(startDate);
    week1End.setDate(week1End.getDate() + 6);

    // Week 2: Next Monday to Sunday
    const week2Start = new Date(week1End);
    week2Start.setDate(week2Start.getDate() + 1);
    const week2End = new Date(endDate);

    const periods = [
      { name: 'Week 1', start: week1Start, end: week1End },
      { name: 'Week 2', start: week2Start, end: week2End },
      { name: 'Full Sprint', start: startDate, end: endDate }
    ];

    return periods.map(period => {
      const periodIssues = this.filterIssuesByPeriod(issues, period.start, period.end);
      
      const tasks = periodIssues.filter(issue => issue.fields.issuetype.name !== 'Sub-task');
      const subtasks = periodIssues.filter(issue => issue.fields.issuetype.name === 'Sub-task');

      return {
        name: period.name,
        dateRange: `${this.formatDate(period.start)} - ${this.formatDate(period.end)}`,
        tasks: tasks.length,
        subtasks: subtasks.length,
        completedTasks: tasks.filter(t => t.fields.status.statusCategory.key === 'done').length,
        completedSubtasks: subtasks.filter(t => t.fields.status.statusCategory.key === 'done').length,
        completedOnTimeTasks: tasks.filter(t => this.isCompletedOnTime(t)).length,
        completedOnTimeSubtasks: subtasks.filter(t => this.isCompletedOnTime(t)).length
      };
    });
  },

  // Filter issues by date period
  filterIssuesByPeriod(issues, startDate, endDate) {
    return issues.filter(issue => {
      const createdDate = new Date(issue.fields.created);
      return createdDate >= startDate && createdDate <= endDate;
    });
  },

  // Check if issue was completed on time
  isCompletedOnTime(issue) {
    if (issue.fields.status.statusCategory.key !== 'done') return false;
    if (!issue.fields.duedate || !issue.fields.resolutiondate) return false;
    
    const dueDate = new Date(issue.fields.duedate);
    const completedDate = new Date(issue.fields.resolutiondate);
    
    return completedDate <= dueDate;
  },

  // Format date helper
  formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default jiraService;
