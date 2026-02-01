import express from 'express';
import { createClient } from '../config/supabase.js';

const router = express.Router();

// GET /api/test-db - Test database connection
router.get('/', async (req, res) => {
  try {
    const supabase = createClient();
    
    // Test query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;

    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

export default router;
