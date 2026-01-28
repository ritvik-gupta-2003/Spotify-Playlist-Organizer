"""
Spotify Service - Implementation of BaseMusicService for Spotify Web API
Handles all Spotify-specific API interactions and OAuth flow
"""

import requests
import base64
from typing import Dict, Any
from urllib.parse import urlencode
from .base_music_service import BaseMusicService


class SpotifyService(BaseMusicService):
    """
    Spotify implementation of the music streaming service interface.
    Handles authentication, playlists, tracks, and all Spotify API operations.
    """

    # Spotify API endpoints
    AUTH_URL = 'https://accounts.spotify.com/authorize'
    TOKEN_URL = 'https://accounts.spotify.com/api/token'
    API_BASE_URL = 'https://api.spotify.com/v1/'

    # Required OAuth scopes for app functionality
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

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        """
        Initialize Spotify service with OAuth credentials
        
        Args:
            client_id: Spotify application client ID
            client_secret: Spotify application client secret
            redirect_uri: OAuth redirect URI
        """
        super().__init__(client_id, client_secret, redirect_uri)
        
        # Validate credentials
        if not self.client_id or self.client_id == 'None':
            raise ValueError('Spotify CLIENT_ID is not configured')
        if not self.client_secret or self.client_secret == 'None':
            raise ValueError('Spotify CLIENT_SECRET is not configured')

    def get_authorization_url(self, state: str) -> str:
        """
        Generate Spotify OAuth authorization URL
        
        Args:
            state: Random state string for CSRF protection
            
        Returns:
            Spotify authorization URL
        """
        auth_params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': self.redirect_uri,
            'scope': self.SCOPE,
            'state': state
        }
        return f'{self.AUTH_URL}?{urlencode(auth_params)}'

    def authenticate(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access and refresh tokens
        
        Args:
            code: Authorization code from OAuth callback
            
        Returns:
            Dict containing access_token, refresh_token, expires_in, token_type
            
        Raises:
            Exception: If token exchange fails
        """
        # Create basic auth header
        auth_header = base64.urlsafe_b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()
        
        # Request tokens from Spotify
        response = requests.post(
            self.TOKEN_URL,
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri
            },
            headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        if response.status_code != 200:
            error_msg = response.json().get('error_description', 'Failed to get tokens')
            raise Exception(f'Authentication failed: {error_msg}')
            
        return response.json()

    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh expired access token using refresh token
        
        Args:
            refresh_token: The refresh token to use
            
        Returns:
            Dict containing new access_token and expires_in
            
        Raises:
            Exception: If token refresh fails
        """
        # Create basic auth header
        auth_header = base64.urlsafe_b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()
        
        # Request new access token
        response = requests.post(
            self.TOKEN_URL,
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
            raise Exception('Failed to refresh token')
            
        return response.json()

    def get_user_profile(self, access_token: str) -> Dict[str, Any]:
        """
        Get authenticated user's profile information
        
        Args:
            access_token: Valid Spotify access token
            
        Returns:
            Dict containing user profile (id, display_name, email, images, etc.)
            
        Raises:
            Exception: If request fails
        """
        response = requests.get(
            f'{self.API_BASE_URL}me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            raise Exception(f'Failed to fetch user profile: HTTP {response.status_code}')
            
        return response.json()

    def get_user_playlists(self, access_token: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        Get user's Spotify playlists with pagination
        
        Args:
            access_token: Valid Spotify access token
            limit: Number of playlists to return (max 50)
            offset: Starting index for pagination
            
        Returns:
            Dict containing items (playlists), total, next, previous
            
        Raises:
            Exception: If request fails
        """
        response = requests.get(
            f'{self.API_BASE_URL}me/playlists',
            params={'limit': limit, 'offset': offset},
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            raise Exception(f'Failed to fetch playlists: HTTP {response.status_code}')
            
        return response.json()

    def get_playlist_tracks(self, access_token: str, playlist_id: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        Get tracks from a specific Spotify playlist
        
        Args:
            access_token: Valid Spotify access token
            playlist_id: Spotify playlist ID
            limit: Number of tracks to return (max 100)
            offset: Starting index for pagination
            
        Returns:
            Dict containing items (tracks), total, next, previous
            
        Raises:
            Exception: If request fails
        """
        response = requests.get(
            f'{self.API_BASE_URL}playlists/{playlist_id}/tracks',
            params={'limit': limit, 'offset': offset},
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            raise Exception(f'Failed to fetch playlist tracks: HTTP {response.status_code}')
            
        return response.json()

    def get_liked_tracks(self, access_token: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        Get user's liked/saved tracks from Spotify library
        
        Args:
            access_token: Valid Spotify access token
            limit: Number of tracks to return (max 50)
            offset: Starting index for pagination
            
        Returns:
            Dict containing items (saved tracks), total, next, previous
            
        Raises:
            Exception: If request fails
        """
        response = requests.get(
            f'{self.API_BASE_URL}me/tracks',
            params={'limit': limit, 'offset': offset},
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            raise Exception(f'Failed to fetch liked tracks: HTTP {response.status_code}')
            
        return response.json()

    def add_track_to_playlist(self, access_token: str, playlist_id: str, track_id: str) -> Dict[str, Any]:
        """
        Add a track to a Spotify playlist
        
        Args:
            access_token: Valid Spotify access token
            playlist_id: Spotify playlist ID
            track_id: Spotify track ID to add
            
        Returns:
            Dict containing snapshot_id
            
        Raises:
            Exception: If request fails
        """
        response = requests.post(
            f'{self.API_BASE_URL}playlists/{playlist_id}/tracks',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json={'uris': [f'spotify:track:{track_id}']}
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f'Failed to add track to playlist: HTTP {response.status_code}')
            
        return response.json()

    def remove_track_from_playlist(self, access_token: str, playlist_id: str, track_id: str) -> Dict[str, Any]:
        """
        Remove a track from a Spotify playlist
        
        Args:
            access_token: Valid Spotify access token
            playlist_id: Spotify playlist ID
            track_id: Spotify track ID to remove
            
        Returns:
            Dict containing snapshot_id
            
        Raises:
            Exception: If request fails
        """
        response = requests.delete(
            f'{self.API_BASE_URL}playlists/{playlist_id}/tracks',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json={'tracks': [{'uri': f'spotify:track:{track_id}'}]}
        )
        
        if response.status_code != 200:
            raise Exception(f'Failed to remove track from playlist: HTTP {response.status_code}')
            
        return response.json()

    def create_playlist(self, access_token: str, user_id: str, name: str, description: str = '', public: bool = False) -> Dict[str, Any]:
        """
        Create a new Spotify playlist for the user
        
        Args:
            access_token: Valid Spotify access token
            user_id: Spotify user ID
            name: Playlist name
            description: Playlist description
            public: Whether playlist is public
            
        Returns:
            Dict containing the newly created playlist object
            
        Raises:
            Exception: If request fails
        """
        response = requests.post(
            f'{self.API_BASE_URL}users/{user_id}/playlists',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json={
                'name': name,
                'description': description,
                'public': public
            }
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f'Failed to create playlist: HTTP {response.status_code}')
            
        return response.json()

    def get_artist_data(self, access_token: str, artist_id: str) -> Dict[str, Any]:
        """
        Get Spotify artist information and metadata
        
        Args:
            access_token: Valid Spotify access token
            artist_id: Spotify artist ID
            
        Returns:
            Dict containing artist data (name, genres, popularity, images, etc.)
            
        Raises:
            Exception: If request fails
        """
        response = requests.get(
            f'{self.API_BASE_URL}artists/{artist_id}',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            raise Exception(f'Failed to fetch artist data: HTTP {response.status_code}')
            
        return response.json()
