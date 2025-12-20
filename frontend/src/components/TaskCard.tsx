import { type Task } from '@/apis/tasks';
import { Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const statusIcons = {
  todo: <AlertCircle className="w-4 h-4 text-gray-500" />,
  in_progress: <Clock className="w-4 h-4 text-blue-500" />,
  review: <AlertCircle className="w-4 h-4 text-purple-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== 'completed';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2">{task.title}</h3>
        <div className="flex gap-2 ml-2">
          {statusIcons[task.status as keyof typeof statusIcons]}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Calendar className="w-4 h-4" />
        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
          {dueDate.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
