const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'LaunchLog API is running' });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
let isConnected = false;
let client = null;

// Only create MongoDB client if connection string is provided
if (process.env.MONGODB_CONNECTION_STRING) {
  client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    }
  });
}

async function connectToDatabase() {
  if (!client) {
    console.log('⚠️ No MongoDB connection string provided - running in fallback mode');
    console.log('⚠️ Data will not persist between server restarts');
    isConnected = false;
    return;
  }

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

// Authentication Routes

// Register user
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    if (isConnected) {
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
    } else {
      // Check fallback storage
      const existingUser = fallbackUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };

    let userId;
    if (isConnected) {
      const result = await db.collection('users').insertOne(newUser);
      userId = result.insertedId.toString();
    } else {
      userId = Date.now().toString();
      newUser.id = userId;
      fallbackUsers.push(newUser);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    let user;
    if (isConnected) {
      user = await db.collection('users').findOne({ email });
    } else {
      user = fallbackUsers.find(u => u.email === email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const userId = user.id || user._id.toString();
    const token = jwt.sign(
      { userId, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: userId, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes

// In-memory fallback storage for users
let fallbackUsers = [];

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
app.get('/api/user-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!isConnected) {
      // Return user-specific fallback data
      if (!fallbackData[userId]) {
        fallbackData[userId] = {
          userId,
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
      }
      return res.json(fallbackData[userId]);
    }

    const userData = await db.collection('userData').findOne({ userId });
    if (!userData) {
      const defaultData = {
        userId,
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
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Save timer session
app.post('/api/timer-sessions', authenticateToken, async (req, res) => {
  try {
    const { session } = req.body;
    const userId = req.user.userId;
    
    if (!isConnected) {
      if (!fallbackData[userId]) {
        fallbackData[userId] = { 
          userId, 
          timerSessions: [], 
          tasks: { todo: [], doing: [], done: [] }, 
          jobs: [], 
          dashboardData: { totalHours: 0, completedTasks: 0, activeApplications: 0, sessionsThisWeek: 0 } 
        };
      }
      fallbackData[userId].timerSessions.push(session);
      return res.json({ success: true, fallback: true });
    }

    await db.collection('userData').updateOne(
      { userId },
      { 
        $push: { timerSessions: session },
        $setOnInsert: { userId }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving timer session:', error);
    const userId = req.user.userId;
    if (!fallbackData[userId]) {
      fallbackData[userId] = { 
        userId, 
        timerSessions: [], 
        tasks: { todo: [], doing: [], done: [] }, 
        jobs: [], 
        dashboardData: { totalHours: 0, completedTasks: 0, activeApplications: 0, sessionsThisWeek: 0 } 
      };
    }
    fallbackData[userId].timerSessions.push(session);
    res.json({ success: true, fallback: true });
  }
});

// Update tasks
app.put('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.user.userId;
    
    if (!isConnected) {
      if (!fallbackData[userId]) {
        fallbackData[userId] = { 
          userId, 
          timerSessions: [], 
          tasks: { todo: [], doing: [], done: [] }, 
          jobs: [], 
          dashboardData: { totalHours: 0, completedTasks: 0, activeApplications: 0, sessionsThisWeek: 0 } 
        };
      }
      fallbackData[userId].tasks = tasks;
      return res.json({ success: true, fallback: true });
    }

    await db.collection('userData').updateOne(
      { userId },
      { 
        $set: { tasks },
        $setOnInsert: { userId }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating tasks:', error);
    const userId = req.user.userId;
    if (!fallbackData[userId]) {
      fallbackData[userId] = { 
        userId, 
        timerSessions: [], 
        tasks: { todo: [], doing: [], done: [] }, 
        jobs: [], 
        dashboardData: { totalHours: 0, completedTasks: 0, activeApplications: 0, sessionsThisWeek: 0 } 
      };
    }
    fallbackData[userId].tasks = tasks;
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