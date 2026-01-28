"""
Music Playlist Organizer Backend
Flask application that handles streaming service OAuth and token management
Uses adapter pattern to support multiple streaming services
"""

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import random
import string
import os
import config  # Import config to load .env file into environment
from services.service_factory import ServiceFactory

app = Flask(__name__)

# Initialize music streaming service via factory
try:
    music_service = ServiceFactory.create_service()
    service_type = ServiceFactory.get_current_service_type()
    print(f"Initialized {service_type} streaming service")
except Exception as e:
    print(f"ERROR: Failed to initialize streaming service: {e}")
    music_service = None

# Determine if running in development mode (local) or production (Heroku)
# Heroku always sets DYNO environment variable, so if it's not set, we're in local development
# Also check for explicit FLASK_ENV=development
is_development = os.environ.get('DYNO') is None or os.environ.get('FLASK_ENV') == 'development'
print(f"Environment check - FLASK_ENV: {os.environ.get('FLASK_ENV')}, DYNO: {os.environ.get('DYNO')}")
print(f"Running in development mode: {is_development}")

# Configure CORS - allow specific origins in development for credentials support
if is_development:
    # Development: Allow specific local origins to support credentials
    CORS(app, 
         resources={r"/*": {
             "origins": ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000", "http://127.0.0.1:3000"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"]
         }})
    print("CORS configured for development: Allowing local origins with credentials")
else:
    # Production: Only allow specific Heroku frontend URL
    CORS(app, 
         resources={r"/*": {
             "origins": ["https://spotify-playlist-frontend-a5d3c1ff5ab9.herokuapp.com"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"]
         }})
    print("CORS configured for production: Allowing only Heroku frontend")

@app.after_request
def after_request(response):
    """
    Log request details after each request for debugging
    """
    origin = request.headers.get('Origin')
    print(f"Request Origin: {origin}")
    print(f"Is Development: {is_development}")
    print(f"Response CORS Headers: Access-Control-Allow-Origin = {response.headers.get('Access-Control-Allow-Origin')}")
    return response

@app.route('/login', methods=['GET', 'OPTIONS'])
def login():
    """
    Generate streaming service authorization URL
    Returns URL for client to redirect user to service login
    """
    print(f"Login endpoint hit with method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Origin: {request.headers.get('Origin')}")
    
    # Check if service is initialized
    if not music_service:
        error_msg = 'Streaming service is not configured. Please check your .env file.'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 500
    
    try:
        # Generate random state for CSRF protection
        state = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
        
        # Get authorization URL from service
        auth_url = music_service.get_authorization_url(state)
        
        print(f"Generated auth URL: {auth_url}")
        response = jsonify({'url': auth_url})
        print(f"Response headers: {dict(response.headers)}")
        return response
    except Exception as e:
        print(f"Error in login endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/callback')
def callback():
    """
    Handle streaming service OAuth callback
    Exchanges authorization code for access and refresh tokens
    """
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        print(f"Authorization error: {error}")
        return jsonify({'error': f'Authorization failed: {error}'}), 400
    
    if not code:
        print("No authorization code received in callback")
        return jsonify({'error': 'No authorization code provided'}), 400
    
    # Check if service is initialized
    if not music_service:
        error_msg = 'Streaming service is not configured.'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 500
    
    print(f"Callback received with code")
    
    try:
        # Authenticate and get tokens via service
        tokens = music_service.authenticate(code)
        print("Token exchange successful")
        return jsonify(tokens)
    except Exception as e:
        error_msg = str(e)
        print(f"Token exchange failed: {error_msg}")
        return jsonify({'error': error_msg}), 400

@app.route('/refresh_token', methods=['POST', 'OPTIONS'])
def refresh_token():
    """
    Refresh expired access token using refresh token
    Returns new access token
    """
    data = request.get_json()
    refresh_token_value = data.get('refresh_token')
    
    if not refresh_token_value:
        return jsonify({'error': 'No refresh token provided'}), 400
    
    # Check if service is initialized
    if not music_service:
        error_msg = 'Streaming service is not configured.'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 500
    
    try:
        # Refresh token via service
        new_tokens = music_service.refresh_access_token(refresh_token_value)
        print("Token refreshed successfully")
        return jsonify(new_tokens)
    except Exception as e:
        error_msg = str(e)
        print(f"Failed to refresh token: {error_msg}")
        return jsonify({'error': error_msg}), 400

@app.route('/')
def home():
    """
    Health check endpoint
    Returns API status and configured service
    """
    service_type = ServiceFactory.get_current_service_type() if music_service else 'none'
    return jsonify({
        'status': 'online',
        'message': 'Music Playlist Organizer Backend API is running',
        'service': service_type,
        'available_services': ServiceFactory.get_available_services()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 