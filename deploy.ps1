# Heroku Deployment Script
# This script deploys both backend and frontend to Heroku

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

# Heroku app names
$backendApp = "spotify-playlist-backend-a0e8b9eecd59"
$frontendApp = "spotify-playlist-frontend-a5d3c1ff5ab9"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Heroku Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Heroku CLI is installed
try {
    $herokuVersion = heroku --version 2>&1
    Write-Host "Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Heroku CLI not found. Please install it from https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Red
    exit 1
}

# Check if logged in to Heroku
try {
    heroku auth:whoami 2>&1 | Out-Null
    Write-Host "Logged in to Heroku" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Not logged in to Heroku. Run: heroku login" -ForegroundColor Red
    exit 1
}

# Function to add Heroku remote if it doesn't exist
function Add-HerokuRemote {
    param(
        [string]$AppName,
        [string]$RemoteName
    )
    
    $existingRemotes = git remote show 2>&1
    if ($existingRemotes -notcontains $RemoteName) {
        Write-Host "Adding Heroku remote: $RemoteName for app: $AppName" -ForegroundColor Yellow
        heroku git:remote -a $AppName
        git remote rename heroku $RemoteName
        Write-Host "Remote added successfully" -ForegroundColor Green
    } else {
        Write-Host "Remote $RemoteName already exists" -ForegroundColor Green
    }
}

# Add Heroku remotes
if (-not $FrontendOnly) {
    Add-HerokuRemote -AppName $backendApp -RemoteName "heroku-backend"
}

if (-not $BackendOnly) {
    Add-HerokuRemote -AppName $frontendApp -RemoteName "heroku-frontend"
}

Write-Host ""

# Deploy Backend
if (-not $FrontendOnly) {
    Write-Host "Deploying backend to Heroku..." -ForegroundColor Yellow
    Write-Host "App: $backendApp" -ForegroundColor Gray
    try {
        git subtree push --prefix backend heroku-backend main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Backend deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Backend deployment failed!" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error deploying backend: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Deploy Frontend
if (-not $BackendOnly) {
    Write-Host "Deploying frontend to Heroku..." -ForegroundColor Yellow
    Write-Host "App: $frontendApp" -ForegroundColor Gray
    try {
        git subtree push --prefix frontend heroku-frontend main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Frontend deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Frontend deployment failed!" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error deploying frontend: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: https://$backendApp.herokuapp.com" -ForegroundColor Cyan
Write-Host "Frontend URL: https://$frontendApp.herokuapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  heroku logs --tail -a $backendApp" -ForegroundColor Gray
Write-Host "  heroku logs --tail -a $frontendApp" -ForegroundColor Gray
