"""
Service Factory - Creates appropriate music streaming service based on configuration
Implements Factory Pattern to instantiate the correct service adapter
"""

import os
from .base_music_service import BaseMusicService
from .spotify_service import SpotifyService


class ServiceFactory:
    """
    Factory class for creating music streaming service instances.
    Reads configuration to determine which service to instantiate.
    """

    @staticmethod
    def create_service() -> BaseMusicService:
        """
        Create and return the appropriate music streaming service based on configuration.
        Reads STREAMING_SERVICE environment variable (defaults to 'spotify').
        
        Returns:
            Instance of BaseMusicService (currently SpotifyService)
            
        Raises:
            ValueError: If service type is not supported
            ValueError: If required credentials are missing
        """
        # Get service type from environment (default to spotify)
        service_type = os.environ.get('STREAMING_SERVICE', 'spotify').lower()
        
        # Get redirect URI and frontend URL
        redirect_uri = os.environ.get('REDIRECT_URI', 'http://127.0.0.1:8080/callback')
        
        if service_type == 'spotify':
            # Get Spotify credentials
            client_id = os.environ.get('SPOTIFY_CLIENT_ID')
            client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')
            
            if not client_id or client_id == 'None':
                raise ValueError('SPOTIFY_CLIENT_ID environment variable is not set')
            if not client_secret or client_secret == 'None':
                raise ValueError('SPOTIFY_CLIENT_SECRET environment variable is not set')
            
            return SpotifyService(
                client_id=client_id,
                client_secret=client_secret,
                redirect_uri=redirect_uri
            )
        
        # Future service implementations
        elif service_type == 'soundcloud':
            raise NotImplementedError('SoundCloud service not yet implemented')
        
        elif service_type == 'youtube_music':
            raise NotImplementedError('YouTube Music service not yet implemented')
        
        else:
            raise ValueError(f'Unsupported streaming service: {service_type}')

    @staticmethod
    def get_available_services() -> list:
        """
        Get list of available streaming services
        
        Returns:
            List of service names that can be instantiated
        """
        return ['spotify']  # Future: add 'soundcloud', 'youtube_music', etc.

    @staticmethod
    def get_current_service_type() -> str:
        """
        Get the currently configured streaming service type
        
        Returns:
            Service type string (e.g., 'spotify')
        """
        return os.environ.get('STREAMING_SERVICE', 'spotify').lower()
