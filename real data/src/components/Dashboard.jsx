import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import jiraService from '../services/jiraService';
import '../styles/Dashboard.css';

const Dashboard = ({ employee, currentView }) => {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee && employee.sprintId) {
      fetchEmployeeMetrics(employee.id, employee.sprintId);
    }
  }, [employee]);

  const fetchEmployeeMetrics = async (employeeId, sprintId) => {
    setLoading(true);
    try {
      // Get sprint details
      const sprintIssues = await jiraService.getSprintIssues(sprintId);
      
      // Filter issues for this employee
      const employeeIssues = sprintIssues.filter(
        issue => issue.fields.assignee?.accountId === employeeId
      );

      // Get sprint dates (you may need to fetch sprint details separately)
      // For now, we'll use a 2-week period from today
      const today = new Date();
      const sprintStart = new Date(today);
      sprintStart.setDate(today.getDate() - 14);
      
      // Calculate metrics
      const metrics = jiraService.calculateMetrics(
        employeeIssues,
        sprintStart.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      setMetricsData({
        employee: employee,
        sprint: {
          name: 'Current Sprint',
          startDate: sprintStart.toLocaleDateString(),
          endDate: today.toLocaleDateString()
        },
        periods: metrics
      });
    } catch (error) {
      console.error('Error fetching employee metrics:', error);
      setMetricsData(null);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (completed, total) => {
    if (total === 0) return 0;
    return ((completed / total) * 100).toFixed(1);
  };

  if (!employee) {
    return (
      <div className="dashboard-empty">
        <div className="empty-state">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="#E0E0E0" strokeWidth="2" fill="none"/>
            <path d="M35 50 L45 60 L65 40" stroke="#E0E0E0" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
          <h2>Select an Employee</h2>
          <p>Choose an employee from the sidebar to view their MIS dashboard</p>
        </div>
      </div>
    );
  }

  if (loading || !metricsData) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading metrics from JIRA...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="employee-info">
          <div className="employee-avatar">
            {employee.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="employee-details">
            <h1 className="employee-name">{employee.name}</h1>
            <p className="employee-meta">{employee.board} • {metricsData.sprint.name}</p>
          </div>
        </div>
        
        <div className="sprint-info">
          <div className="sprint-badge">
            <Clock size={16} />
            <span>{metricsData.sprint.startDate} to {metricsData.sprint.endDate}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metricsData.periods.map((period, index) => (
          <div key={period.id} className={`metric-card period-${index + 1}`}>
            <div className="metric-card-header">
              <h3 className="metric-period-title">{period.name}</h3>
              <p className="metric-period-date">{period.dateRange}</p>
            </div>

            <div className="metric-stats">
              {/* Tasks Section */}
              <div className="stat-section">
                <div className="stat-header">
                  <CheckCircle size={18} className="stat-icon tasks" />
                  <h4>Tasks</h4>
                </div>
                
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{period.tasks}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value highlight">{period.completedTasks}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">On Time</span>
                    <span className="stat-value success">{period.completedOnTimeTasks}</span>
                  </div>
                  
                  <div className="stat-item percentage">
                    <span className="stat-label">Completion %</span>
                    <span className="stat-value-large">
                      {calculatePercentage(period.completedTasks, period.tasks)}%
                    </span>
                  </div>
                  
                  <div className="stat-item percentage">
                    <span className="stat-label">On-Time %</span>
                    <span className="stat-value-large">
                      {calculatePercentage(period.completedOnTimeTasks, period.tasks)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="stat-section">
                <div className="stat-header">
                  <AlertCircle size={18} className="stat-icon subtasks" />
                  <h4>Subtasks</h4>
                </div>
                
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{period.subtasks}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value highlight">{period.completedSubtasks}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">On Time</span>
                    <span className="stat-value success">{period.completedOnTimeSubtasks}</span>
                  </div>
                  
                  <div className="stat-item percentage">
                    <span className="stat-label">Completion %</span>
                    <span className="stat-value-large">
                      {calculatePercentage(period.completedSubtasks, period.subtasks)}%
                    </span>
                  </div>
                  
                  <div className="stat-item percentage">
                    <span className="stat-label">On-Time %</span>
                    <span className="stat-value-large">
                      {calculatePercentage(period.completedOnTimeSubtasks, period.subtasks)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="performance-indicator">
                <TrendingUp size={16} />
                <span>
                  Overall Performance: {
                    calculatePercentage(
                      period.completedTasks + period.completedSubtasks,
                      period.tasks + period.subtasks
                    )
                  }%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
