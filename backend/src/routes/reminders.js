import express from 'express';
import { createClient } from '../config/supabase.js';
import { getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// GET /api/reminders - Get all reminders for authenticated user
router.get('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient();
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('datetime', { ascending: true });

    if (error) throw error;

    res.json(reminders || []);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST /api/reminders - Create new reminder
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, datetime, repeat_interval, notification_enabled } = req.body;
    const supabase = createClient();
    
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        title,
        description,
        datetime,
        repeat_interval: repeat_interval || 'none',
        notification_enabled: notification_enabled !== false,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// PATCH /api/reminders/:id - Update reminder
router.patch('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;
    const supabase = createClient();

    const { data: reminder, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = createClient();

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;
