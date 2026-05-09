import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expert from './models/Expert';

dotenv.config();

// Use a local DB for development
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expertsDB';

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Expert.deleteMany({});

    const experts = [
      {
        name: 'Dr. Alice Smith',
        expertise: 'Machine Learning',
        bio: 'Over 10 years of experience in AI and deep learning. Has published multiple papers.',
        availableSlots: ['Monday 10:00 AM', 'Wednesday 2:00 PM', 'Friday 4:00 PM']
      },
      {
        name: 'Bob Johnson',
        expertise: 'Full Stack Development',
        bio: 'Specializes in MERN stack. Built enterprise applications for Fortune 500 companies.',
        availableSlots: ['Tuesday 9:00 AM', 'Thursday 11:00 AM']
      },
      {
        name: 'Carol Williams',
        expertise: 'Cloud Architecture',
        bio: 'AWS Certified Solutions Architect with a passion for serverless architectures.',
        availableSlots: ['Monday 1:00 PM', 'Thursday 3:00 PM', 'Friday 10:00 AM']
      }
    ];

    await Expert.insertMany(experts);
  } catch (error) {
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
