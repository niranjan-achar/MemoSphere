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

  // PIN states
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadVaultItems();
    }
  }, [isUnlocked]);

  const checkPinStatus = async () => {
    try {
      const response = await apiFetch('/api/vault/pin');
      if (response.ok) {
        const data = await response.json();
        setHasPin(data.hasPin);
        setIsSettingPin(!data.hasPin);
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPin = async () => {
    setPinError('');

    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    try {
      const response = await apiFetch('/api/vault/pin', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        setHasPin(true);
        setIsSettingPin(false);
        setIsUnlocked(true);
        setPin('');
        setConfirmPin('');
      } else {
        const error = await response.json();
        setPinError(error.error || 'Failed to set PIN');
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      setPinError('Failed to set PIN');
    }
  };

  const handleUnlock = async () => {
    setPinError('');

    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }

    try {
      const response = await apiFetch('/api/vault/pin', {
        method: 'PUT',
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setIsUnlocked(true);
          setPin('');
        } else {
          setPinError('Incorrect PIN');
        }
      } else {
        setPinError('Failed to verify PIN');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setPinError('Failed to verify PIN');
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
      } else {
        const errorData = await response.json();
        console.error('Create vault item failed:', errorData);
        alert(errorData.error || 'Failed to create vault item');
      }
    } catch (error) {
      console.error('Error creating vault item:', error);
      alert('Failed to create vault item. Please try again.');
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
      } else {
        const errorData = await response.json();
        console.error('Update vault item failed:', errorData);
        alert(errorData.error || 'Failed to update vault item');
      }
    } catch (error) {
      console.error('Error updating vault item:', error);
      alert('Failed to update vault item. Please try again.');
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Set PIN screen
  if (isSettingPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="glass-strong rounded-2xl shadow-2xl p-8 border border-purple-200 dark:border-purple-700">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Secure Your Vault
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Set a PIN to protect your sensitive information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Create PIN (at least 4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPin(value);
                    setPinError('');
                  }}
                  placeholder="Enter 4-6 digit PIN"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setConfirmPin(value);
                    setPinError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetPin()}
                  placeholder="Re-enter PIN"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {pinError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{pinError}</p>
                </div>
              )}

              <button
                onClick={handleSetPin}
                disabled={!pin || !confirmPin}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔒 Set PIN & Continue
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm flex items-start space-x-2">
                <span>💡</span>
                <span>
                  Your PIN is encrypted and stored securely. Make sure to remember it - you'll need it to access your vault.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lock screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="glass-strong rounded-2xl shadow-2xl p-8 border border-purple-200 dark:border-purple-700">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Vault Locked
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Enter your PIN to unlock</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPin(value);
                  setPinError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter PIN"
                autoFocus
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              {pinError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{pinError}</p>
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={!pin}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔓 Unlock Vault
              </button>
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔒</span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Secure Vault
              </h1>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Your passwords and sensitive data, encrypted with AES-256
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsUnlocked(false);
                setPin('');
              }}
              className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
            >
              🔒 Lock
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-1 text-sm"
            >
              <span>+</span>
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - 2x2 grid on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4">
          <div className="glass rounded-xl p-3 border border-blue-500/20 dark:border-blue-400/20 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">Passwords</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{stats.passwords}</p>
              </div>
              <div className="text-2xl">🔑</div>
            </div>
          </div>
          <div className="glass rounded-xl p-3 border border-green-500/20 dark:border-green-400/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-xs font-medium">Cards</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">{stats.cards}</p>
              </div>
              <div className="text-2xl">💳</div>
            </div>
          </div>
          <div className="glass rounded-xl p-3 border border-purple-500/20 dark:border-purple-400/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-xs font-medium">Notes</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{stats.notes}</p>
              </div>
              <div className="text-2xl">📝</div>
            </div>
          </div>
          <div className="glass rounded-xl p-3 border border-pink-500/20 dark:border-pink-400/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 dark:text-pink-400 text-xs font-medium">Identities</p>
                <p className="text-xl font-bold text-pink-900 dark:text-pink-100">{stats.identities}</p>
              </div>
              <div className="text-2xl">👤</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search vault..."
          className="w-full px-4 py-2 glass-strong border border-white/20 dark:border-gray-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
        />

        <div className="flex items-center space-x-1 overflow-x-auto glass-strong rounded-lg p-1 border border-white/20 dark:border-gray-700/30">
          {(['all', 'password', 'card', 'note', 'identity'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap ${
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
