import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import { initSocket } from './socket/socket';

const app = express();
const PORT = process.env.PORT || 5002;

// HTTP server — Socket.io needs this instead of app.listen
const httpServer = createServer(app);

// Socket.io server attached to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin:'*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🟢 Chat API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Init Socket.io
initSocket(io);

httpServer.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});