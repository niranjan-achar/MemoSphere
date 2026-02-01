'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Notes', href: '/notes', icon: '📝' },
    { name: 'To-Dos', href: '/todos', icon: '✅' },
    { name: 'Reminders', href: '/reminders', icon: '⏰' },
    { name: 'Vault', href: '/vault', icon: '🔒' },
    { name: 'Documents', href: '/documents', icon: '📄' },
  ];

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-strong shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <span className="text-3xl">🧠</span>
              <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
                MemoSphere
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive(item.href)
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side - Theme toggle & User */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* User Menu */}
              {user && (
                <div className="flex items-center space-x-3">
                  <img
                    src={user.user_metadata.avatar_url || '/icon-512x512.svg'}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-primary-500"
                  />
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/20 dark:border-gray-700/30 animate-slide-down">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all
                    ${
                      isActive(item.href)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {/* Theme toggle in mobile menu */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
              >
                <span className="mr-3 text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>

              {/* User info in mobile */}
              {user && (
                <div className="pt-4 border-t border-white/20 dark:border-gray-700/30">
                  <div className="flex items-center px-4 py-2">
                    <img
                      src={user.user_metadata.avatar_url || '/icon-512x512.svg'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.user_metadata.name || user.email}
                      </p>
                      <form action="/auth/signout" method="post">
                        <button
                          type="submit"
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          Sign out
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
}
