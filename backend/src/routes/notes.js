import express from 'express';
import { createClient } from '../config/supabase.js';
import { getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// GET /api/notes - Get all notes for authenticated user
router.get('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient();
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(notes || []);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes - Create new note
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content, tags } = req.body;
    const supabase = createClient();
    
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content,
        tags: tags || []
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PATCH /api/notes/:id - Update note
router.patch('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;
    const supabase = createClient();

    const { data: note, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = createClient();

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
