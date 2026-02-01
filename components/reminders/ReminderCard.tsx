'use client';

import { Reminder } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export default function ReminderCard({ reminder, onEdit, onDelete, onComplete }: ReminderCardProps) {
  const isPast = new Date(reminder.datetime) < new Date();
  const isCompleted = reminder.status === 'completed';

  const repeatIcons: Record<string, string> = {
    none: '',
    daily: '🔁 Daily',
    weekly: '🔁 Weekly',
    monthly: '🔁 Monthly',
  };

  return (
    <div
      className={`glass rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-l-4 ${
        isCompleted
          ? 'border-green-500/30 dark:border-green-400/30 opacity-75'
          : isPast
          ? 'border-red-500/30 dark:border-red-400/30'
          : 'border-purple-500/30 dark:border-purple-400/30'
      } animate-fade-in group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {!isCompleted && (
              <button
                onClick={() => onComplete(reminder.id)}
                className="flex-shrink-0 w-6 h-6 border-2 border-purple-500 rounded-full hover:bg-purple-500 hover:border-purple-600 transition-all duration-200 flex items-center justify-center group-hover:scale-110"
              >
                <span className="text-transparent group-hover:text-white text-xs">✓</span>
              </button>
            )}
            {isCompleted && (
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <h3
              className={`text-lg font-semibold ${
                isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {reminder.title}
            </h3>
          </div>

          {reminder.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 ml-9">{reminder.description}</p>
          )}

          <div className="flex items-center space-x-4 ml-9 text-sm">
            <div
              className={`flex items-center space-x-1 ${
                isPast && !isCompleted ? 'text-red-600 font-semibold' : 'text-gray-600'
              }`}
            >
              <span>🕒</span>
              <span>{format(new Date(reminder.datetime), 'MMM dd, yyyy - h:mm a')}</span>
              {!isCompleted && (
                <span className="text-xs ml-1">
                  ({formatDistanceToNow(new Date(reminder.datetime), { addSuffix: true })})
                </span>
              )}
            </div>

            {reminder.repeat !== 'none' && (
              <div className="flex items-center space-x-1 text-purple-600 font-medium">
                <span>{repeatIcons[reminder.repeat]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isCompleted && (
            <button
              onClick={() => onEdit(reminder)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              ✏️
            </button>
          )}
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
