import express from 'express';
import CryptoJS from 'crypto-js';
import { createClient } from '../config/supabase.js';
import { getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// Get encryption secret with fallback
const getEncryptionSecret = () => {
    return process.env.ENCRYPTION_SECRET || 'memosphere-default-secret-key-2024';
};

// In-memory PIN storage (fallback if vault_settings table doesn't exist)
const userPins = new Map();

// Helper to hash PIN
const hashPin = (pin) => {
    return CryptoJS.SHA256(pin + getEncryptionSecret()).toString();
};

// GET /api/vault/pin - Check if user has a PIN set
router.get('/pin', async (req, res) => {
    try {
        const { user, error: authError } = await getUserFromToken(req.headers.authorization);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // First check in-memory storage
        if (userPins.has(user.id)) {
            return res.json({ hasPin: true });
        }

        const supabase = createClient();

        // Try to check vault_settings table for PIN
        try {
            const { data: settings } = await supabase
                .from('vault_settings')
                .select('pin_hash')
                .eq('user_id', user.id)
                .single();

            const hasPin = settings?.pin_hash ? true : false;
            return res.json({ hasPin });
        } catch (dbError) {
            // Table might not exist, return false
            console.log('vault_settings table check failed, using fallback:', dbError.message);
            return res.json({ hasPin: false });
        }
    } catch (error) {
        console.error('Check PIN status error:', error);
        res.json({ hasPin: false });
    }
});

// POST /api/vault/pin - Set a new PIN
router.post('/pin', async (req, res) => {
    try {
        const { user, error: authError } = await getUserFromToken(req.headers.authorization);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { pin } = req.body;

        if (!pin || pin.length < 4) {
            return res.status(400).json({ error: 'PIN must be at least 4 digits' });
        }

        const pinHash = hashPin(pin);

        // Always store in memory as primary/fallback
        userPins.set(user.id, pinHash);

        // Try to store in database too
        try {
            const supabase = createClient();
            await supabase
                .from('vault_settings')
                .upsert({
                    user_id: user.id,
                    pin_hash: pinHash,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        } catch (dbError) {
            console.log('Could not save PIN to database, using in-memory storage:', dbError.message);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Set PIN error:', error);
        res.status(500).json({ error: 'Failed to set PIN' });
    }
});

// PUT /api/vault/pin - Verify PIN
router.put('/pin', async (req, res) => {
    try {
        const { user, error: authError } = await getUserFromToken(req.headers.authorization);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ error: 'PIN is required' });
        }

        const pinHash = hashPin(pin);

        // Check in-memory first
        if (userPins.has(user.id)) {
            const valid = userPins.get(user.id) === pinHash;
            return res.json({ valid });
        }

        // Then check database
        try {
            const supabase = createClient();
            const { data: settings } = await supabase
                .from('vault_settings')
                .select('pin_hash')
                .eq('user_id', user.id)
                .single();

            const valid = settings?.pin_hash === pinHash;

            // Cache in memory for future checks
            if (settings?.pin_hash) {
                userPins.set(user.id, settings.pin_hash);
            }

            return res.json({ valid });
        } catch (dbError) {
            console.log('Could not verify PIN from database:', dbError.message);
            return res.json({ valid: false });
        }
    } catch (error) {
        console.error('Verify PIN error:', error);
        res.status(500).json({ error: 'Failed to verify PIN' });
    }
});

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

      if (error) {
          console.error('Get vault items DB error:', error);
          throw error;
      }

    res.json(items || []);
  } catch (error) {
    console.error('Get vault items error:', error);
      res.status(500).json({ error: 'Failed to fetch vault items', details: error.message });
  }
});

// POST /api/vault - Create new vault item (encrypted)
router.post('/', async (req, res) => {
  try {
    const { user, error: authError } = await getUserFromToken(req.headers.authorization);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

      const { label, data, category } = req.body;

      if (!label) {
          return res.status(400).json({ error: 'Label is required' });
      }

      // Encrypt the data
      const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify(data || {}),
          getEncryptionSecret()
    ).toString();

    const supabase = createClient();
    const { data: item, error } = await supabase
      .from('vault')
      .insert({
        user_id: user.id,
          label,
          data_encrypted: encryptedData,
          category: category || 'other'
      })
      .select()
      .single();

      if (error) {
          console.error('Create vault item DB error:', error);
          throw error;
      }

    res.status(201).json(item);
  } catch (error) {
    console.error('Create vault item error:', error);
      res.status(500).json({ error: 'Failed to create vault item', details: error.message });
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
        .select('data_encrypted')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

      if (error) {
          console.error('Get vault item for decrypt DB error:', error);
          throw error;
      }

      if (!item) {
          return res.status(404).json({ error: 'Vault item not found' });
      }

    // Decrypt content
      try {
          const decryptedBytes = CryptoJS.AES.decrypt(
              item.data_encrypted,
              getEncryptionSecret()
          );
          const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

          if (!decryptedString) {
              throw new Error('Decryption resulted in empty string');
          }

        const decryptedData = JSON.parse(decryptedString);
        res.json(decryptedData);
    } catch (decryptError) {
        console.error('Decryption error:', decryptError);
        res.status(500).json({ error: 'Failed to decrypt data - encryption key may have changed' });
    }
  } catch (error) {
    console.error('Decrypt vault item error:', error);
      res.status(500).json({ error: 'Failed to decrypt vault item', details: error.message });
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
      const { label, data, category } = req.body;
    const supabase = createClient();

      const updates = {};
      if (label) updates.label = label;
      if (category) updates.category = category;
    
      // Re-encrypt data if provided
      if (data) {
          updates.data_encrypted = CryptoJS.AES.encrypt(
              JSON.stringify(data),
              getEncryptionSecret()
      ).toString();
    }

      updates.updated_at = new Date().toISOString();

    const { data: item, error } = await supabase
      .from('vault')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

      if (error) {
          console.error('Update vault item DB error:', error);
          throw error;
      }

    res.json(item);
  } catch (error) {
    console.error('Update vault item error:', error);
      res.status(500).json({ error: 'Failed to update vault item', details: error.message });
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

      if (error) {
          console.error('Delete vault item DB error:', error);
          throw error;
      }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete vault item error:', error);
      res.status(500).json({ error: 'Failed to delete vault item', details: error.message });
  }
});

export default router;
