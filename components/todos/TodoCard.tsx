'use client';

import { Todo, TodoPriority, TodoStatus } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: TodoStatus) => void;
}

export default function TodoCard({ todo, onEdit, onDelete, onToggleStatus }: TodoCardProps) {
  const isCompleted = todo.status === 'completed';
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !isCompleted;

  const priorityConfig: Record<TodoPriority, { border: string; emoji: string }> = {
    urgent: { border: 'border-red-500/30 dark:border-red-400/30', emoji: '🔥' },
    high: { border: 'border-orange-500/30 dark:border-orange-400/30', emoji: '⚠️' },
    medium: { border: 'border-blue-500/30 dark:border-blue-400/30', emoji: '📋' },
    low: { border: 'border-gray-500/30 dark:border-gray-400/30', emoji: '📝' },
  };

  const statusConfig: Record<TodoStatus, { bg: string; text: string; label: string }> = {
    todo: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'To Do' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
  };

  const config = priorityConfig[todo.priority];
  const statusStyle = statusConfig[todo.status];

  return (
    <div
      className={`glass rounded-xl p-5 hover:shadow-lg transition-all duration-200 border ${config.border} border-l-4 ${
        isCompleted ? 'opacity-75' : ''
      } animate-fade-in group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggleStatus(todo.id, todo.status)}
            className={`flex-shrink-0 w-6 h-6 border-2 rounded-full transition-all duration-200 flex items-center justify-center mt-1 ${
              isCompleted
                ? 'bg-green-500 border-green-600'
              : `${config.border} hover:bg-opacity-20`
            } group-hover:scale-110`}
          >
            {isCompleted && <span className="text-white text-xs">✓</span>}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold ${
                isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {todo.task}
            </h3>
            {todo.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{todo.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xl">{config.emoji}</span>
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-3 text-sm">
          {/* Status Badge */}
          <span className={`px-3 py-1 ${statusStyle.bg} ${statusStyle.text} rounded-full font-medium text-xs`}>
            {statusStyle.label}
          </span>

          {/* Due Date */}
          {todo.due_date && (
            <div
              className={`flex items-center space-x-1 ${
                isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
              }`}
            >
              <span>{isOverdue ? '⚠️' : '📅'}</span>
              <span className="text-xs">
                {format(new Date(todo.due_date), 'MMM dd')}
                {!isCompleted && (
                  <span className="ml-1">
                    ({formatDistanceToNow(new Date(todo.due_date), { addSuffix: true })})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isCompleted && (
            <button
              onClick={() => onEdit(todo)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Progress Bar for In Progress */}
      {todo.status === 'in_progress' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '50%' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
