import express from 'express';
import { createClient } from '../config/supabase.js';
import { getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// GET /api/documents - Get all documents for authenticated user
router.get('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient();
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(documents || []);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents - Upload new document
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, file_path, file_size, mime_type, tags } = req.body;
    const supabase = createClient();
    
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name,
        description,
        file_path,
        file_size,
        mime_type,
        tags: tags || []
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// PATCH /api/documents/:id - Update document metadata
router.patch('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;
    const supabase = createClient();

    const { data: document, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id - Delete document and file
router.delete('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = createClient();

    // Get document to find file path
    const { data: document } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (document?.file_path) {
      // Delete file from storage
      await supabase.storage.from('documents').remove([document.file_path]);
    }

    // Delete document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
