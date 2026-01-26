from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import base64
import random
import string
import config
import os
from urllib.parse import urlencode

app = Flask(__name__)

# Determine if running in development mode (local) or production (Heroku)
# Heroku always sets DYNO environment variable, so if it's not set, we're in local development
# Also check for explicit FLASK_ENV=development
is_development = os.environ.get('DYNO') is None or os.environ.get('FLASK_ENV') == 'development'
print(f"Environment check - FLASK_ENV: {os.environ.get('FLASK_ENV')}, DYNO: {os.environ.get('DYNO')}")
print(f"Running in development mode: {is_development}")

# Configure CORS - allow localhost origins in development, restrict to specific URL in production
if is_development:
    # Development: Allow localhost origins
    CORS(app, 
         resources={r"/*": {
             "origins": ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"]
         }})
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

@app.after_request
def after_request(response):
    # Log the request details for debugging
    origin = request.headers.get('Origin')
    print(f"Request Origin: {origin}")
    print(f"Is Development: {is_development}")
    print(f"Response CORS Headers: Access-Control-Allow-Origin = {response.headers.get('Access-Control-Allow-Origin')}")
    return response

@app.route('/login', methods=['GET', 'OPTIONS'])
def login():
    print(f"Login endpoint hit with method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Origin: {request.headers.get('Origin')}")
    
    # Validate that Spotify credentials are loaded
    if not config.SPOTIFY_CLIENT_ID or config.SPOTIFY_CLIENT_ID == 'None':
        error_msg = 'Spotify CLIENT_ID is not configured. Please check your .env file.'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 500
    
    if not config.SPOTIFY_CLIENT_SECRET or config.SPOTIFY_CLIENT_SECRET == 'None':
        error_msg = 'Spotify CLIENT_SECRET is not configured. Please check your .env file.'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 500
    
    try:
        state = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
        
        # Build authorization URL with properly URL-encoded parameters
        auth_params = {
            'client_id': config.SPOTIFY_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': config.REDIRECT_URI,
            'scope': config.SCOPE,
            'state': state
        }
        auth_url = f'{config.AUTH_URL}?{urlencode(auth_params)}'
        
        print(f"Generated auth URL with redirect_uri: {config.REDIRECT_URI}")
        print(f"Full auth URL: {auth_url}")
        response = jsonify({'url': auth_url})
        print(f"Response headers: {dict(response.headers)}")
        return response
    except Exception as e:
        print(f"Error in login endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/callback')
def callback():
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        print(f"Spotify authorization error: {error}")
        return jsonify({'error': f'Authorization failed: {error}'}), 400
    
    if not code:
        print("No authorization code received in callback")
        return jsonify({'error': 'No authorization code provided'}), 400
    
    print(f"Callback received with code. Using REDIRECT_URI: {config.REDIRECT_URI}")
    
    auth_header = base64.urlsafe_b64encode(
        f"{config.SPOTIFY_CLIENT_ID}:{config.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()
    
    response = requests.post(
        config.TOKEN_URL,
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': config.REDIRECT_URI
        },
        headers={
            'Authorization': f'Basic {auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    )
    
    if response.status_code != 200:
        error_msg = response.json().get('error_description', 'Failed to get tokens')
        print(f"Token exchange failed: {error_msg}")
        print(f"Response: {response.text}")
        error_response = jsonify({'error': error_msg})
        return error_response, response.status_code
        
    return jsonify(response.json())

@app.route('/refresh_token', methods=['POST', 'OPTIONS'])
def refresh_token():
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        error_response = jsonify({'error': 'No refresh token provided'})
        return error_response, 400
        
    auth_header = base64.urlsafe_b64encode(
        f"{config.SPOTIFY_CLIENT_ID}:{config.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()
    
    response = requests.post(
        config.TOKEN_URL,
        data={
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        },
        headers={
            'Authorization': f'Basic {auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    )
    
    if response.status_code != 200:
        print("FAILED TO REFRESH TOKEN")
        error_response = jsonify({'error': 'Failed to refresh token'})
        return error_response, response.status_code
    
    print("REFRESHED TOKEN")
    return jsonify(response.json())

@app.route('/')
def home():
    return jsonify({
        'status': 'online',
        'message': 'Spotify Playlist Backend API is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 