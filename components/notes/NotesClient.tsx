'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Note } from '@/types';
import { apiFetch } from '@/lib/api/config';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';

interface NotesClientProps {
  user: User;
}

export default function NotesClient({ user }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (noteData: Partial<Note>) => {
    try {
      const response = await apiFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        await loadNotes();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Note>) => {
    try {
      const response = await apiFetch(`/api/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadNotes();
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Filter notes by search only
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              📝 Notes
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 text-sm md:text-base"
          >
            <span>+</span>
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-strong border border-white/20 dark:border-gray-700/30 rounded-xl shadow-lg p-4 mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
        />
      </div>

      {/* Notes Form Modal */}
      {(showForm || editingNote) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <NoteForm
                note={editingNote || undefined}
                onSubmit={(data: Partial<Note>) => {
                  if (editingNote) {
                    handleUpdate(editingNote.id, data);
                  } else {
                    handleCreate(data);
                  }
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingNote(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try a different search' : 'Start capturing your thoughts and ideas'}
          </p>
            {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-200"
            >
              Create Your First Note
            </button>
          )}
        </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(note: Note) => setEditingNote(note)}
                  onDelete={(id: string) => handleDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
