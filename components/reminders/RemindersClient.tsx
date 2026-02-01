'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Reminder, RepeatType } from '@/types';
import { apiFetch } from '@/lib/api/config';
import ReminderCard from './ReminderCard';
import ReminderForm from './ReminderForm';
import CalendarView from './CalendarView';

interface RemindersClientProps {
  user: User;
}

export default function RemindersClient({ user }: RemindersClientProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('/api/reminders');
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (reminderData: Partial<Reminder>) => {
    try {
      const response = await apiFetch('/api/reminders', {
        method: 'POST',
        body: JSON.stringify(reminderData),
      });

      if (response.ok) {
        await loadReminders();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Reminder>) => {
    try {
      const response = await apiFetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadReminders();
        setEditingReminder(null);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await apiFetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleComplete = async (id: string) => {
    await handleUpdate(id, { status: 'completed' });
  };

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'all') return true;
    return reminder.status === filter;
  });

  const upcomingReminders = filteredReminders.filter(
    (r) => r.status === 'pending' && new Date(r.datetime) > new Date()
  );
  const pastReminders = filteredReminders.filter(
    (r) => new Date(r.datetime) <= new Date() && r.status === 'pending'
  );
  const completedReminders = filteredReminders.filter((r) => r.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ⏰ Reminders
            </h1>
            <p className="text-gray-600 mt-2">
              Never miss important tasks with smart reminders
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="glass border border-purple-500/20 dark:border-purple-400/20 rounded-xl p-4 animate-fade-in flex-1 min-w-[150px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{upcomingReminders.length}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          <div className="glass border border-red-500/20 dark:border-red-400/20 rounded-xl p-4 animate-fade-in flex-1 min-w-[150px]" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{pastReminders.length}</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
          <div className="glass border border-green-500/20 dark:border-green-400/20 rounded-xl p-4 animate-fade-in flex-1 min-w-[150px]" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{completedReminders.length}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 glass-strong border border-white/20 dark:border-gray-700/30 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'list'
                ? 'bg-purple-600 dark:bg-purple-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'calendar'
                ? 'bg-purple-600 dark:bg-purple-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            📅 Calendar
          </button>
        </div>

        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'pending'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-6">
          {upcomingReminders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={setEditingReminder}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {pastReminders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-3">Overdue</h2>
              <div className="space-y-3">
                {pastReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={setEditingReminder}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedReminders.length > 0 && filter !== 'pending' && (
            <div>
              <h2 className="text-lg font-semibold text-green-900 mb-3">Completed</h2>
              <div className="space-y-3">
                {completedReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={setEditingReminder}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredReminders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reminders yet</h3>
              <p className="text-gray-600 mb-4">Create your first reminder to get started!</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Reminder
              </button>
            </div>
          )}
        </div>
      ) : (
        <CalendarView reminders={filteredReminders} onSelectDate={(date: Date) => console.log(date)} />
      )}

      {/* Create/Edit Form Modal */}
      {(showForm || editingReminder) && (
        <ReminderForm
          reminder={editingReminder}
          onSave={editingReminder ? (data: Partial<Reminder>) => handleUpdate(editingReminder.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}
