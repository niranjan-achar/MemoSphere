import { createClient } from '@/lib/supabase/server';
import { 
  User, 
  Reminder, 
  Todo, 
  Note, 
  VaultItem, 
  Document, 
  ActivityLog,
  ActivityType 
} from '@/types';

// User queries
export async function getUser(userId: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function upsertUser(user: Partial<User> & { id: string }): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .upsert(user)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reminder queries
export async function getReminders(userId: string, status?: string): Promise<Reminder[]> {
  const supabase = await createClient();
  let query = supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('datetime', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Reminder> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReminder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Todo queries
export async function getTodos(userId: string, status?: string): Promise<Todo[]> {
  const supabase = await createClient();
  let query = supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Todo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Note queries
export async function getNotes(userId: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Vault queries
export async function getVaultItems(userId: string): Promise<VaultItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vault')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createVaultItem(item: Omit<VaultItem, 'id' | 'created_at' | 'updated_at'>): Promise<VaultItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vault')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVaultItem(id: string, updates: Partial<VaultItem>): Promise<VaultItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vault')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteVaultItem(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('vault')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Document queries
export async function getDocuments(userId: string): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDocument(doc: Omit<Document, 'id' | 'uploaded_at'>): Promise<Document> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Activity log
export async function logActivity(data: {
  user_id: string;
  action: string;
  details: Record<string, any>;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('activity_log')
    .insert({
      user_id: data.user_id,
      action_type: data.action as ActivityType,
      details: data.details,
    });

  if (error) console.error('Activity log error:', error);
}

export async function getActivityLog(userId: string, limit = 100): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
