# LaunchLog - Render Deployment Guide

## Prerequisites
- Render account (free tier available)
- GitHub repository with your code
- MongoDB Atlas database (free tier available)

## Deployment Steps

### 1. Prepare Your Repository
Ensure your repository has:
- ✅ `package.json` with proper scripts and Node.js version
- ✅ Server configured to serve React build files in production
- ✅ Environment variables properly configured
- ✅ Build command that creates production assets

### 2. Create Web Service on Render

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (usually `main`)

3. **Configure Service Settings**
   ```
   Name: launchlog-app (or your preferred name)
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: . (leave empty if root)
   
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### 3. Environment Variables

In the Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
```

**Important**: Replace the MongoDB connection string with your actual credentials.

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build your React app
   - Start your Express server
3. Monitor the build progress in the **Events** tab
4. Your app will be available at `https://your-app-name.onrender.com`

## Configuration Details

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "server": "node server.js",
    "start": "node server.js",
    "build": "vite build",
    "preview": "vite preview"
  },
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  }
}
```

### Server Configuration
The server is configured to:
- Serve React build files from `/dist` in production
- Handle React Router with catch-all route `/*`
- Use environment variables for configuration
- Bind to `0.0.0.0` (required for Render)
- Use port from `process.env.PORT` (required for Render)

### Production Features
- ✅ Static file serving for React app
- ✅ API routes prefixed with `/api`
- ✅ React Router support with catch-all handler
- ✅ Environment-based configuration
- ✅ MongoDB Atlas integration
- ✅ CORS properly configured
- ✅ Health check endpoint at `/health`

## MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/atlas
   - Create free account

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users

3. **Configure Access**
   - Database Access: Create user with read/write permissions
   - Network Access: Allow access from anywhere (0.0.0.0/0)

4. **Get Connection String**
   - Go to "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>` with your values

## Domain and SSL

Render provides:
- ✅ Free SSL certificate
- ✅ Custom subdomain (your-app.onrender.com)
- ✅ Optional custom domain support (paid plans)

## Monitoring and Logs

- **Logs**: Available in Render dashboard under "Logs" tab
- **Health Check**: App includes `/health` endpoint for monitoring
- **Auto-deploy**: Automatically deploys on every push to connected branch

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version in `package.json`
   - Verify all dependencies are in `package.json`
   - Check build logs for specific errors

2. **App Won't Start**
   - Ensure server binds to `0.0.0.0` and uses `process.env.PORT`
   - Check that start command is `node server.js`
   - Verify environment variables are set

3. **Database Connection Fails**
   - Verify MongoDB connection string
   - Check MongoDB Atlas network settings
   - Ensure database user has proper permissions

4. **React Routes Don't Work**
   - Verify catch-all route is implemented
   - Check that static files are served correctly
   - Ensure build files are in correct directory

### Debug Commands

Check build output:
```bash
npm run build
ls -la dist/
```

Test production server locally:
```bash
NODE_ENV=production npm start
```

### Performance Tips

1. **Enable Gzip**: Render automatically enables gzip compression
2. **Asset Optimization**: Vite automatically optimizes assets
3. **CDN**: Use CDN for external libraries (already configured)
4. **Database Indexing**: Add indexes to MongoDB for better performance

## Cost Considerations

- **Render Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **MongoDB Atlas Free Tier**: 512MB storage, no time limits
- **Upgrade Options**: Paid plans available for production workloads

## Support

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Application Health**: Monitor via `/health` endpoint

Your LaunchLog application will be live and accessible to users worldwide once deployed to Render!