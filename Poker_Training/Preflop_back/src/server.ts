import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import pokerRoutes from './routes/poker.routes';
import authRoutes from './routes/auth.routes';
import progressionRoutes from './routes/progression.routes';
import { SocketService } from './services/socket.service';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Socket service
new SocketService(io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/poker', pokerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progression', progressionRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Poker Preflop Trainer API',
    version: '1.0.0',
    endpoints: {
      health: '/api/poker/health',
      analyze: 'POST /api/poker/analyze',
      auth: '/api/auth/*',
      progression: '/api/progression/*',
      multiplayer: 'Socket.io on /'
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/poker`);
  console.log(`🔐 Auth available at http://localhost:${PORT}/api/auth`);
  console.log(`🎮 Multiplayer Socket.io available at http://localhost:${PORT}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  Warning: ANTHROPIC_API_KEY not set in .env file');
  }
});

export default app;
