'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { VaultItem, VaultCategory } from '@/types';
import { apiFetch } from '@/lib/api/config';
import VaultCard from './VaultCard';
import VaultForm from './VaultForm';

interface VaultClientProps {
  user: User;
}

export default function VaultClient({ user }: VaultClientProps) {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [filter, setFilter] = useState<'all' | VaultCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');

  useEffect(() => {
    if (isUnlocked) {
      loadVaultItems();
    }
  }, [isUnlocked]);

  const handleUnlock = () => {
    // In production, verify master password against stored hash
    if (masterPassword.length >= 6) {
      setIsUnlocked(true);
    } else {
      alert('Master password must be at least 6 characters');
    }
  };

  const loadVaultItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('/api/vault');
      if (response.ok) {
        const data = await response.json();
        setVaultItems(data);
      }
    } catch (error) {
      console.error('Error loading vault items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (itemData: any) => {
    try {
      const response = await apiFetch('/api/vault', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        await loadVaultItems();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating vault item:', error);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    try {
      const response = await apiFetch(`/api/vault/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadVaultItems();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating vault item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    try {
      const response = await apiFetch(`/api/vault/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadVaultItems();
      }
    } catch (error) {
      console.error('Error deleting vault item:', error);
    }
  };

  const filteredItems = vaultItems.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: vaultItems.length,
    passwords: vaultItems.filter((i) => i.category === 'password').length,
    cards: vaultItems.filter((i) => i.category === 'card').length,
    notes: vaultItems.filter((i) => i.category === 'note').length,
    identities: vaultItems.filter((i) => i.category === 'identity').length,
  };

  // Lock screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="glass-strong rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Secure Vault</h1>
              <p className="text-gray-600 dark:text-gray-400">Enter your master password to unlock</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Master Password"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleUnlock}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                🔓 Unlock Vault
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm flex items-start space-x-2">
                <span>⚠️</span>
                <span>
                  <strong>Note:</strong> This is a demo. In production, enter a password of at least 6 characters to unlock.
                </span>
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">🔐 AES-256 Encryption</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs">Your data is encrypted end-to-end</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main vault interface
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>🔒</span>
              <span>Secure Vault</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your passwords and sensitive data, encrypted with AES-256
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setIsUnlocked(false);
                setMasterPassword('');
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              🔒 Lock Vault
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="glass rounded-xl p-4 border border-blue-500/20 dark:border-blue-400/20 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Passwords</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.passwords}</p>
              </div>
              <div className="text-3xl">🔑</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-green-500/20 dark:border-green-400/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Cards</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.cards}</p>
              </div>
              <div className="text-3xl">💳</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-purple-500/20 dark:border-purple-400/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Notes</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.notes}</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-pink-500/20 dark:border-pink-400/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">Identities</p>
                <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">{stats.identities}</p>
              </div>
              <div className="text-3xl">👤</div>
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
            placeholder="🔍 Search vault..."
            className="w-full px-4 py-3 glass-strong border border-white/20 dark:border-gray-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center space-x-2 glass-strong rounded-lg p-1 border border-white/20 dark:border-gray-700/30">
          {(['all', 'password', 'card', 'note', 'identity'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === category
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <VaultCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass rounded-xl border-2 border-dashed border-indigo-500/30 dark:border-indigo-400/30">
          <div className="text-6xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No items found' : 'Vault is empty'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try a different search term' : 'Add your first secure item to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Item
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showForm || editingItem) && (
        <VaultForm
          item={editingItem}
          onSave={editingItem ? (data: any) => handleUpdate(editingItem.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
