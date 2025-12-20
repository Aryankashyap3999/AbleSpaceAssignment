import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateTaskMutation } from '@/hooks/apis/useTaskMutations'; 
import { UserSearchInput } from '@/components/UserSearchInput';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import type { User } from '@/apis/users';

// Zod validation schema
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']),
  dueDate: z.string().min(1, 'Due date is required'),
  assignedToId: z.string().optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

export const CreateTask = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { mutate: createTask, isPending, error } = useCreateTaskMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      assignedToId: '',
    },
  });

  const onSubmit = (data: CreateTaskForm) => {
    createTask(
      {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        assignedToId: selectedUser?._id || undefined,
      },
      {
        onSuccess: () => {
          navigate('/home');    
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Task</h1>
          <p className="text-gray-600 mb-8">Fill in the details below to create a new task</p>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Failed to create task</p>
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-2">
                📝 Task Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Design Homepage"
                {...register('title')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 transition"
              />
              {errors.title && <p className="text-red-600 text-sm mt-2">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">
                📄 Description
              </label>
              <textarea
                id="description"
                placeholder="Describe your task in detail..."
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500 transition resize-none"
              />
              {errors.description && <p className="text-red-600 text-sm mt-2">{errors.description.message}</p>}
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-bold text-gray-800 mb-2">
                  🚀 Priority
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
                {errors.priority && <p className="text-red-600 text-sm mt-2">{errors.priority.message}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-800 mb-2">
                  ✅ Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="todo">📋 To Do</option>
                  <option value="in_progress">⏳ In Progress</option>
                  <option value="review">👁️ Review</option>
                  <option value="completed">✓ Completed</option>
                </select>
                {errors.status && <p className="text-red-600 text-sm mt-2">{errors.status.message}</p>}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-bold text-gray-800 mb-2">
                📅 Due Date
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                {...register('dueDate')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-linear-to-br from-gray-50 to-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
              {errors.dueDate && <p className="text-red-600 text-sm mt-2">{errors.dueDate.message}</p>}
            </div>

            {/* Assigned To (Optional) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                👤 Assign To (Optional)
              </label>
              <UserSearchInput
                onUserSelect={setSelectedUser}
                selectedUser={selectedUser}
                placeholder="Search by username or name..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {selectedUser 
                  ? `Assigned to ${selectedUser.name} (@${selectedUser.username})`
                  : 'Leave empty to create task without assigning'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  '✨ Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/home')}
                disabled={isPending}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
