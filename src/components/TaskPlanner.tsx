import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Bell,
  Sparkles,
  X
} from 'lucide-react';
import { TaskItem } from '../types';

interface TaskPlannerProps {
  onAskInChat: (query: string) => void;
}

export const TaskPlanner: React.FC<TaskPlannerProps> = ({ onAskInChat }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('10:00');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('General');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [alarmAlert, setAlarmAlert] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        dueDate: newDueDate || new Date().toISOString().split('T')[0],
        dueTime: newDueTime,
        priority: newPriority,
        category: newCategory,
      }),
    });
    const created = await res.json();
    setTasks((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus =
      task.status === 'completed'
        ? 'pending'
        : task.status === 'pending'
        ? 'in_progress'
        : 'completed';

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerProactiveNotification = () => {
    const highTask = tasks.find((t) => t.priority === 'high') || tasks[0];
    if (highTask) {
      setAlarmAlert(
        `🔔 [AURA Proactive Reminder]: "${highTask.title}" is due on ${highTask.dueDate} at ${highTask.dueTime || '10:00'}. Make sure all deliverables are verified!`
      );
      setTimeout(() => setAlarmAlert(null), 6000);
    }
  };

  const filteredTasks = tasks.filter((t) => (activeTab === 'all' ? true : t.status === activeTab));

  const priorityColors = {
    high: 'bg-rose-950 text-rose-400 border-rose-800',
    medium: 'bg-amber-950 text-amber-400 border-amber-800',
    low: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <div className="flex-1 bg-[#020617] text-slate-200 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bento Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Proactive Task Planner & Schedule Manager
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 text-indigo-400 border border-slate-800 font-mono">
                {tasks.filter((t) => t.status !== 'completed').length} Pending
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated agenda tracker with proactive reminders and natural language task synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerProactiveNotification}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
            title="Simulate AURA proactive audio/visual notification"
          >
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Simulate Proactive Alert</span>
          </button>

          <button
            id="add-task-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {alarmAlert && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs flex items-center gap-3 shadow-xl animate-in slide-in-from-top duration-200">
          <Bell className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
          <span className="flex-1 font-medium">{alarmAlert}</span>
          <button onClick={() => setAlarmAlert(null)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Filter Bento Bar */}
      <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 p-2 rounded-xl">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.replace('_', ' ')} (
            {tab === 'all' ? tasks.length : tasks.filter((t) => t.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                isDone
                  ? 'bg-slate-950 border-slate-800 opacity-60'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority.toUpperCase()} PRIORITY
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-mono">{task.category}</span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-2 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    ) : task.status === 'in_progress' ? (
                      <Circle className="w-4 h-4 text-indigo-400 fill-indigo-400/40" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-xs font-semibold tracking-tight ${
                        isDone ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>{task.dueDate}</span>
                  {task.dueTime && <span>• {task.dueTime}</span>}
                </div>

                <button
                  onClick={() => onAskInChat(`Help me plan and execute the task: ${task.title}`)}
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-medium text-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Execute with AI</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No tasks found in this view. Click "Add Task" to create a new agenda item.
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#020617] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Create New Scheduled Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Final Year Project Viva Demo"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Description / Milestones
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline key requirements or checklist items..."
                  rows={3}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Major Project, Exams"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
