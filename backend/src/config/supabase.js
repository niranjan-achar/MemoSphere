import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create Supabase client with service role for backend operations
export const createClient = () => {
  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Middleware to extract user from Authorization header
export const getUserFromToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization token provided' };
  }

  const token = authHeader.split('Bearer ')[1];
  const supabase = createClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};
