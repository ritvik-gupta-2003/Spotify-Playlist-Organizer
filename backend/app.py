from flask import Flask, request, redirect, jsonify, session, make_response
from flask_cors import CORS
import requests
import base64
import random
import string
import config


app = Flask(__name__)

# Update CORS configuration
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:8080"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }
     })

app.secret_key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 204

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/login', methods=['GET', 'OPTIONS'])
def login():
    state = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    auth_url = f'{config.AUTH_URL}?client_id={config.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri={config.REDIRECT_URI}&scope={config.SCOPE}&state={state}'
    
    response = jsonify({'url': auth_url})
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


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
        return jsonify({'error': 'Failed to get tokens'}), response.status_code
        
    return jsonify(response.json())

@app.route('/refresh_token', methods=['POST', 'OPTIONS'])
def refresh_token():
    if request.method == 'OPTIONS':
        return handle_options()
        
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'error': 'No refresh token provided'}), 400
        
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
        return jsonify({'error': 'Failed to refresh token'}), response.status_code
    
    print("REFRESHED TOKEN")
        
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(port=5010, debug=True) 