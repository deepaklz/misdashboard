"use client";

import { useEffect, useState } from "react";
import { differenceInDays, parseISO, isPast, isToday } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, User } from "lucide-react";

type Issue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string | null;
    status: { name: string };
    assignee: { displayName: string } | null;
    reporter: { displayName: string } | null;
    created: string;
    updated: string;
    duedate: string | null;
  };
};

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/jira/issues");
        const data = await res.json();
        
        if (data.isDummy) {
          setWarningMsg(data.message);
        }

        const fetchedIssues = data.issues || [];
        setIssues(fetchedIssues);

        const uniqueAssignees = Array.from(
          new Set(
            fetchedIssues
              .map((i: Issue) => i.fields.assignee?.displayName)
              .filter(Boolean)
          )
        ) as string[];

        setAssignees(uniqueAssignees);
        if (uniqueAssignees.length > 0) {
          setSelectedAssignee(uniqueAssignees[0]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const getFilteredIssues = () => {
    if (!selectedAssignee) return [];
    return issues.filter(
      (i) => i.fields.assignee?.displayName === selectedAssignee
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl animate-pulse">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Jira Dashboard
          </h1>
        </div>
        <div className="flex-1">
          <h2 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-4">
            Team Members
          </h2>
          <ul className="space-y-2">
            {assignees.map((assignee) => (
              <li key={assignee}>
                <button
                  onClick={() => setSelectedAssignee(assignee)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                    selectedAssignee === assignee
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${selectedAssignee === assignee ? "bg-white/20" : "bg-gray-800"}`}>
                    <User size={16} />
                  </div>
                  <span className="font-medium">{assignee}</span>
                </button>
              </li>
            ))}
            {assignees.length === 0 && (
              <p className="text-sm text-gray-500">No assignees found.</p>
            )}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {warningMsg && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 flex items-center gap-3">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{warningMsg}</p>
          </div>
        )}

        {selectedAssignee && (
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedAssignee}'s Tasks
              </h2>
              <p className="text-gray-400 text-sm">
                Overview of all assigned cards across boards.
              </p>
            </div>
            <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
              <span className="text-xl font-bold text-blue-400">{getFilteredIssues().length}</span>
              <span className="text-gray-400 ml-2 text-sm">Total Cards</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {getFilteredIssues().map((issue) => {
            const isMissingDesc = !issue.fields.description?.trim();
            const isMissingDueDate = !issue.fields.duedate;
            
            const updatedDate = parseISO(issue.fields.updated);
            const daysSinceUpdate = differenceInDays(new Date(), updatedDate);
            const isStagnant = daysSinceUpdate > 2;

            let onTimeRemark = "On Track";
            let onTimeColor = "text-emerald-400";
            if (issue.fields.duedate) {
              const dueDate = parseISO(issue.fields.duedate);
              if (isPast(dueDate) && !isToday(dueDate) && issue.fields.status.name !== "Done") {
                onTimeRemark = "Overdue";
                onTimeColor = "text-red-400";
              }
            } else {
              onTimeRemark = "No Due Date";
              onTimeColor = "text-gray-400";
            }

            const hasAlerts = isMissingDesc || isMissingDueDate || isStagnant;

            return (
              <div
                key={issue.id}
                className={`bg-gray-900 rounded-2xl p-6 border transition-all ${
                  hasAlerts ? "border-red-500/30 shadow-lg shadow-red-500/10" : "border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-md">
                      {issue.key}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-gray-800 text-gray-300 rounded-md">
                      {issue.fields.status.name}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${onTimeColor}`}>
                    {onTimeRemark === "On Track" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    {onTimeRemark}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2">
                  {issue.fields.summary}
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reporter</p>
                    <p className="text-sm text-gray-300 font-medium">{issue.fields.reporter?.displayName || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
                    <p className="text-sm text-gray-300 font-medium">{issue.fields.duedate || "Not Set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Updated</p>
                    <p className="text-sm text-gray-300 font-medium">{daysSinceUpdate === 0 ? 'Today' : `${daysSinceUpdate} days ago`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
                    <p className="text-sm text-gray-300 font-medium">{new Date(issue.fields.created).toLocaleDateString()}</p>
                  </div>
                </div>

                {hasAlerts && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Action Required
                    </h4>
                    <ul className="space-y-1">
                      {isMissingDesc && (
                        <li className="text-sm text-red-300/80">• Missing Description</li>
                      )}
                      {isMissingDueDate && (
                        <li className="text-sm text-red-300/80">• Missing Due Date</li>
                      )}
                      {isStagnant && issue.fields.status.name !== "Done" && (
                        <li className="text-sm text-red-300/80">• No updates in the last 2 days</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
