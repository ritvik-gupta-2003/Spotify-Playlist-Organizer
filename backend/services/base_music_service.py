"""
Base Music Service - Abstract interface for streaming service implementations
Defines the contract that all music streaming services must implement
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List


class BaseMusicService(ABC):
    """
    Abstract base class defining the interface for music streaming services.
    All streaming service implementations (Spotify, SoundCloud, YouTube Music, etc.)
    must implement these methods.
    """

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        """
        Initialize the music service with credentials
        
        Args:
            client_id: Application client ID from streaming service
            client_secret: Application client secret from streaming service
            redirect_uri: OAuth redirect URI for authentication callback
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        """
        Generate OAuth authorization URL for user login
        
        Args:
            state: Random state string for CSRF protection
            
        Returns:
            Authorization URL to redirect user to
        """
        pass

    @abstractmethod
    def authenticate(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access and refresh tokens
        
        Args:
            code: Authorization code from OAuth callback
            
        Returns:
            Dict containing access_token, refresh_token, expires_in, etc.
            
        Raises:
            Exception: If authentication fails
        """
        pass

    @abstractmethod
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh an expired access token using refresh token
        
        Args:
            refresh_token: The refresh token to use
            
        Returns:
            Dict containing new access_token and expires_in
            
        Raises:
            Exception: If token refresh fails
        """
        pass

    @abstractmethod
    def get_user_profile(self, access_token: str) -> Dict[str, Any]:
        """
        Get authenticated user's profile information
        
        Args:
            access_token: Valid access token
            
        Returns:
            Dict containing user profile data (id, name, email, images, etc.)
            
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def get_user_playlists(self, access_token: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        Get user's playlists with pagination
        
        Args:
            access_token: Valid access token
            limit: Number of playlists to return (default 50)
            offset: Starting index for pagination (default 0)
            
        Returns:
            Dict containing:
                - items: List of playlist objects
                - total: Total number of playlists
                - next: URL for next page (if available)
                
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def get_playlist_tracks(self, access_token: str, playlist_id: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        Get tracks from a specific playlist with pagination
        
        Args:
            access_token: Valid access token
            playlist_id: Playlist identifier
            limit: Number of tracks to return (default 50)
            offset: Starting index for pagination (default 0)
            
        Returns:
            Dict containing:
                - items: List of track objects (with track nested inside)
                - total: Total number of tracks
                - next: URL for next page (if available)
                
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def get_liked_tracks(self, access_token: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """
        Get user's liked/saved tracks with pagination
        
        Args:
            access_token: Valid access token
            limit: Number of tracks to return (default 50)
            offset: Starting index for pagination (default 0)
            
        Returns:
            Dict containing:
                - items: List of saved track objects
                - total: Total number of saved tracks
                - next: URL for next page (if available)
                
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def add_track_to_playlist(self, access_token: str, playlist_id: str, track_id: str) -> Dict[str, Any]:
        """
        Add a track to a playlist
        
        Args:
            access_token: Valid access token
            playlist_id: Playlist identifier
            track_id: Track identifier to add
            
        Returns:
            Dict containing success status or snapshot_id
            
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def remove_track_from_playlist(self, access_token: str, playlist_id: str, track_id: str) -> Dict[str, Any]:
        """
        Remove a track from a playlist
        
        Args:
            access_token: Valid access token
            playlist_id: Playlist identifier
            track_id: Track identifier to remove
            
        Returns:
            Dict containing success status or snapshot_id
            
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def create_playlist(self, access_token: str, user_id: str, name: str, description: str = '', public: bool = False) -> Dict[str, Any]:
        """
        Create a new playlist for the user
        
        Args:
            access_token: Valid access token
            user_id: User identifier
            name: Playlist name
            description: Playlist description (default empty)
            public: Whether playlist is public (default False)
            
        Returns:
            Dict containing the newly created playlist object
            
        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def get_artist_data(self, access_token: str, artist_id: str) -> Dict[str, Any]:
        """
        Get artist information and metadata
        
        Args:
            access_token: Valid access token
            artist_id: Artist identifier
            
        Returns:
            Dict containing artist data (name, genres, popularity, images, etc.)
            
        Raises:
            Exception: If request fails
        """
        pass
