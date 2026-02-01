'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Todo, TodoPriority, TodoStatus } from '@/types';
import { apiFetch } from '@/lib/api/config';
import TodoCard from './TodoCard';
import TodoForm from './TodoForm';

interface TodosClientProps {
  user: User;
}

export default function TodosClient({ user }: TodosClientProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<'all' | TodoStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('/api/todos');
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (todoData: Partial<Todo>) => {
    try {
      console.log('Sending todo data:', todoData);
      const response = await apiFetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        await loadTodos();
        setShowForm(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create todo:', errorData);
        alert(`Failed to create todo: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Error creating todo. Check console for details.');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await apiFetch(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadTodos();
        setEditingTodo(null);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await apiFetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: TodoStatus) => {
    const newStatus: TodoStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    await handleUpdate(id, { status: newStatus });
  };

  // Filter and search todos
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter = filter === 'all' || todo.status === filter;
    const matchesSearch = todo.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group todos by priority
  const urgentTodos = filteredTodos.filter((t) => t.priority === 'urgent' && t.status !== 'completed');
  const highTodos = filteredTodos.filter((t) => t.priority === 'high' && t.status !== 'completed');
  const mediumTodos = filteredTodos.filter((t) => t.priority === 'medium' && t.status !== 'completed');
  const lowTodos = filteredTodos.filter((t) => t.priority === 'low' && t.status !== 'completed');
  const completedTodos = filteredTodos.filter((t) => t.status === 'completed');

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.status === 'completed').length,
    pending: todos.filter((t) => t.status === 'todo').length,
    inProgress: todos.filter((t) => t.status === 'in_progress').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              ✅ To-Do List
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Stay organized and productive with smart task management
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="glass border border-blue-500/20 dark:border-blue-400/20 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          <div className="glass border border-green-500/20 dark:border-green-400/20 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completed}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="glass border border-yellow-500/20 dark:border-yellow-400/20 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.inProgress}</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
          <div className="glass border border-purple-500/20 dark:border-purple-400/20 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Completion</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{completionRate}%</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search tasks..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('todo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'todo'
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'in_progress'
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Urgent Tasks */}
          {urgentTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-3 flex items-center space-x-2">
                <span>🔥</span>
                <span>Urgent</span>
                <span className="text-sm text-red-600">({urgentTodos.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgentTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={setEditingTodo}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* High Priority */}
          {highTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-orange-900 mb-3 flex items-center space-x-2">
                <span>⚠️</span>
                <span>High Priority</span>
                <span className="text-sm text-orange-600">({highTodos.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {highTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={setEditingTodo}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {mediumTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                <span>📋</span>
                <span>Medium Priority</span>
                <span className="text-sm text-blue-600">({mediumTodos.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mediumTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={setEditingTodo}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {lowTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>📝</span>
                <span>Low Priority</span>
                <span className="text-sm text-gray-600">({lowTodos.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lowTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={setEditingTodo}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTodos.length > 0 && filter !== 'todo' && filter !== 'in_progress' && (
            <div>
              <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center space-x-2">
                <span>✅</span>
                <span>Completed</span>
                <span className="text-sm text-green-600">({completedTodos.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={setEditingTodo}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTodos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first task to get started!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Task
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showForm || editingTodo) && (
        <TodoForm
          todo={editingTodo}
          onSave={editingTodo ? (data: Partial<Todo>) => handleUpdate(editingTodo.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}
