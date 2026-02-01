'use client';

import { useState } from 'react';
import { Reminder } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

interface CalendarViewProps {
  reminders: Reminder[];
  onSelectDate: (date: Date) => void;
}

export default function CalendarView({ reminders, onSelectDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayReminders = (date: Date) => {
    return reminders.filter((r) => isSameDay(new Date(r.datetime), date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ◀️
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ▶️
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {days.map((day) => {
          const dayReminders = getDayReminders(day);
          const isCurrentDay = isToday(day);
          const hasReminders = dayReminders.length > 0;

          return (
            <div
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`aspect-square p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                isCurrentDay
                  ? 'border-purple-500 bg-purple-50'
                  : hasReminders
                  ? 'border-purple-200 bg-purple-25'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="h-full flex flex-col">
                <div
                  className={`text-sm font-medium mb-1 ${
                    isCurrentDay ? 'text-purple-700' : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                {hasReminders && (
                  <div className="flex-1 space-y-1">
                    {dayReminders.slice(0, 3).map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`text-xs p-1 rounded truncate ${
                          reminder.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : new Date(reminder.datetime) < new Date()
                            ? 'bg-red-100 text-red-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                        title={reminder.title}
                      >
                        {reminder.title}
                      </div>
                    ))}
                    {dayReminders.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayReminders.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 border-2 border-purple-500 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 rounded"></div>
          <span className="text-gray-600">Upcoming</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span className="text-gray-600">Overdue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600">Completed</span>
        </div>
      </div>
    </div>
  );
}
