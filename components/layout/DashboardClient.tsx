'use client';

import Navbar from '@/components/layout/Navbar';
import { User } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: User;
  children: React.ReactNode;
}

export default function DashboardClient({ user, children }: DashboardClientProps) {
  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
