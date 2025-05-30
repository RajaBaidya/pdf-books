import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';

// Load env vars
dotenv.config();

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware
// app.use(cors());
// Add this CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'your-vercel-frontend-url.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully'))
  .catch(err => console.log('MongoDB Atlas connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 