// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      reminders: {
        Row: Reminder;
        Insert: Omit<Reminder, 'id' | 'created_at'>;
        Update: Partial<Omit<Reminder, 'id'>>;
      };
      todos: {
        Row: Todo;
        Insert: Omit<Todo, 'id' | 'created_at'>;
        Update: Partial<Omit<Todo, 'id'>>;
      };
      vault: {
        Row: VaultItem;
        Insert: Omit<VaultItem, 'id' | 'created_at'>;
        Update: Partial<Omit<VaultItem, 'id'>>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at'>;
        Update: Partial<Omit<Note, 'id'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<Document, 'id'>>;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'timestamp'>;
        Update: never;
      };
    };
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  likes?: string[];
  dislikes?: string[];
  theme?: 'light' | 'dark' | 'system';
  notifications_enabled?: boolean;
  timezone?: string;
  language?: string;
  custom_fields?: Record<string, any>;
}

// Reminder Types
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  datetime: string;
  repeat: RepeatType;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderStatus = 'pending' | 'completed' | 'cancelled';

// Todo Types
export interface Todo {
  id: string;
  user_id: string;
  task: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TodoStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

// Vault Types
export interface VaultItem {
  id: string;
  user_id: string;
  label: string;
  data_encrypted: string; // AES-256 encrypted JSON
  category: VaultCategory;
  created_at: string;
  updated_at: string;
}

export type VaultCategory = 'password' | 'card' | 'note' | 'identity' | 'other';

export interface VaultData {
  // Password fields
  username?: string;
  password?: string;
  url?: string;

  // Card fields
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;

  // Note fields
  note?: string;

  // Identity fields
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;

  // Common fields
  notes?: string;
  custom_fields?: Record<string, string>;
}

// Note Types
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Document Types
export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string | null;
  tags: string[];
  uploaded_at: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActivityType;
  details: Record<string, any>;
  timestamp: string;
}

export type ActivityType =
  | 'reminder_created'
  | 'reminder_completed'
  | 'todo_created'
  | 'todo_completed'
  | 'note_created'
  | 'note_updated'
  | 'document_uploaded'
  | 'vault_accessed'
  | 'preference_updated';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Notification Types
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Analytics Types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month';
  reminders: {
    created: number;
    completed: number;
    pending: number;
  };
  todos: {
    created: number;
    completed: number;
    in_progress: number;
  };
  notes: {
    created: number;
    updated: number;
    total: number;
  };
  documents: {
    uploaded: number;
    total_size: number;
  };
  activity: {
    total_actions: number;
    by_type: Record<ActivityType, number>;
  };
}
