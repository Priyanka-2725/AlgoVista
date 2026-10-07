import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:9002', 'http://127.0.0.1:9002', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Allow frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algovista';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

import todoRoutes from './routes/todos';
import dashboardRoutes from './routes/dashboard';
import learningRoutes from './routes/learning';
import userRoutes from './routes/user';
import aiMentorRoutes from './routes/aiMentor';
import mockInterviewRoutes from './routes/mockInterview';
import arenaRoutes from './routes/arena';
import leaderboardRoutes from './routes/leaderboard';

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-mentor', aiMentorRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/leaderboard', leaderboardRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
