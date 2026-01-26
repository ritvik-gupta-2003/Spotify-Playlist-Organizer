# Heroku Deployment Guide

## Overview
This project has two Heroku apps:
- **Backend**: `spotify-playlist-backend-a0e8b9eecd59`
- **Frontend**: `spotify-playlist-frontend-a5d3c1ff5ab9`

## Method 1: Manual Deployment (Git Push)

### Initial Setup (One-time)

1. **Add Heroku remotes** (if not already added):
```bash
# For backend
heroku git:remote -a spotify-playlist-backend-a0e8b9eecd59
git remote rename heroku heroku-backend

# For frontend
heroku git:remote -a spotify-playlist-frontend-a5d3c1ff5ab9
git remote rename heroku heroku-frontend
```

2. **Deploy Backend**:
```bash
cd backend
git subtree push --prefix backend heroku-backend main
# OR if using separate branch:
git push heroku-backend main:main
```

3. **Deploy Frontend**:
```bash
cd frontend
git subtree push --prefix frontend heroku-frontend main
# OR if using separate branch:
git push heroku-frontend main:main
```

### Regular Deployment Workflow

1. **Commit your changes**:
```bash
git add .
git commit -m "Your commit message"
```

2. **Push to GitHub**:
```bash
git push origin main
```

3. **Deploy to Heroku**:
```bash
# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy frontend
git subtree push --prefix frontend heroku-frontend main
```

## Method 2: Auto-Deploy from GitHub (Recommended)

### Prerequisites: Configure Buildpacks for Monorepo

**IMPORTANT**: Before enabling auto-deploy, you must configure Heroku to use subdirectory buildpacks. Run the setup script:

```powershell
.\setup-heroku-autodeploy.ps1
```

This script will:
- Configure the subdirectory buildpack for both apps
- Set the `PROJECT_PATH` config var to point to the correct subdirectory
- Set up the correct buildpack order

### Manual Setup (Alternative)

If you prefer to configure manually:

**Backend**:
```powershell
heroku buildpacks:clear -a spotify-playlist-backend-a0e8b9eecd59
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a spotify-playlist-backend-a0e8b9eecd59
heroku buildpacks:add heroku/python -a spotify-playlist-backend-a0e8b9eecd59
heroku config:set PROJECT_PATH=backend -a spotify-playlist-backend-a0e8b9eecd59
```

**Frontend**:
```powershell
heroku buildpacks:clear -a spotify-playlist-frontend-a5d3c1ff5ab9
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a spotify-playlist-frontend-a5d3c1ff5ab9
heroku buildpacks:add heroku/nodejs -a spotify-playlist-frontend-a5d3c1ff5ab9
heroku config:set PROJECT_PATH=frontend -a spotify-playlist-frontend-a5d3c1ff5ab9
```

### Enable Auto-Deploy

1. **Login to Heroku Dashboard**:
   - Go to https://dashboard.heroku.com
   - Select your app (backend or frontend)

2. **Enable GitHub Integration**:
   - Click on the **"Deploy"** tab
   - Under **"Deployment method"**, select **"GitHub"**
   - Connect your GitHub account if not already connected
   - Search for repository: `ritvik-gupta-2003/Spotify-Playlist-Organizer`
   - Click **"Connect"**

3. **Configure Auto-Deploy**:
   - Enable **"Wait for CI to pass before deploy"** (optional)
   - Enable **"Enable Automatic Deploys"**
   - Select branch: `main`
   - Click **"Enable Automatic Deploys"**

4. **Repeat for the other app**:
   - Do the same steps for the other Heroku app (backend/frontend)

### How It Works

The `subdir-heroku-buildpack` buildpack:
- Changes the working directory to the subdirectory specified in `PROJECT_PATH`
- Then runs the language-specific buildpack (Python/Node.js) in that directory
- This allows Heroku to find `requirements.txt` and `package.json` in the correct location

## Method 3: Using Git Subtree (Recommended for Monorepo)

### Setup Script

Create a deployment script `deploy.sh`:

```bash
#!/bin/bash
# Deploy both backend and frontend

echo "Deploying backend..."
git subtree push --prefix backend heroku-backend main

echo "Deploying frontend..."
git subtree push --prefix frontend heroku-frontend main

echo "Deployment complete!"
```

### Windows PowerShell Script

Create `deploy.ps1`:

```powershell
# Deploy backend
Write-Host "Deploying backend..." -ForegroundColor Green
git subtree push --prefix backend heroku-backend main

# Deploy frontend
Write-Host "Deploying frontend..." -ForegroundColor Green
git subtree push --prefix frontend heroku-frontend main

Write-Host "Deployment complete!" -ForegroundColor Green
```

## Environment Variables

Make sure all required environment variables are set in Heroku:

**Backend** (`spotify-playlist-backend-a0e8b9eecd59`):
```bash
heroku config:set SPOTIFY_CLIENT_ID=your_client_id -a spotify-playlist-backend-a0e8b9eecd59
heroku config:set SPOTIFY_CLIENT_SECRET=your_client_secret -a spotify-playlist-backend-a0e8b9eecd59
heroku config:set REDIRECT_URI=https://spotify-playlist-backend-a0e8b9eecd59.herokuapp.com/callback -a spotify-playlist-backend-a0e8b9eecd59
```

**Frontend** (`spotify-playlist-frontend-a5d3c1ff5ab9`):
```bash
heroku config:set REACT_APP_API_URL=https://spotify-playlist-backend-a0e8b9eecd59.herokuapp.com -a spotify-playlist-frontend-a5d3c1ff5ab9
```

## Troubleshooting

1. **Check deployment logs**:
```bash
heroku logs --tail -a spotify-playlist-backend-a0e8b9eecd59
heroku logs --tail -a spotify-playlist-frontend-a5d3c1ff5ab9
```

2. **Check app status**:
```bash
heroku ps -a spotify-playlist-backend-a0e8b9eecd59
heroku ps -a spotify-playlist-frontend-a5d3c1ff5ab9
```

3. **Restart apps**:
```bash
heroku restart -a spotify-playlist-backend-a0e8b9eecd59
heroku restart -a spotify-playlist-frontend-a5d3c1ff5ab9
```

## Quick Deploy Commands

After initial setup, you can deploy with:

```bash
# Deploy everything
git push origin main
git subtree push --prefix backend heroku-backend main
git subtree push --prefix frontend heroku-frontend main
```

Or if auto-deploy is enabled, just push to GitHub:
```bash
git push origin main
# Heroku will automatically deploy
```
