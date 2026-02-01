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
        .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.json(documents || []);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents - Upload new document
// This expects multipart/form-data with a file
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

      // Handle both JSON body and form data
      const { name, file_name, file_url, file_type, file_size, category, tags } = req.body;

    const supabase = createClient();
    
      // Create document record
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
          file_name: file_name || name,
          file_url: file_url || '',
          file_type: file_type || 'application/octet-stream',
          file_size: file_size || 0,
          category: category || null,
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : []
      })
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            throw error;
        }

        res.status(201).json(document);
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: error.message || 'Failed to create document' });
    }
});

// POST /api/documents/upload - Upload file to Supabase Storage
router.post('/upload', async (req, res) => {
    try {
        const { user, error: authError } = await getUserFromToken(req.headers.authorization);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // This endpoint receives base64 encoded file data
        const { fileName, fileData, mimeType, fileSize, category, tags } = req.body;

        if (!fileName || !fileData) {
            return res.status(400).json({ error: 'fileName and fileData are required' });
        }

        const supabase = createClient();

        // Decode base64 file data
        const buffer = Buffer.from(fileData, 'base64');

        // Generate unique file path
        const timestamp = Date.now();
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user.id}/${timestamp}_${safeName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, buffer, {
                contentType: mimeType || 'application/octet-stream',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        // Create document record
        const { data: document, error: dbError } = await supabase
            .from('documents')
            .insert({
                user_id: user.id,
                file_name: fileName,
                file_url: urlData.publicUrl,
                file_type: mimeType || 'application/octet-stream',
                file_size: fileSize || buffer.length,
                category: category || null,
        tags: tags || []
      })
      .select()
      .single();

        if (dbError) {
            // Try to clean up uploaded file
            await supabase.storage.from('documents').remove([filePath]);
            throw dbError;
        }

        res.status(201).json(document);
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload document' });
    }
});

// GET /api/documents/:id - Get single document
router.get('/:id', async (req, res) => {
    try {
        const { user, error: authError } = await getUserFromToken(req.headers.authorization);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const supabase = createClient();

        const { data: document, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

    if (error) throw error;

      if (!document) {
          return res.status(404).json({ error: 'Document not found' });
      }

      res.json(document);
  } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
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

      // Get document to find file URL
    const { data: document } = await supabase
      .from('documents')
        .select('file_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

      if (document?.file_url) {
          // Extract file path from URL and delete from storage
          try {
              const url = new URL(document.file_url);
              const pathParts = url.pathname.split('/documents/');
              if (pathParts.length > 1) {
                  const filePath = decodeURIComponent(pathParts[1]);
                  await supabase.storage.from('documents').remove([filePath]);
              }
          } catch (e) {
              console.error('Error deleting file from storage:', e);
              // Continue with document deletion even if storage delete fails
          }
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
