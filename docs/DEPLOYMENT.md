# Deployment Guide

Deployment instructions for Smart Navigator application

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker & Docker Compose installed
- MongoDB Atlas connection string
- Environment variables configured

#### Steps
1. **Build and run containers:**
```bash
# Build and start all services
docker-compose up --build

# Run in background (production)
docker-compose up -d --build
```

2. **Environment Configuration:**
Create `.env` file with production values:
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_jwt_secret
PORT=5000
FRONTEND_URL=https://your-domain.com
```

3. **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### Option 2: Cloud Platform Deployment

#### Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend/
vercel --prod
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

#### Heroku (Backend)
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create smart-navigator-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_connection_string
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

#### Railway (Full Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

---

### Option 3: VPS Deployment

#### Prerequisites
- Ubuntu/Debian VPS
- Node.js 18+ installed
- Nginx installed
- PM2 process manager

#### Steps

1. **Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

2. **Deploy Application:**
```bash
# Clone repository
git clone https://github.com/your-username/SmartNavigator.git
cd SmartNavigator

# Install dependencies
npm run install:all

# Build frontend
cd frontend && npm run build && cd ..

# Start backend with PM2
pm2 start backend/server.js --name "smart-navigator-api"

# Serve frontend with Nginx
sudo cp -r frontend/dist/* /var/www/html/
```

3. **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Security Considerations

### Environment Variables
- **Never commit `.env` files**
- Use strong JWT secrets (64+ characters)
- Configure CORS for your domain only
- Use HTTPS in production

### Database Security
```javascript
// backend/config/database.js - Production settings
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
  ssl: true,
  retryWrites: true,
  w: 'majority'
};
```

### Frontend Security
```typescript
// frontend/src/config/api.ts - Production settings
export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:5000/api',
  withCredentials: true, // For HTTP-only cookies
  timeout: 10000
};
```

---

## 📊 Monitoring & Health Checks

### PM2 Monitoring
```bash
# Monitor applications
pm2 monit

# View logs
pm2 logs smart-navigator-api

# Restart application
pm2 restart smart-navigator-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### Health Check Endpoints
```javascript
// backend/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});
```

### Database Connection Check
```bash
# Test MongoDB connection
curl -X GET https://your-api-domain.com/api/health/db
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm run install:all
          
      - name: Run tests
        run: |
          npm run test:backend
          npm run test:frontend
          
      - name: Build frontend
        run: |
          cd frontend && npm run build
          
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /path/to/your/app
            git pull origin main
            npm run install:all
            cd frontend && npm run build
            pm2 restart smart-navigator-api
```

---

## 🧪 Testing Deployment

### Production Checklist
- [ ] Frontend builds without errors
- [ ] Backend starts successfully
- [ ] Database connection works
- [ ] Authentication flow functional
- [ ] API endpoints respond correctly
- [ ] Maps load properly
- [ ] SSL certificate valid (HTTPS)
- [ ] CORS configured correctly
- [ ] Error logging working
- [ ] Performance acceptable

### Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://your-api-domain.com/api/locations
```

---

## 🆘 Troubleshooting

### Common Issues

**Frontend not loading:**
- Check Nginx configuration
- Verify build files exist
- Check browser console for errors

**API not responding:**
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs smart-navigator-api`
- Test direct connection: `curl http://localhost:5000/api/health`

**Database connection failed:**
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Test connection from server

**Authentication not working:**
- Verify JWT secret matches
- Check cookie settings (secure, sameSite)
- Ensure CORS allows credentials

### Monitoring Commands
```bash
# System resources
htop
df -h
free -m

# Application logs
pm2 logs --lines 50
sudo tail -f /var/log/nginx/error.log

# Network connectivity
netstat -tulpn | grep :5000
curl -I https://your-domain.com
```
