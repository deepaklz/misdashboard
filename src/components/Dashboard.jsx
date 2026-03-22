import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import jiraService from '../services/jiraService';
import moment from 'moment';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = ({ employee, board, currentView, sprintBoards, sprintName, sprintIds, sprintDates }) => {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (employee && employee.sprintId) {
      fetchEmployeeMetrics(employee.id, sprintIds || [employee.sprintId]);
    } else {
      setMetricsData(null);
      setErrorMsg(null);
    }
  }, [employee]);

  const fetchEmployeeMetrics = async (employeeId, ids) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Use a Map to ensure each issue is only counted once, using issue.id for uniqueness
      const employeeIssuesMap = new Map();

      // 1. Try aggregating from pre-loaded board issues first
      sprintBoards.forEach(board => {
        if (board.issues) {
          board.issues.forEach(issue => {
            if (String(issue.fields.assignee?.accountId) === String(employeeId)) {
              if (!employeeIssuesMap.has(issue.id)) {
                employeeIssuesMap.set(issue.id, issue);
              }
            }
          });
        }
      });

      // 2. Perform a global search across all known sprint IDs for this named sprint
      // This is the most robust way to find issues that might be on OTHER boards we didn't fetch
      // or that don't match our pre-loaded board filters.
      const globalIssues = await jiraService.getEmployeeIssuesGlobal(employeeId, ids);
      globalIssues.forEach(issue => {
        if (!employeeIssuesMap.has(issue.id)) {
          employeeIssuesMap.set(issue.id, issue);
        }
      });
      
      const employeeIssues = Array.from(employeeIssuesMap.values());
      console.log(`Deduplicated employee issues for ${employee?.name || employeeId}: ${employeeIssues.length}`);

      // Use actual sprint dates if available from Jira, else fallback
      const sprintStartStr = sprintDates?.start ? new Date(sprintDates.start).toISOString().split('T')[0] : (() => {
        const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().split('T')[0];
      })();
      const sprintEndStr = sprintDates?.end ? new Date(sprintDates.end).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      const metrics = jiraService.calculateMetrics(
        employeeIssues,
        sprintStartStr,
        sprintEndStr
      );

      // Extract strictly mapped UTC definitions out of Jira avoiding timezone reductions natively
      const displayStart = sprintDates?.start ? moment.utc(sprintDates.start).format('D MMM YYYY') : sprintStartStr;
      const displayEnd = sprintDates?.end ? moment.utc(sprintDates.end).format('D MMM YYYY') : sprintEndStr;

      setMetricsData({
        employee: employee,
        sprint: {
          name: sprintName || 'Current Sprint',
          startDate: displayStart,
          endDate: displayEnd
        },
        periods: metrics
      });
    } catch (error) {
      console.error('Error fetching employee metrics:', error);
      setErrorMsg(error?.response?.data?.errorMessages?.[0] || error?.message || "Failed to load Jira data");
      setMetricsData(null);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (completed, total) => {
    if (total === 0) return 0;
    return ((completed / total) * 100).toFixed(1);
  };

  const renderGlobalOverview = (targetBoards = sprintBoards) => {
    if (!targetBoards || targetBoards.length === 0) {
      return (
        <div className="dashboard-loading">
          <p>Analyzing sprint data...</p>
        </div>
      );
    }

    let totalIssues = 0;
    let epics = 0, stories = 0, tasks = 0, subtasks = 0, bugs = 0;
    let done = 0, unassigned = 0;
    
    const projectLabels = [];
    const projectIssueCounts = [];
    const statusCounts = {};
    const typeCounts = {};

    // Deduplicate issues across all target boards by ID
    const uniqueIssuesMap = new Map();
    targetBoards.forEach(board => {
      board.issues.forEach(issue => {
        if (!uniqueIssuesMap.has(issue.id)) {
          uniqueIssuesMap.set(issue.id, issue);
        }
      });
    });

    const uniqueIssues = Array.from(uniqueIssuesMap.values());
    
    uniqueIssues.forEach(issue => {
      totalIssues++;
      const type = issue.fields.issuetype?.name || 'Unknown';
      const status = issue.fields.status?.name || 'Unknown';
      
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (type === 'Epic') epics++;
      else if (type === 'Story') stories++;
      else if (type === 'Task') tasks++;
      else if (type === 'Sub-task') subtasks++;
      else if (type === 'Bug') bugs++;
      
      if (issue.fields.status?.statusCategory?.key === 'done') done++;
      if (!issue.fields.assignee) unassigned++;
    });

    targetBoards.forEach(board => {
      projectLabels.push(board.name);
      projectIssueCounts.push(board.issues.length);
    });

    const doneRate = totalIssues > 0 ? ((done / totalIssues) * 100).toFixed(1) : 0;

    const projectChartData = {
      labels: projectLabels,
      datasets: [{ label: 'Issues', data: projectIssueCounts, backgroundColor: '#3b6cff', borderRadius: 4 }]
    };

    const statusChartData = {
      labels: Object.keys(statusCounts),
      datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#16a34a', '#3b6cff', '#d97706', '#8896ab', '#7c3aed'], borderWidth: 0 }]
    };

    const typeChartData = {
      labels: Object.keys(typeCounts),
      datasets: [{ label: 'Quantity', data: Object.values(typeCounts), backgroundColor: ['#7c3aed', '#3b6cff', '#dc2626', '#16a34a', '#d97706'], borderRadius: 4 }]
    };

    return (
      <div className="dashboard">
        <div className="page-hdr">
          <h2>📊 {targetBoards.length === 1 ? `${targetBoards[0].name} Overview` : 'Global Sprint Overview'} • {sprintName || 'Active Sprint'} {sprintDates?.start ? `(${moment.utc(sprintDates.start).format('D MMM')} - ${moment.utc(sprintDates.end).format('D MMM')})` : ''}</h2>
          <p>Live snapshot across {targetBoards.length === 1 ? 'this board' : `all ${targetBoards.length} assigned boards`}</p>
        </div>

        <div className="kpi-row">
          <div className="kpi"><div className="kpi-n text-blue">{totalIssues}</div><div className="kpi-l">Total Issues</div><div className="kpi-sub">Across all boards</div></div>
          <div className="kpi"><div className="kpi-n text-purple">{epics}</div><div className="kpi-l">Epics</div></div>
          <div className="kpi"><div className="kpi-n text-blue">{stories}</div><div className="kpi-l">Stories</div></div>
          <div className="kpi"><div className="kpi-n text-warning">{tasks + subtasks}</div><div className="kpi-l">Tasks & Subtasks</div></div>
          <div className="kpi"><div className="kpi-n text-success">{done}</div><div className="kpi-l">Done</div><div className="kpi-sub text-success">{doneRate}% complete</div></div>
          <div className="kpi"><div className="kpi-n text-danger">{bugs}</div><div className="kpi-l">Bugs</div></div>
          <div className="kpi"><div className="kpi-n text-warning">{unassigned}</div><div className="kpi-l">Unassigned</div></div>
        </div>

        <div className="g-charts">
          <div className="card">
            <div className="card-head"><span className="card-title">📦 Issues by Project</span></div>
            <div className="chart-wrap"><Bar data={projectChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display:false } } }} /></div>
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">🔄 Status Distribution</span></div>
            <div className="chart-wrap"><Doughnut data={statusChartData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }} /></div>
          </div>
        </div>

        <div className="g-charts">
          <div className="card">
            <div className="card-head"><span className="card-title">🗂 Issue Type Mix</span></div>
            <div className="chart-wrap"><Bar data={typeChartData} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display:false } } }} /></div>
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">🕒 Sprint Timing</span></div>
            <div className="chart-wrap" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
               <h3 style={{fontSize: '48px', fontWeight: 800, color: 'var(--blue)'}}>{doneRate}%</h3>
               <p style={{color: 'var(--muted)', fontSize: '13px', marginTop: '8px'}}>Current sprint velocity</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeOverview = () => {
    return (
      <div className="dashboard">
        <div className="employee-header-card">
          <div className="emp-meta" style={{fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'}}>
            {employee.board} • {sprintName} {sprintDates?.start ? `(${moment.utc(sprintDates.start).format('D MMM')} - ${moment.utc(sprintDates.end).format('D MMM')})` : ''}
          </div>
          <h1 className="emp-name-large">{employee.name}</h1>
          <div className="sprint-badge" style={{marginTop:'12px', display:'inline-block', background:'rgba(255,255,255,0.15)', padding:'8px 16px', borderRadius:'12px', fontSize:'13px'}}>
            <Clock size={14} style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}} />
            <span style={{verticalAlign:'middle'}}>Performance Metrics</span>
          </div>
        </div>

        <div className="g3">
          {metricsData.periods.map((period, index) => {
            const totalItems = period.tasks + period.subtasks;
            const completedItems = period.completedTasks + period.completedSubtasks;
            const onTimeItems = period.completedOnTimeTasks + period.completedOnTimeSubtasks;
            const periodCompletionRate = calculatePercentage(completedItems, totalItems);
            const periodOnTimeRate = calculatePercentage(onTimeItems, totalItems);

            return (
              <div key={period.id} className="card">
                <div className="card-head"><span className="card-title">📅 {period.name}</span> <span style={{fontSize:'10px', color:'var(--muted)'}}>{period.dateRange}</span></div>
                <div className="card-body" style={{padding: '16px'}}>
                  <div className="kpi-row" style={{gridTemplateColumns: '1fr 1fr', marginBottom: '16px'}}>
                    <div className="kpi" style={{padding: '12px'}}>
                       <div className="kpi-n text-blue" style={{fontSize: '22px'}}>{period.tasks}</div>
                       <div className="kpi-l">Tasks</div>
                    </div>
                    <div className="kpi" style={{padding: '12px'}}>
                       <div className="kpi-n text-purple" style={{fontSize: '22px'}}>{period.subtasks}</div>
                       <div className="kpi-l">Subtasks</div>
                    </div>
                  </div>

                  <div style={{background: 'var(--surface)', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 600}}>
                      <span>Completion Rate</span>
                      <span className="text-success">{periodCompletionRate}%</span>
                    </div>
                    <div style={{height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden'}}>
                      <div style={{height: '100%', width: `${periodCompletionRate}%`, background: 'var(--green)', borderRadius: '3px'}}></div>
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px', marginTop: '12px', fontSize: '12px', fontWeight: 600}}>
                      <span>On-Time Completion Rate %</span>
                      <span className="text-blue">{periodOnTimeRate}%</span>
                    </div>
                    <div style={{height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden'}}>
                      <div style={{height: '100%', width: `${periodOnTimeRate}%`, background: 'var(--blue)', borderRadius: '3px'}}></div>
                    </div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', paddingBottom:'8px', borderBottom:'1px solid var(--border)'}}>
                      <span style={{color:'var(--muted)'}}>Completed Items:</span>
                      <span style={{fontWeight:600}}>{period.completedTasks + period.completedSubtasks}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', paddingBottom:'8px', borderBottom:'1px solid var(--border)'}}>
                      <span style={{color:'var(--muted)'}}>Task On-Time:</span>
                      <span className="text-success" style={{fontWeight:600}}>{period.completedOnTimeTasks + period.completedOnTimeSubtasks}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{color:'var(--muted)'}}>Dropped Tasks:</span>
                      <span className="text-danger" style={{fontWeight:600}}>{period.droppedTasks + period.droppedSubtasks}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (errorMsg) {
    return (
      <div className="dashboard-empty">
        <div className="empty-state">
          <AlertCircle size={64} color="var(--red)" />
          <h2 style={{color: "var(--red)", marginTop: "1rem"}}>Failed to Load Metrics</h2>
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (employee && (loading || !metricsData)) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Analyzing employee data...</p>
      </div>
    );
  }

  if (employee) return renderEmployeeOverview();
  if (board) return renderGlobalOverview([board]);
  return renderGlobalOverview();
};

export default Dashboard;
