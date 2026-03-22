import axios from 'axios';
import moment from 'moment';

// The client now uses a secure backend proxy endpoint.
// No VITE_ environment variables for JIRA are exposed to the browser anymore!

const jiraClient = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const jiraService = {
  // Get all boards
  async getBoards() {
    try {
      const response = await jiraClient.get('', { params: { endpoint: '/board' } });
      return response.data.values;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  // Get sprints for a board
  async getSprints(boardId) {
    try {
      const response = await jiraClient.get('', { params: { endpoint: `/board/${boardId}/sprint` } });
      return response.data.values;
    } catch (error) {
      console.error('Error fetching sprints:', error);
      throw error;
    }
  },

  // Get active and future sprints for a board
  async getTargetSprints(boardId) {
    try {
      const response = await jiraClient.get('', { params: { endpoint: `/board/${boardId}/sprint`, state: 'active' } });
      return response.data.values;
    } catch (error) {
      console.error('Error fetching target sprints:', error);
      throw error;
    }
  },

  // Get issues for a sprint
  async getSprintIssues(sprintId) {
    try {
      const response = await jiraClient.get('', {
        params: {
          endpoint: `/sprint/${sprintId}/issue`,
          fields: 'summary,status,assignee,created,resolutiondate,updated,duedate,subtasks,issuetype,project'
        }
      });
      return response.data.issues;
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
      throw error;
    }
  },
  
  // Get issues for a specific sprint globally for an employee
  async getEmployeeIssuesGlobal(accountId, sprintIds) {
    if (!sprintIds || sprintIds.length === 0) return [];
    
    // JQL query to find all issues assigned to the user in ANY of the given sprint IDs
    const sprintIdList = sprintIds.join(',');
    const jql = `assignee = "${accountId}" AND sprint IN (${sprintIdList})`;
    
    try {
      const response = await jiraClient.get('', {
        params: {
          endpoint: '/search',
          jql: jql,
          fields: 'summary,status,assignee,created,resolutiondate,updated,duedate,subtasks,issuetype,project',
          maxResults: 100
        }
      });
      return response.data.issues || [];
    } catch (error) {
      console.error('Error in global employee search:', error);
      return [];
    }
  },

  // Get issues for a sprint on a specific board
  async getBoardSprintIssues(boardId, sprintId) {
    try {
      const response = await jiraClient.get('', {
        params: {
          endpoint: `/board/${boardId}/sprint/${sprintId}/issue`,
          fields: 'summary,status,assignee,created,resolutiondate,updated,duedate,subtasks,issuetype,project'
        }
      });
      return response.data.issues;
    } catch (error) {
      console.error('Error fetching board sprint issues:', error);
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
    const startDate = moment.utc(sprintStartDate).startOf('day');
    const endDate = moment.utc(sprintEndDate).endOf('day');
    
    // Week 1: 7 days strictly calculated seamlessly off target dates implicitly
    const week1Start = startDate.clone();
    const week1End = startDate.clone().add(6, 'days').endOf('day');

    // Week 2: Day 8 linearly mapping outwards to complete coverage uniformly
    const week2Start = week1End.clone().add(1, 'second');
    const week2End = endDate.clone();

    const periods = [
      { name: 'Week 1', start: week1Start.toDate(), end: week1End.toDate() },
      { name: 'Week 2', start: week2Start.toDate(), end: week2End.toDate() },
      { name: 'Full Sprint', start: startDate.toDate(), end: endDate.toDate() }
    ];

    return periods.map(period => {
      // For Full Sprint, we include all issues to ensure carry-overs and weird due-dates are counted
      const periodIssues = (period.name === 'Full Sprint') 
        ? issues 
        : this.filterIssuesByPeriod(issues, period.start, period.end, endDate);
      
      // Use Jira's built in subtask boolean instead of string checking which is case-sensitive
      const tasks = periodIssues.filter(issue => !issue.fields.issuetype?.subtask);
      const subtasks = periodIssues.filter(issue => issue.fields.issuetype?.subtask);

      const isDone = (issue) => {
        const status = issue.fields.status;
        return status?.statusCategory?.key === 'done' || 
               status?.name?.toLowerCase().includes('done') || 
               status?.name?.toLowerCase().includes('completed');
      };

      return {
        name: period.name,
        dateRange: `${this.formatDate(period.start)} - ${this.formatDate(period.end)}`,
        tasks: tasks.length,
        subtasks: subtasks.length,
        completedTasks: tasks.filter(t => isDone(t)).length,
        completedSubtasks: subtasks.filter(t => isDone(t)).length,
        completedOnTimeTasks: tasks.filter(t => this.isCompletedOnTime(t, period.end)).length,
        completedOnTimeSubtasks: subtasks.filter(t => this.isCompletedOnTime(t, period.end)).length
      };
    });
  },

  // Filter issues by date period explicitly targeting due dates and bound logic natively
  filterIssuesByPeriod(issues, periodStart, periodEnd, sprintEnd) {
    const pStart = new Date(periodStart); pStart.setHours(0,0,0,0);
    const pEnd = new Date(periodEnd); pEnd.setHours(23,59,59,999);
    
    return issues.filter(issue => {
      const dueStr = issue.fields.duedate;
      // If issue lacks a due date, assign it to the ultimate sprint end boundary dynamically natively
      const dueDate = dueStr ? new Date(dueStr) : new Date(sprintEnd);
      return dueDate >= pStart && dueDate <= pEnd;
    });
  },

  // Check if issue was completed on time
  isCompletedOnTime(issue, fallbackDueDate) {
    if (issue.fields.status?.statusCategory?.key !== 'done') return false;
    
    // Use resolutiondate if available, otherwise fallback to updated date for Done status
    const resDateStr = issue.fields.resolutiondate || issue.fields.updated;
    if (!resDateStr) return false;
    
    // Use issue's duedate, or fallback to the period/sprint's end date if no direct duedate is assigned
    const dueDateStr = issue.fields.duedate;
    const dueDate = dueDateStr ? new Date(dueDateStr) : new Date(fallbackDueDate);
    const completedDate = new Date(resDateStr);
    
    return completedDate <= dueDate;
  },

  // Format date helper uniformly formatted
  formatDate(date) {
    return moment.utc(date).format('D MMM YYYY');
  }
};

export default jiraService;
