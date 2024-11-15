from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import base64
import random
import string
import config
import os

app = Flask(__name__)

# Configure CORS with specific origin
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
    # Log the request details
    print(f"Request Headers: {dict(request.headers)}")
    print(f"Response Headers: {dict(response.headers)}")
    
    # Add CORS headers with specific origin
    response.headers.add('Access-Control-Allow-Origin', 'https://spotify-playlist-frontend-a5d3c1ff5ab9.herokuapp.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/login', methods=['GET', 'OPTIONS'])
def login():
    print(f"Login endpoint hit with method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Origin: {request.headers.get('Origin')}")
    
    try:
        state = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
        auth_url = f'{config.AUTH_URL}?client_id={config.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri={config.REDIRECT_URI}&scope={config.SCOPE}&state={state}'
        response = jsonify({'url': auth_url})
        print(f"Response headers: {dict(response.headers)}")
        return response
    except Exception as e:
        print(f"Error in login endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/callback')
def callback():
    code = request.args.get('code')
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
        error_response = jsonify({'error': 'Failed to get tokens'})
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