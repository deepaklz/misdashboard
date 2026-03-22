import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import SecurityOverlay from './components/SecurityOverlay';
import Dashboard from './components/Dashboard';
import jiraService from './services/jiraService';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedSprints, setExpandedSprints] = useState({});
  const [expandedBoards, setExpandedBoards] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentView, setCurrentView] = useState('current-sprint');
  const [loading, setLoading] = useState(false);
  const [sprintData, setSprintData] = useState({
    pastSprints: {},
    currentSprint: {
      name: '',
      boards: []
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadJiraData();
    }
  }, [isAuthenticated]);

  const loadJiraData = async () => {
    setLoading(true);
    try {
      // Fetch all boards
      const boards = await jiraService.getBoards();
      
      // For each board, get sprints and organize data
      const boardsWithEmployees = await Promise.all(
        boards.map(async (board) => {
          try {
            // Get active sprint for this board
            const activeSprint = await jiraService.getActiveSprint(board.id);
            
            if (activeSprint) {
              // Get issues for this sprint
              const issues = await jiraService.getSprintIssues(activeSprint.id);
              
              // Extract unique employees (assignees)
              const employeesMap = new Map();
              issues.forEach(issue => {
                if (issue.fields.assignee) {
                  const assignee = issue.fields.assignee;
                  if (!employeesMap.has(assignee.accountId)) {
                    employeesMap.set(assignee.accountId, {
                      id: assignee.accountId,
                      name: assignee.displayName,
                      email: assignee.emailAddress
                    });
                  }
                }
              });
              
              return {
                id: board.id,
                name: board.name,
                sprintId: activeSprint.id,
                sprintName: activeSprint.name,
                employees: Array.from(employeesMap.values())
              };
            }
            return null;
          } catch (error) {
            console.error(`Error loading board ${board.name}:`, error);
            return null;
          }
        })
      );

      // Filter out null boards and set data
      const validBoards = boardsWithEmployees.filter(b => b !== null && b.employees.length > 0);
      
      if (validBoards.length > 0) {
        setSprintData({
          pastSprints: {},
          currentSprint: {
            name: validBoards[0].sprintName || 'Current Sprint',
            boards: validBoards
          }
        });
        
        // Auto-expand the first board
        if (validBoards[0]) {
          setExpandedBoards({ [validBoards[0].id]: true });
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

  const toggleBoard = (boardId) => {
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
              {/* Current Sprint Section */}
              <div className="nav-section">
                <div className="nav-section-header">
                  <BarChart3 size={18} />
                  <span>Current Sprint</span>
                </div>
                
                {sprintData.currentSprint.boards.length === 0 ? (
                  <div style={{ padding: '16px 24px', fontSize: '13px', color: '#5F6368' }}>
                    No active sprints found
                  </div>
                ) : (
                  <div className="nav-item-group">
                    <div className="nav-item-parent active">
                      <span>{sprintData.currentSprint.name}</span>
                    </div>
                    
                    {sprintData.currentSprint.boards.map(board => (
                      <div key={board.id} className="nav-item-group nested">
                        <button
                          className="nav-item-parent"
                          onClick={() => toggleBoard(board.id)}
                        >
                          {expandedBoards[board.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <Users size={14} />
                          <span>{board.name}</span>
                        </button>
                        
                        {expandedBoards[board.id] && (
                          <div className="nav-children">
                            {board.employees.map(employee => (
                              <button
                                key={employee.id}
                                className={`nav-item-child ${selectedEmployee?.id === employee.id ? 'active' : ''}`}
                                onClick={() => selectEmployee(employee, board.name, board.id, board.sprintId)}
                              >
                                {employee.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Dashboard employee={selectedEmployee} currentView={currentView} />
      </main>
    </div>
  );
}

export default App;
