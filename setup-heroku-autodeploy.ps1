# Setup script for Heroku Auto-Deploy with Monorepo Support
# This configures both Heroku apps to work with the monorepo structure

$backendApp = "spotify-playlist-backend-a0e8b9eecd59"
$frontendApp = "spotify-playlist-frontend-a5d3c1ff5ab9"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Heroku Monorepo Auto-Deploy Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Heroku CLI is installed
try {
    heroku --version 2>&1 | Out-Null
    Write-Host "Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Heroku CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    heroku auth:whoami 2>&1 | Out-Null
    Write-Host "Logged in to Heroku" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Not logged in. Run: heroku login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuring Backend App..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Configure backend buildpacks
Write-Host "Setting up subdirectory buildpack for backend..." -ForegroundColor Gray
heroku buildpacks:clear -a $backendApp
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a $backendApp
heroku buildpacks:add heroku/python -a $backendApp

# Set PROJECT_PATH config var
Write-Host "Setting PROJECT_PATH=backend..." -ForegroundColor Gray
heroku config:set PROJECT_PATH=backend -a $backendApp

Write-Host "Backend configured successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Configuring Frontend App..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Configure frontend buildpacks
Write-Host "Setting up subdirectory buildpack for frontend..." -ForegroundColor Gray
heroku buildpacks:clear -a $frontendApp
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a $frontendApp
heroku buildpacks:add heroku/nodejs -a $frontendApp

# Set PROJECT_PATH config var
Write-Host "Setting PROJECT_PATH=frontend..." -ForegroundColor Gray
heroku config:set PROJECT_PATH=frontend -a $frontendApp

Write-Host "Frontend configured successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Heroku Dashboard for each app" -ForegroundColor White
Write-Host "2. Navigate to Deploy tab" -ForegroundColor White
Write-Host "3. Connect GitHub repository: ritvik-gupta-2003/Spotify-Playlist-Organizer" -ForegroundColor White
Write-Host "4. Enable Automatic Deploys for 'main' branch" -ForegroundColor White
Write-Host ""
Write-Host "After setup, pushing to GitHub main branch will auto-deploy both apps!" -ForegroundColor Green
