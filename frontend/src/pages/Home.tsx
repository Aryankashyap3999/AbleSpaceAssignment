import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useCreatedTasks, useAssignedTasks } from '@/hooks/apis/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { LogOut, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TASK_EVENTS } from '@/utils/socketEvents';
import type { Task } from '@/apis/tasks';

type SortBy = 'dueDate' | 'createdAt';
type FilterStatus = 'all' | 'todo' | 'in_progress' | 'review' | 'completed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';

export const Home = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { data: createdTasks = [], isLoading: createdLoading } = useCreatedTasks();
  const { data: assignedTasks = [], isLoading: assignedLoading } = useAssignedTasks();

  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');

  // Listen for real-time task updates
  useEffect(() => {
    if (!socket) return;

    // Handle task created event
    socket.on(TASK_EVENTS.TASK_CREATED, () => {
      console.log('Task created, refetching tasks...');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assigned'] });
    });

    // Handle task updated event
    socket.on(TASK_EVENTS.TASK_UPDATED, () => {
      console.log('Task updated, refetching tasks...');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assigned'] });
    });

    // Handle task deleted event
    socket.on(TASK_EVENTS.TASK_DELETED, () => {
      console.log('Task deleted, refetching tasks...');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assigned'] });
    });

    // Handle task status changed event
    socket.on(TASK_EVENTS.TASK_STATUS_CHANGED, () => {
      console.log('Task status changed, refetching tasks...');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assigned'] });
    });

    return () => {
      socket.off(TASK_EVENTS.TASK_CREATED);
      socket.off(TASK_EVENTS.TASK_UPDATED);
      socket.off(TASK_EVENTS.TASK_DELETED);
      socket.off(TASK_EVENTS.TASK_STATUS_CHANGED);
    };
  }, [socket, queryClient]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filterAndSortTasks = (tasks: Task[]) => {
    return tasks
      .filter(task => {
        const statusMatch = filterStatus === 'all' || task.status === filterStatus;
        const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
        return statusMatch && priorityMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  };

  const filteredCreatedTasks = filterAndSortTasks(createdTasks);
  const filteredAssignedTasks = filterAndSortTasks(assignedTasks);
  const allTasks = [...createdTasks, ...assignedTasks];
  const overdueTasks = allTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AbleSpace</h1>
            <p className="text-sm text-gray-600">Welcome, {auth?.user?.name || 'User'}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/tasks/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">My Tasks</p>
            <p className="text-4xl font-bold text-blue-600">{createdTasks.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Assigned to Me</p>
            <p className="text-4xl font-bold text-purple-600">{assignedTasks.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">In Progress</p>
            <p className="text-4xl font-bold text-orange-600">
              {allTasks.filter(t => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Overdue</p>
            <p className="text-4xl font-bold text-red-600">{overdueTasks}</p>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="todo">📋 To Do</option>
                <option value="in_progress">⏳ In Progress</option>
                <option value="review">👁️ Review</option>
                <option value="completed">✓ Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Due Date (Earliest First)</option>
                <option value="createdAt">Created Date (Newest First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Created Tasks */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Created Tasks</h2>
            {createdLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredCreatedTasks.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-500">No tasks match your filters</p>
                {createdTasks.length === 0 && (
                  <>
                    <p className="text-gray-400 text-sm mt-2">or no tasks created yet</p>
                    <button
                      onClick={() => navigate('/tasks/new')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create your first task
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCreatedTasks.map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            )}
          </section>

          {/* Assigned Tasks */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned to Me</h2>
            {assignedLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : filteredAssignedTasks.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-500">No tasks match your filters</p>
                {assignedTasks.length === 0 && <p className="text-gray-400 text-sm mt-2">or no tasks assigned to you yet</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignedTasks.map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
