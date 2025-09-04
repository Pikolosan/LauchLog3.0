const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'LaunchLog API is running' });
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
let isConnected = false;
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    db = client.db('launchlog');
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️ Running in fallback mode - data will not persist');
    isConnected = false;
  }
}

// API Routes

// In-memory fallback storage
let fallbackData = {
  userId: 'default',
  timerSessions: [],
  tasks: { todo: [], doing: [], done: [] },
  jobs: [],
  dashboardData: {
    totalHours: 0,
    completedTasks: 0,
    activeApplications: 0,
    sessionsThisWeek: 0
  }
};

// Get user data
app.get('/api/user-data', async (req, res) => {
  try {
    if (!isConnected) {
      return res.json(fallbackData);
    }

    const userData = await db.collection('userData').findOne({ userId: 'default' });
    if (!userData) {
      const defaultData = {
        userId: 'default',
        timerSessions: [],
        tasks: { todo: [], doing: [], done: [] },
        jobs: [],
        dashboardData: {
          totalHours: 0,
          completedTasks: 0,
          activeApplications: 0,
          sessionsThisWeek: 0
        }
      };
      res.json(defaultData);
    } else {
      res.json(userData);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.json(fallbackData);
  }
});

// Save timer session
app.post('/api/timer-sessions', async (req, res) => {
  try {
    const { session } = req.body;
    
    if (!isConnected) {
      fallbackData.timerSessions.push(session);
      return res.json({ success: true, fallback: true });
    }

    await db.collection('userData').updateOne(
      { userId: 'default' },
      { 
        $push: { timerSessions: session },
        $setOnInsert: { userId: 'default' }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving timer session:', error);
    fallbackData.timerSessions.push(session);
    res.json({ success: true, fallback: true });
  }
});

// Update tasks
app.put('/api/tasks', async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!isConnected) {
      fallbackData.tasks = tasks;
      return res.json({ success: true, fallback: true });
    }

    await db.collection('userData').updateOne(
      { userId: 'default' },
      { 
        $set: { tasks },
        $setOnInsert: { userId: 'default' }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating tasks:', error);
    fallbackData.tasks = tasks;
    res.json({ success: true, fallback: true });
  }
});

// Save job application
app.post('/api/jobs', async (req, res) => {
  try {
    const { job } = req.body;
    
    if (!isConnected) {
      fallbackData.jobs.push(job);
      return res.json({ success: true, fallback: true });
    }

    await db.collection('userData').updateOne(
      { userId: 'default' },
      { 
        $push: { jobs: job },
        $setOnInsert: { userId: 'default' }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving job:', error);
    fallbackData.jobs.push(job);
    res.json({ success: true, fallback: true });
  }
});

// Update job application
app.put('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { updatedJob } = req.body;
    
    if (!isConnected) {
      const jobIndex = fallbackData.jobs.findIndex(job => job.id === jobId);
      if (jobIndex !== -1) {
        fallbackData.jobs[jobIndex] = updatedJob;
      }
      return res.json({ success: true, fallback: true });
    }
    
    await db.collection('userData').updateOne(
      { userId: 'default', 'jobs.id': jobId },
      { $set: { 'jobs.$': updatedJob } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    const jobIndex = fallbackData.jobs.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      fallbackData.jobs[jobIndex] = updatedJob;
    }
    res.json({ success: true, fallback: true });
  }
});

// Delete job application
app.delete('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!isConnected) {
      fallbackData.jobs = fallbackData.jobs.filter(job => job.id !== jobId);
      return res.json({ success: true, fallback: true });
    }
    
    await db.collection('userData').updateOne(
      { userId: 'default' },
      { $pull: { jobs: { id: jobId } } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    fallbackData.jobs = fallbackData.jobs.filter(job => job.id !== jobId);
    res.json({ success: true, fallback: true });
  }
});

// Update dashboard data
app.put('/api/dashboard', async (req, res) => {
  try {
    const { dashboardData } = req.body;
    
    if (!isConnected) {
      fallbackData.dashboardData = dashboardData;
      return res.json({ success: true, fallback: true });
    }
    
    await db.collection('userData').updateOne(
      { userId: 'default' },
      { 
        $set: { dashboardData },
        $setOnInsert: { userId: 'default' }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    fallbackData.dashboardData = dashboardData;
    res.json({ success: true, fallback: true });
  }
});

// Reset all data
app.delete('/api/reset', async (req, res) => {
  try {
    fallbackData = {
      userId: 'default',
      timerSessions: [],
      tasks: { todo: [], doing: [], done: [] },
      jobs: [],
      dashboardData: { totalHours: 0, completedTasks: 0, activeApplications: 0, sessionsThisWeek: 0 }
    };
    
    if (isConnected) {
      await db.collection('userData').deleteOne({ userId: 'default' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.json({ success: true, fallback: true });
  }
});

// Start server
connectToDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});