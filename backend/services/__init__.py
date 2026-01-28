"""
Services package for music streaming platform adapters
"""
from .base_music_service import BaseMusicService
from .spotify_service import SpotifyService
from .service_factory import ServiceFactory

__all__ = ['BaseMusicService', 'SpotifyService', 'ServiceFactory']
