'use client';

import { useState } from 'react';
import { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Document>) => void;
}

export default function DocumentCard({ document, onDelete, onUpdate }: DocumentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(document.file_name);
  const [category, setCategory] = useState(document.category || '');
  const [tags, setTags] = useState(document.tags?.join(', ') || '');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    return '📎';
  };

  const handleSave = () => {
    onUpdate(document.id, {
      file_name: name,
      category: category || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Work, Personal"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-white/20 dark:border-gray-700/30 hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-200 overflow-hidden group hover:shadow-xl">
      <div className="p-6">
        {/* File Icon & Type */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-5xl">{getFileIcon(document.file_type)}</div>
          <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
            {document.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
          </span>
        </div>

        {/* Document Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 truncate" title={document.file_name}>
          {document.file_name}
        </h3>

        {/* Category */}
        {document.category && (
          <div className="mb-3">
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
              📁 {document.category}
            </span>
          </div>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {document.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{document.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* File Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
          <div className="flex items-center justify-between">
            <span>📊 Size:</span>
            <span className="font-medium">{formatSize(document.file_size)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>📅 Uploaded:</span>
            <span className="font-medium">{formatDate(document.uploaded_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={document.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
          >
            👁️ View
          </a>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
