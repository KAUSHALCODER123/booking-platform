import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import Expert from './models/Expert';
import Booking from './models/Booking';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
  });
});


app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expertsDB';

mongoose.connect(MONGO_URI)
  .catch(() => {});

// Routes
app.get('/api/experts', async (req: Request, res: Response) => {
  try {
    const experts = await Expert.find({});
    res.json(experts);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching experts', error: error.message });
  }
});

app.get('/api/experts/:id', async (req: Request, res: Response) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    res.json(expert);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching expert', error: error.message });
  }
});

app.post('/api/bookings', async (req: Request, res: Response): Promise<any> => {
  try {
    const { expertId, userEmail, date, slot } = req.body;
    const newBooking = new Booking({ expertId, userEmail, date, slot });
    await newBooking.save();
    
    // Emit socket event to room
    io.to(expertId).emit('slot-booked', { date, slot });
    
    return res.status(201).json(newBooking);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Slot already taken' });
    }
    return res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

app.get('/api/bookings', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email query parameter is required and must be a string' });
    }
    const bookings = await Booking.find({ userEmail: email }).populate('expertId', 'name expertise');
    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

app.patch('/api/bookings/:id/status', async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    return res.json(updatedBooking);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
});

import { NextFunction } from 'express';
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

server.listen(PORT);
