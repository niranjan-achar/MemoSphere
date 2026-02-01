'use client';

import { useState } from 'react';
import { VaultItem, VaultCategory, VaultData } from '@/types';
import { apiFetch } from '@/lib/api/config';

interface VaultCardProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
}

export default function VaultCard({ item, onEdit, onDelete }: VaultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [decryptedData, setDecryptedData] = useState<VaultData | null>(null);

  const categoryConfig: Record<VaultCategory, { bg: string; border: string; icon: string; label: string }> = {
    password: { bg: 'glass border-blue-500/30 dark:border-blue-400/30', border: 'border-l-4 border-l-blue-500 dark:border-l-blue-400', icon: '🔑', label: 'Password' },
    card: { bg: 'glass border-green-500/30 dark:border-green-400/30', border: 'border-l-4 border-l-green-500 dark:border-l-green-400', icon: '💳', label: 'Payment Card' },
    note: { bg: 'glass border-purple-500/30 dark:border-purple-400/30', border: 'border-l-4 border-l-purple-500 dark:border-l-purple-400', icon: '📝', label: 'Secure Note' },
    identity: { bg: 'glass border-pink-500/30 dark:border-pink-400/30', border: 'border-l-4 border-l-pink-500 dark:border-l-pink-400', icon: '👤', label: 'Identity' },
    other: { bg: 'glass border-gray-500/30 dark:border-gray-400/30', border: 'border-l-4 border-l-gray-500 dark:border-l-gray-400', icon: '📦', label: 'Other' },
  };

  const config = categoryConfig[item.category];

  const handleReveal = async () => {
    if (showDetails && decryptedData) {
      setShowDetails(false);
      return;
    }

    try {
      const response = await apiFetch(`/api/vault/${item.id}/decrypt`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setDecryptedData(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error decrypting data:', error);
      alert('Failed to decrypt data');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div
      className={`${config.bg} ${config.border} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{config.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{config.label}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Details */}
      {showDetails && decryptedData && (
        <div className="mb-4 space-y-2 p-3 glass-strong rounded-lg border border-white/20 dark:border-gray-700/30">
          {item.category === 'password' && (
            <>
              {decryptedData.username && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Username:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{decryptedData.username}</span>
                    <button
                      onClick={() => copyToClipboard(decryptedData.username!, 'Username')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              {decryptedData.password && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Password:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 select-all">{decryptedData.password}</span>
                    <button
                      onClick={() => copyToClipboard(decryptedData.password!, 'Password')}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              {decryptedData.url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">URL:</span>
                  <a
                    href={decryptedData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                  >
                    {decryptedData.url}
                  </a>
                </div>
              )}
            </>
          )}

          {item.category === 'card' && (
            <>
              {decryptedData.cardNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Card Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">•••• {decryptedData.cardNumber.slice(-4)}</span>
                    <button
                      onClick={() => copyToClipboard(decryptedData.cardNumber!, 'Card number')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              {decryptedData.expiryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expiry:</span>
                  <span className="text-sm font-medium">{decryptedData.expiryDate}</span>
                </div>
              )}
              {decryptedData.cvv && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CVV:</span>
                  <span className="text-sm font-mono">•••</span>
                </div>
              )}
            </>
          )}

          {item.category === 'note' && decryptedData.note && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Note:</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{decryptedData.note}</p>
            </div>
          )}

          {item.category === 'identity' && (
            <>
              {decryptedData.fullName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium">{decryptedData.fullName}</span>
                </div>
              )}
              {decryptedData.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm">{decryptedData.email}</span>
                </div>
              )}
              {decryptedData.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm">{decryptedData.phone}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleReveal}
          className="flex-1 px-4 py-2 glass-strong hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          {showDetails ? '👁️ Hide' : '👁️ Reveal'}
        </button>
        <button
          onClick={() => copyToClipboard(item.id, 'Item ID')}
          className="p-2 bg-white/80 hover:bg-white text-gray-600 rounded-lg transition-colors"
          title="Copy ID"
        >
          📋
        </button>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mt-3">
        Created {new Date(item.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
