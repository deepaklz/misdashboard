import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import SecurityOverlay from './components/SecurityOverlay';
import Dashboard from './components/Dashboard';
import jiraService from './services/jiraService';
import moment from 'moment';
import './styles/App.css';

import menuSequence from './config/menu_sequence.json';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [expandedBoards, setExpandedBoards] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentView, setCurrentView] = useState('current-sprint');
  const [loading, setLoading] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadJiraData();
      
      // Auto-refresh data every 1 hour (3600000 ms)
      const interval = setInterval(() => {
        console.log("Auto-refreshing JIRA data...");
        loadJiraData();
      }, 3600000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadJiraData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all boards to find sprints
      const boards = await jiraService.getBoards();
      
      const allSprintsMap = new Map();
      const uniqueSprintsFetchMap = new Map();

      // Collect all unique sprints first to prevent duplicate API calls
      await Promise.all(
        boards.map(async (board) => {
          try {
            const activeSprints = await jiraService.getTargetSprints(board.id);
            if (activeSprints) {
              activeSprints.forEach(s => {
                if (!uniqueSprintsFetchMap.has(s.id)) {
                  uniqueSprintsFetchMap.set(s.id, s);
                }
              });
            }
          } catch (error) {}
        })
      );

      // 2. Safely scan EVERY board for EVERY unique Sprint. 
      // This mathematically guarantees no team is dropped just because a Sprint formally "originated" on a different Agile Board in Jira natively
      await Promise.all(
        Array.from(uniqueSprintsFetchMap.values()).map(async (sprint) => {
          
          const sprintKey = sprint.name;
          if (!allSprintsMap.has(sprintKey)) {
            allSprintsMap.set(sprintKey, {
              id: sprint.id,
              name: sprint.name,
              state: sprint.state,
              startDate: sprint.startDate,
              endDate: sprint.endDate,
              boards: [],
              allIds: new Set([sprint.id])
            });
          } else {
            allSprintsMap.get(sprintKey).allIds.add(sprint.id);
          }
          
          const group = allSprintsMap.get(sprintKey);
          
          // Manual Overrides for specific sprint names
          if (sprintKey.toLowerCase().includes('sprint 2')) {
            group.startDate = '2026-03-10';
            group.endDate = '2026-03-23';
          }
          
          if (sprintKey.toLowerCase().includes('sprint 3')) {
            group.startDate = '2026-03-24';
            group.endDate = '2026-04-06';
          }
          
          if (sprint.state === 'active' && group.state !== 'active') {
             group.state = 'active';
             // Only use Jira dates if they haven't been overridden already
             if (!group.startDate) group.startDate = sprint.startDate;
             if (!group.endDate) group.endDate = sprint.endDate;
          }

          // Loop over ALL initialized boards executing explicit JQL filter mapping natively
          await Promise.all(
            boards.map(async (board) => {
              try {
                // Returns ONLY issues that belong to THIS Sprint AND exist formally across THIS Agile Board
                const issues = await jiraService.getBoardSprintIssues(board.id, sprint.id);

                if (issues && issues.length > 0) {
                  const employeesMap = new Map();
                  issues.forEach(issue => {
                    if (issue.fields.assignee) {
                      const assignee = issue.fields.assignee;
                      const name = assignee.displayName;
                      
                      // Filter duplicates: Only add if this is the designated board for this person OR if person is new
                      const designatedBoard = menuSequence.mapping[name];
                      if (!designatedBoard || designatedBoard === board.name) {
                        if (!employeesMap.has(assignee.accountId)) {
                           employeesMap.set(assignee.accountId, {
                             id: assignee.accountId,
                             name: name,
                             email: assignee.emailAddress
                           });
                        }
                      }
                    }
                  });

                  group.boards.push({
                    id: board.id,
                    name: board.name, // The exact Agile Board Name (E.g. "Product", "Engineering", "Design")
                    sprintId: sprint.id,
                    employees: Array.from(employeesMap.values()),
                    issues: issues
                  });
                }
              } catch (e) {
                // A 400/404 here just implies the queried board completely excludes issues referencing this specific sprint natively.
              }
            })
          );
        })
      );

      const computedSprints = Array.from(allSprintsMap.values()).filter(s => s.boards.length > 0);
      
      // Group unique employees for each sprint for the flat sidebar list
      computedSprints.forEach(sprint => {
        const sprintEmployeesMap = new Map();
        
        sprint.boards.forEach(board => {
          board.employees.forEach(emp => {
            const name = emp.name;
            const designatedBoard = menuSequence.mapping[name];
            
            // If employee not yet added OR this is their designated board, update/add them
            if (!sprintEmployeesMap.has(name) || designatedBoard === board.name) {
              const boardName = designatedBoard || board.name;
              let tag = 'unknown';
              if (boardName.toLowerCase().includes('eng')) tag = 'eng';
              else if (boardName.toLowerCase().includes('ai')) tag = 'ai';
              else if (boardName.toLowerCase().includes('de')) tag = 'de';
              else if (boardName.toLowerCase().includes('nwp')) tag = 'nwp';

              sprintEmployeesMap.set(name, {
                ...emp,
                boardName: boardName.split(' ')[0], // "ENG board" -> "ENG"
                tagClass: `tag-${tag}`,
                sprintId: board.sprintId,
                boardId: board.id
              });
            }
          });
        });

        // Convert map to array and sort relative to menuSequence.employees
        sprint.uniqueEmployees = Array.from(sprintEmployeesMap.values()).sort((a, b) => {
          const indexA = menuSequence.employees.indexOf(a.name);
          const indexB = menuSequence.employees.indexOf(b.name);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
      });

      // Sort sprints (Active first, then future, then id)
      computedSprints.sort((a, b) => {
        if (a.state === 'active' && b.state !== 'active') return -1;
        if (a.state !== 'active' && b.state === 'active') return 1;
        return b.id - a.id;
      });

      setSprints(computedSprints);
      
      if (computedSprints.length > 0) {
        // Automatically select the first sprint
        setSelectedSprint(computedSprints[0]);
        setSelectedBoard(null);
        setSelectedEmployee(null);
        
        // Auto-expand the first board of that sprint
        if (computedSprints[0].boards.length > 0) {
          const firstSprint = computedSprints[0];
          const firstBoard = firstSprint.boards[0];
          setExpandedBoards({ [`${firstSprint.id}-${firstBoard.id}`]: true });
        }
      }
    } catch (error) {
      console.error('Error loading JIRA data:', error);
      alert('Failed to load JIRA data. Please check your API credentials in Vercel environment variables.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (month) => {
    setExpandedSprints(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  const toggleBoard = (boardId, board = null) => {
    // Tapping the board name selects that board's dashboard view
    if (board) {
      setSelectedBoard(board);
      setSelectedEmployee(null);
    }
    
    setExpandedBoards(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  const selectEmployee = (employee, boardName, boardId, sprintId) => {
    setSelectedEmployee({ 
      ...employee, 
      board: boardName,
      boardId: boardId,
      sprintId: sprintId
    });
    setSelectedBoard(null);
  };

  if (!isAuthenticated) {
    return <SecurityOverlay onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">JIRA MetalCloud</h1>
          <p className="sidebar-subtitle">EM-MIS Dashboard</p>
        </div>

        <nav className="sidebar-nav">
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#5F6368' }}>
              Loading JIRA data...
            </div>
          ) : (
            <>
              {/* Multi-Sprint Sections */}
              {sprints.length === 0 ? (
                <div style={{ padding: '16px 24px', fontSize: '13px', color: '#5F6368' }}>
                  No active or future sprints found
                </div>
              ) : (
                sprints.map(sprint => (
                  <div key={sprint.id} className="nav-section">
                    <div 
                      className={`nav-section-header ${selectedSprint?.id === sprint.id ? 'active' : ''}`}
                      onClick={() => { 
                        setSelectedSprint(sprint); 
                        setSelectedBoard(null);
                        setSelectedEmployee(null); 
                      }}
                      style={{
                        cursor: 'pointer', 
                        background: selectedSprint?.id === sprint.id ? 'var(--blue-light)' : 'transparent',
                        color: selectedSprint?.id === sprint.id ? 'var(--blue)' : 'var(--muted)',
                        transition: 'background 0.2s',
                        borderRadius: '0 8px 8px 0',
                        marginRight: '12px'
                      }}
                    >
                      <BarChart3 size={18} style={{minWidth:'18px'}} />
                      <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {sprint.name} {sprint.startDate ? `- ${moment.utc(sprint.startDate).format('D MMM')} - ${moment.utc(sprint.endDate).format('D MMM')}` : ''}
                      </span>
                      {sprint.state === 'active' && (
                        <div style={{minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', marginLeft: '10px'}} title="Active Sprint" />
                      )}
                    </div>
                    
                    {selectedSprint?.id === sprint.id && (
                      <div className="nav-item-group">
                        <div className="nav-children" style={{paddingLeft: 0}}>
                          {sprint.uniqueEmployees.map(employee => (
                            <button
                              key={employee.id}
                              className={`nav-item-child ${selectedEmployee?.id === employee.id ? 'active' : ''}`}
                              onClick={() => selectEmployee(employee, employee.boardName, employee.boardId, employee.sprintId)}
                              style={{paddingLeft: '32px', display: 'flex', alignItems: 'center'}}
                            >
                              <span style={{flex: 1}}>{employee.name}</span>
                              <span className={`board-tag ${employee.tagClass}`}>{employee.boardName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Dashboard 
          employee={selectedEmployee} 
          board={selectedBoard}
          currentView={currentView} 
          sprintBoards={selectedSprint?.boards || []}
          sprintName={selectedSprint?.name}
          sprintIds={selectedSprint?.allIds ? Array.from(selectedSprint.allIds) : []}
          sprintDates={{
            start: selectedSprint?.startDate,
            end: selectedSprint?.endDate
          }}
        />
      </main>
    </div>
  );
}

export default App;
