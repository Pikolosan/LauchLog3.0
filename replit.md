# LaunchLog

## Overview

LaunchLog is a career progress tracking application that serves as "a launchpad for your career, logs all progress." It's a React-based single-page application built with modern web technologies, featuring a dark theme with neon accents and focusing on user experience through interactive dashboards and data visualization.

The application appears to be designed for professionals to track their career development, goals, and progress over time with visual analytics and an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19+ with Vite as the build tool and development server
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **UI Components**: Custom dark theme with neon blue (#00f3ff) and purple (#9d4edd) accents
- **Icons**: Font Awesome for consistent iconography
- **Build System**: Vite configured for hot module replacement and optimized production builds
- **Development Server**: Configured to run on port 5000 with proxy to backend API on port 3001

### Backend Architecture
- **Framework**: Express.js server providing REST API endpoints
- **Database**: MongoDB support with graceful fallback to in-memory storage when no connection string is provided
- **API Endpoints**: RESTful API for user data, timer sessions, tasks, jobs, and dashboard metrics
- **Development Server**: Runs on port 3001 with CORS enabled for frontend communication

### Data Visualization
- **Charts**: Chart.js with React integration via react-chartjs-2 for displaying career progress metrics
- **Interactive Elements**: SortableJS for drag-and-drop functionality, likely for organizing goals or tasks

### User Interface Design
- **Theme**: Dark mode interface with glassmorphism effects (backdrop blur, semi-transparent backgrounds)
- **Layout**: Sidebar navigation pattern with card-based content organization
- **Responsive Design**: Mobile-first approach with viewport-aware styling
- **Animations**: CSS transitions and hover effects for enhanced user experience

### Development Environment
- **Server Configuration**: Vite development server configured to run on port 5000
- **Hot Reload**: Automatic refresh during development for improved developer experience

## External Dependencies

### Core Libraries
- **React Ecosystem**: React 19.1.1 and React DOM for component-based UI development
- **Build Tools**: Vite 7.1.4 with React plugin for fast development and building

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework loaded via CDN
- **Font Awesome**: Icon library (both CDN and npm package versions)
- **Custom CSS**: Theme variables and component styling for consistent branding

### Data Visualization and Interaction
- **Chart.js 4.5.0**: Comprehensive charting library for progress visualization
- **react-chartjs-2 5.3.0**: React wrapper for Chart.js integration
- **SortableJS 1.15.6**: Drag-and-drop functionality for interactive lists

### Content Delivery
- **CDN Dependencies**: Tailwind CSS and Font Awesome loaded from external CDNs for faster initial load times
- **Static Assets**: Vite development server for serving application assets

The architecture prioritizes user experience with smooth animations, responsive design, and rich data visualization capabilities while maintaining a modern, professional aesthetic suitable for career tracking applications.