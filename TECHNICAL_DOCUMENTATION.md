# LaunchLog - Technical Documentation

## Project Overview

LaunchLog is a full-stack career progress tracking application designed to help professionals manage their career development journey. The application serves as "a launchpad for your career, logs all progress" with comprehensive features for tracking goals, time management, job applications, and personal development metrics.

## Technology Stack

### Frontend
- **React 19.1.1** - Modern React with latest features and hooks
- **Vite 7.1.4** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework (loaded via CDN)
- **Font Awesome** - Icon library for consistent UI elements
- **Chart.js 4.5.0** - Data visualization for progress tracking
- **react-chartjs-2 5.3.0** - React wrapper for Chart.js
- **SortableJS 1.15.6** - Drag-and-drop functionality for task management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web application framework
- **MongoDB 6.19.0** - NoSQL database with MongoDB Atlas
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 3.0.2** - Password hashing
- **express-validator 7.2.1** - Input validation middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 17.2.2** - Environment variable management

## Architecture Overview

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│   Express API   │───▶│  MongoDB Atlas  │
│    (Port 5000)  │    │   (Port 3001)   │    │   (Cloud DB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Flow
1. **Initial Load**: App checks for existing JWT token in localStorage
2. **Cover Page**: Users see welcome screen with app features
3. **Authentication**: Registration/Login with email and password
4. **JWT Token**: Server generates secure token for authenticated sessions
5. **Protected Routes**: All API endpoints require valid JWT token

### Data Models

#### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed with bcrypt),
  name: String,
  role: String ('user' | 'admin'),
  createdAt: Date
}
```

#### User Data Schema
```javascript
{
  userId: String,
  timerSessions: [
    {
      id: String,
      duration: Number,
      startTime: Date,
      endTime: Date,
      description: String
    }
  ],
  tasks: {
    todo: [{ id: String, text: String, createdAt: Date }],
    doing: [{ id: String, text: String, createdAt: Date }],
    done: [{ id: String, text: String, createdAt: Date }]
  },
  jobs: [
    {
      id: String,
      company: String,
      position: String,
      status: String,
      applicationDate: Date,
      notes: String
    }
  ],
  dashboardData: {
    totalHours: Number,
    completedTasks: Number,
    activeApplications: Number,
    sessionsThisWeek: Number
  }
}
```

## Key Features

### 1. User Authentication
- **Registration**: Email/password with validation
- **Login**: Secure authentication with JWT
- **Admin System**: Special privileges for admin@launchlog.com
- **Session Management**: Persistent login state

### 2. Dashboard
- **Progress Metrics**: Visual charts showing career progress
- **Quick Stats**: Total hours, completed tasks, job applications
- **Recent Activity**: Timeline of user actions
- **Goal Tracking**: Visual progress indicators

### 3. Focus Timer
- **Pomodoro Timer**: Configurable work sessions
- **Session Tracking**: Historical data of focus sessions
- **Statistics**: Time analytics and patterns
- **Productivity Insights**: Weekly/monthly reports

### 4. Task Management
- **Kanban Board**: Todo, Doing, Done columns
- **Drag & Drop**: Intuitive task organization
- **Task Persistence**: All tasks saved to database
- **Progress Tracking**: Completion metrics

### 5. Job Application Tracker
- **Application Management**: Track job applications
- **Status Updates**: Application pipeline tracking
- **Company Database**: Store company information
- **Interview Scheduling**: Manage interview dates

### 6. Admin Panel
- **User Management**: View all registered users
- **System Statistics**: Platform usage metrics
- **Data Analytics**: User engagement insights
- **Admin Controls**: User administration tools

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Data
- `GET /api/user-data` - Fetch user's data
- `POST /api/timer-sessions` - Save timer session
- `PUT /api/tasks` - Update task lists
- `PUT /api/dashboard` - Update dashboard metrics

### Job Management
- `POST /api/jobs` - Create job application
- `PUT /api/jobs/:jobId` - Update job application
- `DELETE /api/jobs/:jobId` - Delete job application

### Admin Routes (Requires Admin Role)
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - System statistics
- `DELETE /api/admin/users/:userId` - Delete user

### Utility
- `DELETE /api/reset` - Reset all data (development)
- `GET /health` - Health check endpoint

## Security Features

### Authentication Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: 24-hour token lifetime
- **Protected Routes**: Middleware authentication on all protected endpoints

### Input Validation
- **Email Validation**: Email format validation
- **Password Requirements**: Minimum 6 characters
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Input sanitization

### Admin Security
- **Role-Based Access**: Admin-only routes protected
- **Admin Preservation**: Admin users cannot be deleted
- **Secure Admin Creation**: Automatic admin role for admin@launchlog.com

## Database Design

### Connection Strategy
- **Primary**: MongoDB Atlas cloud database
- **Fallback**: In-memory storage for development
- **Error Handling**: Graceful fallback on connection failures
- **Connection Pooling**: MongoDB native connection pooling

### Data Persistence
- **User Authentication**: Persistent user accounts
- **User Data**: All user interactions saved
- **Session Management**: Timer sessions tracked
- **Application State**: Complete app state persistence

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── Admin.jsx          # Admin panel interface
│   ├── Auth.jsx           # Login/registration forms
│   ├── Cover.jsx          # Welcome landing page
│   ├── Dashboard.jsx      # Main dashboard with metrics
│   ├── Jobs.jsx           # Job application tracker
│   ├── Plan.jsx           # Task management board
│   ├── Sidebar.jsx        # Navigation sidebar
│   └── Timer.jsx          # Focus timer component
├── hooks/
│   └── useData.js         # Custom hook for data management
├── utils/
│   └── api.js             # API utility functions
├── App.jsx                # Main application component
├── main.jsx               # React application entry point
└── index.css              # Global styles and CSS variables
```

### State Management
- **Local State**: React useState for component state
- **Custom Hooks**: useData hook for data fetching
- **Local Storage**: JWT token and user persistence
- **Context**: Implicit data flow through props

### UI/UX Design
- **Dark Theme**: Professional dark mode interface
- **Glassmorphism**: Modern backdrop blur effects
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects
- **Color Scheme**: Neon blue (#00f3ff) and purple (#9d4edd) accents

## Development Setup

### Environment Configuration
```env
PORT=3001
JWT_SECRET=your-secret-key-here-change-in-production
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/
```

### Development Commands
```bash
# Install dependencies
npm install

# Start development servers
npm run dev      # Frontend (Vite dev server)
npm run server   # Backend (Express server)
npm start        # Both servers concurrently

# Build for production
npm run build    # Create production build
npm run preview  # Preview production build
```

### Port Configuration
- **Frontend**: Port 5000 (Vite dev server)
- **Backend**: Port 3001 (Express server)
- **Proxy**: Frontend proxies `/api` requests to backend

## Deployment

### Production Build
1. **Frontend Build**: `npm run build` creates optimized static files
2. **Asset Optimization**: Vite optimizes and bundles all assets
3. **Environment Variables**: Configure production MongoDB URL
4. **Static Serving**: Express serves built React files

### Render Deployment
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`
- **Environment Variables**: Set MongoDB connection string
- **Health Checks**: `/health` endpoint for monitoring

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Vite automatic code splitting
- **Lazy Loading**: Component-level lazy loading
- **Asset Optimization**: Compressed images and fonts
- **CDN Usage**: External CDN for Tailwind CSS and Font Awesome

### Backend Optimization
- **Connection Pooling**: MongoDB connection reuse
- **Middleware Optimization**: Efficient request processing
- **Error Handling**: Graceful error responses
- **Database Indexing**: Optimized queries

## Testing Strategy

### Frontend Testing
- **Component Testing**: Test individual React components
- **Integration Testing**: Test component interactions
- **E2E Testing**: Full user flow testing
- **Accessibility Testing**: WCAG compliance

### Backend Testing
- **Unit Testing**: Test individual functions
- **API Testing**: Test all endpoints
- **Authentication Testing**: Security testing
- **Database Testing**: Data persistence testing

## Monitoring & Analytics

### Performance Monitoring
- **Response Times**: API endpoint performance
- **Error Rates**: Track application errors
- **User Metrics**: User engagement analytics
- **System Health**: Database connection status

### Business Metrics
- **User Registration**: Track new user signups
- **Feature Usage**: Monitor feature adoption
- **Session Duration**: User engagement time
- **Goal Completion**: Success metrics

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: No server-side session storage
- **Database Scaling**: MongoDB Atlas auto-scaling
- **CDN Integration**: Static asset distribution
- **Load Balancing**: Multiple server instances

### Vertical Scaling
- **Memory Optimization**: Efficient data structures
- **CPU Optimization**: Optimized algorithms
- **Database Optimization**: Query optimization
- **Caching Strategy**: Redis for session caching

## Troubleshooting Guide

### Common Issues
1. **MongoDB Connection**: Check connection string and network
2. **JWT Errors**: Verify token format and expiration
3. **CORS Issues**: Ensure proper CORS configuration
4. **Build Errors**: Check dependencies and Node.js version

### Debug Strategies
- **Console Logging**: Server and client-side logging
- **Network Tab**: Monitor API requests
- **Error Boundaries**: React error handling
- **Health Checks**: Monitor system status

This documentation provides comprehensive coverage of the LaunchLog application for technical interviews, system design discussions, and development onboarding.