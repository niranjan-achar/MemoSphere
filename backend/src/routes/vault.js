import express from 'express';
import CryptoJS from 'crypto-js';
import { createClient } from '../config/supabase.js';
import { getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// GET /api/vault - Get all vault items for authenticated user
router.get('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient();
    const { data: items, error } = await supabase
      .from('vault')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(items || []);
  } catch (error) {
    console.error('Get vault items error:', error);
    res.status(500).json({ error: 'Failed to fetch vault items' });
  }
});

// POST /api/vault - Create new vault item (encrypted)
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content, category } = req.body;
    
    // Encrypt content
    const encryptedContent = CryptoJS.AES.encrypt(
      content,
      process.env.ENCRYPTION_SECRET
    ).toString();

    const supabase = createClient();
    const { data: item, error } = await supabase
      .from('vault')
      .insert({
        user_id: user.id,
        title,
        encrypted_content: encryptedContent,
        category
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(item);
  } catch (error) {
    console.error('Create vault item error:', error);
    res.status(500).json({ error: 'Failed to create vault item' });
  }
});

// POST /api/vault/:id/decrypt - Decrypt vault item content
router.post('/:id/decrypt', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = createClient();

    const { data: item, error } = await supabase
      .from('vault')
      .select('encrypted_content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    // Decrypt content
    const decryptedContent = CryptoJS.AES.decrypt(
      item.encrypted_content,
      process.env.ENCRYPTION_SECRET
    ).toString(CryptoJS.enc.Utf8);

    res.json({ content: decryptedContent });
  } catch (error) {
    console.error('Decrypt vault item error:', error);
    res.status(500).json({ error: 'Failed to decrypt vault item' });
  }
});

// PATCH /api/vault/:id - Update vault item
router.patch('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, content, category } = req.body;
    const supabase = createClient();

    const updates = { title, category };
    
    // Re-encrypt content if provided
    if (content) {
      updates.encrypted_content = CryptoJS.AES.encrypt(
        content,
        process.env.ENCRYPTION_SECRET
      ).toString();
    }

    const { data: item, error } = await supabase
      .from('vault')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(item);
  } catch (error) {
    console.error('Update vault item error:', error);
    res.status(500).json({ error: 'Failed to update vault item' });
  }
});

// DELETE /api/vault/:id - Delete vault item
router.delete('/:id', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const supabase = createClient();

    const { error } = await supabase
      .from('vault')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete vault item error:', error);
    res.status(500).json({ error: 'Failed to delete vault item' });
  }
});

export default router;
