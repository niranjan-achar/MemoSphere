'use client';

import { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
}: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="glass rounded-xl p-5 border border-yellow-500/20 dark:border-yellow-400/20 hover:border-yellow-500/40 dark:hover:border-yellow-400/40 hover:shadow-lg transition-all duration-200 group animate-fade-in">
      {/* Header with favorite and actions */}
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={() => onToggleFavorite(note.id, note.is_favorite)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          {note.is_favorite ? '⭐' : '☆'}
        </button>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Edit note"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Delete note"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {note.title}
      </h3>

      {/* Content Preview */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
        {truncateContent(note.content)}
      </p>

      {/* Category */}
      {note.category && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs font-medium rounded-full">
            {note.category}
          </span>
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
        <span>Created {formatDate(note.created_at)}</span>
        {note.updated_at !== note.created_at && (
          <span className="text-blue-600">Updated</span>
        )}
      </div>
    </div>
  );
}
