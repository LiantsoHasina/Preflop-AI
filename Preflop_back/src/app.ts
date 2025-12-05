import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Preflop_back API' });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;
