import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch actual counts
  const [reminders, todos, notes, documents] = await Promise.all([
    supabase.from('reminders').select('id', { count: 'exact', head: true }),
    supabase.from('todos').select('id', { count: 'exact', head: true }),
    supabase.from('notes').select('id', { count: 'exact', head: true }),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
  ]);

  const stats = [
    {
      label: 'Active Reminders',
      value: reminders.count || 0,
      icon: '⏰',
      gradient: 'from-blue-500 to-cyan-500',
      href: '/reminders',
    },
    {
      label: 'Pending To-Dos',
      value: todos.count || 0,
      icon: '✅',
      gradient: 'from-green-500 to-emerald-500',
      href: '/todos',
    },
    {
      label: 'Notes Saved',
      value: notes.count || 0,
      icon: '📝',
      gradient: 'from-purple-500 to-pink-500',
      href: '/notes',
    },
    {
      label: 'Documents',
      value: documents.count || 0,
      icon: '📄',
      gradient: 'from-orange-500 to-red-500',
      href: '/documents',
    },
  ];

  const quickActions = [
    {
      title: 'Add Reminder',
      description: 'Never forget important tasks',
      icon: '⏰',
      href: '/reminders',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Create Note',
      description: 'Save your thoughts instantly',
      icon: '📝',
      href: '/notes',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Secure Vault',
      description: 'Store credentials securely',
      icon: '🔒',
      href: '/vault',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center md:text-left animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="gradient-text">Welcome back</span>
          <span className="text-gray-900 dark:text-white">, {user?.user_metadata.name?.split(' ')[0] || 'there'}!</span>
          <span className="ml-2">👋</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your personal digital assistant is ready to help you stay organized.
        </p>
      </div>

      {/* Stats Cards - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <div style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-up">
              <GlassCard hover className="p-4 md:p-6 cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2">{stat.label}</p>
                    <p className={`text-2xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                  <div className="text-3xl md:text-5xl opacity-80">{stat.icon}</div>
              </div>
            </GlassCard>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ animationDelay: '400ms' }} className="animate-slide-up">
        <GlassCard className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="group relative overflow-hidden rounded-xl p-6 border-2 border-transparent hover:border-white/50 dark:hover:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>
      </div>

      {/* CTA Section */}
      <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-90" />
        <div className="relative p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-3">Stay Organized, Stay Productive</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl">
            Manage your tasks, notes, and reminders all in one place. Let MemoSphere be your second brain.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/todos"
              className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              View To-Dos
            </Link>
            <Link
              href="/reminders"
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
            >
              Set a Reminder
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
