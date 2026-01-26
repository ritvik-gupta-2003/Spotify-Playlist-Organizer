import os
from dotenv import load_dotenv
from pathlib import Path

# Get the directory where this config.py file is located
config_dir = Path(__file__).parent
env_path = config_dir / '.env'

# Load environment variables from .env file
# Try to load from the same directory as config.py first
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"Loaded .env from: {env_path}")
else:
    # Fallback to default behavior (searches current directory and parent directories)
    load_dotenv()
    print(f".env file not found at {env_path}, using default search")

# Get Spotify credentials from environment variables
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# Get redirect URI - default to 127.0.0.1:8080 for development (Spotify requires loopback IP, not localhost)
# Heroku URL for production
REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://127.0.0.1:8080/callback')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://127.0.0.1:8080')

# Debug: Print configuration (without secrets)
print(f"Loaded config - REDIRECT_URI: {REDIRECT_URI}")
print(f"Loaded config - FRONTEND_URL: {FRONTEND_URL}")
print(f"Loaded config - CLIENT_ID: {'SET' if SPOTIFY_CLIENT_ID else 'NOT SET'}")
print(f"Loaded config - CLIENT_SECRET: {'SET' if SPOTIFY_CLIENT_SECRET else 'NOT SET'}")

SCOPE = ' '.join([
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
    'user-library-modify'
])

# Spotify API URLs
AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'