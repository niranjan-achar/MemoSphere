import express from 'express';
import { createClient } from '../config/supabase.js';
import { getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// GET /api/todos - Get all todos for authenticated user
router.get('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient();
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(todos || []);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos - Create new todo
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, priority, status, due_date, category } = req.body;
    const supabase = createClient();
    
    const { data: todo, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title,
        description,
        priority: priority || 'medium',
        status: status || 'pending',
        due_date,
        category
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PATCH /api/todos/:id - Update todo
router.patch('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;
    const supabase = createClient();

    const { data: todo, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = createClient();

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
