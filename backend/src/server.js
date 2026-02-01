import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import notesRouter from './routes/notes.js';
import remindersRouter from './routes/reminders.js';
import todosRouter from './routes/todos.js';
import vaultRouter from './routes/vault.js';
import documentsRouter from './routes/documents.js';
import testDbRouter from './routes/test-db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://memo-sphere.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Memorie Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/notes', notesRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/todos', todosRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/test-db', testDbRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
