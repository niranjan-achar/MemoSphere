'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Document } from '@/types';
import { apiFetch } from '@/lib/api/config';
import DocumentCard from './DocumentCard';
import DocumentUpload from './DocumentUpload';

interface DocumentsClientProps {
  user: User;
}

export default function DocumentsClient({ user }: DocumentsClientProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    await loadDocuments();
    setShowUpload(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await apiFetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Document>) => {
    try {
      const response = await apiFetch(`/api/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadDocuments();
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = searchQuery === '' || 
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>📄</span>
              <span>Documents</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload and manage your important files
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="w-12 h-12 md:px-6 md:py-3 md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center md:space-x-2"
          >
            <span className="text-2xl md:text-base">+</span>
            <span className="hidden md:inline">Upload</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="glass rounded-xl p-4 border border-blue-500/20 dark:border-blue-400/20 flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Documents</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{documents.length}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-indigo-500/20 dark:border-indigo-400/20 flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">{formatSize(totalSize)}</p>
              </div>
              <div className="text-3xl">💾</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-strong rounded-xl p-6 mb-6 border border-white/20 dark:border-gray-700/30">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search documents by name, tags, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 glass rounded-xl border-2 border-dashed border-blue-500/30 dark:border-blue-400/30">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search'
              : 'Upload your first document to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📤 Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onUpload={handleUploadComplete}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
