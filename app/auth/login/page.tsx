import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { GlassCard } from '@/components/ui/GlassCard';

export default async function LoginPage() {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-700">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-block">
            <h1 className="text-6xl font-bold text-white mb-3 drop-shadow-lg">
              🧠 <span className="gradient-text-white">MemoSphere</span>
            </h1>
          </div>
          <p className="text-white/90 text-lg font-medium">Your Second Brain</p>
        </div>
        
        {/* Login Card */}
        <GlassCard className="p-8 md:p-10 animate-slide-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your digital assistant
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </GlassCard>

        {/* Features */}
        <div className="mt-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-6 text-white/90 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>PWA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
