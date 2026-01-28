/**
 * MusicStreamingAPI - Singleton manager for music streaming service adapters
 * Provides unified access point for all streaming operations
 */

import SpotifyAdapter from './SpotifyAdapter';

class MusicStreamingAPI {
  constructor() {
    if (MusicStreamingAPI.instance) {
      return MusicStreamingAPI.instance;
    }

    this.adapter = null;
    this.serviceType = 'spotify'; // Default service
    MusicStreamingAPI.instance = this;
  }

  /**
   * Initialize the API with an access token
   * Creates the appropriate adapter based on service type
   * @param {string} accessToken - Valid access token
   * @param {string} serviceType - Service type (default: 'spotify')
   */
  initialize(accessToken, serviceType = 'spotify') {
    this.serviceType = serviceType.toLowerCase();
    this.isRefreshing = false;
    this.refreshPromise = null;

    switch (this.serviceType) {
      case 'spotify':
        this.adapter = new SpotifyAdapter(accessToken);
        break;
      
      case 'soundcloud':
        throw new Error('SoundCloud adapter not yet implemented');
      
      case 'youtube_music':
        throw new Error('YouTube Music adapter not yet implemented');
      
      default:
        throw new Error(`Unsupported streaming service: ${serviceType}`);
    }

    // Set token refresh callback
    if (this.adapter) {
      this.adapter.setTokenRefreshCallback(() => this.refreshAccessToken());
    }
  }

  /**
   * Update the access token for the current adapter
   * @param {string} accessToken - New access token
   */
  setAccessToken(accessToken) {
    if (!this.adapter) {
      throw new Error('API not initialized. Call initialize() first.');
    }
    this.adapter.setAccessToken(accessToken);
  }

  /**
   * Refresh the access token using the refresh token
   * Prevents multiple simultaneous refresh requests
   * @returns {Promise<string>} New access token
   */
  async refreshAccessToken() {
    // If already refreshing, wait for existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh operation
   * @private
   * @returns {Promise<string>} New access token
   */
  async _performTokenRefresh() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available. Please log in again.');
    }

    const { API_URL } = await import('../config');
    
    const response = await fetch(`${API_URL}/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      // Refresh failed - user needs to log in again
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      window.location.href = '/';
      throw new Error('Token refresh failed. Please log in again.');
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    // Update stored token
    localStorage.setItem('spotify_access_token', newAccessToken);

    // Update adapter with new token
    if (this.adapter) {
      this.adapter.setAccessToken(newAccessToken);
    }

    console.log('Access token refreshed successfully');
    return newAccessToken;
  }

  /**
   * Get the current service type
   * @returns {string} Service type (e.g., 'spotify')
   */
  getServiceType() {
    return this.serviceType;
  }

  /**
   * Check if API is initialized
   * @returns {boolean} True if adapter is ready
   */
  isInitialized() {
    return this.adapter !== null;
  }

  // ========== User Operations ==========

  /**
   * Get current authenticated user data
   * @returns {Promise<Object>} User profile data
   */
  async getUserData() {
    this._ensureInitialized();
    return await this.adapter.getUserData();
  }

  // ========== Playlist Operations ==========

  /**
   * Get user's playlists with pagination
   * @param {number} limit - Number of playlists to fetch
   * @param {number} offset - Starting index for pagination
   * @returns {Promise<Object>} Object containing items array and pagination info
   */
  async getUserPlaylists(limit = 50, offset = 0) {
    this._ensureInitialized();
    return await this.adapter.getUserPlaylists(limit, offset);
  }

  /**
   * Get all user playlists (handles pagination automatically)
   * @returns {Promise<Array>} Array of all playlist objects
   */
  async getAllUserPlaylists() {
    this._ensureInitialized();
    return await this.adapter.getAllUserPlaylists();
  }

  /**
   * Create a new playlist for the user
   * @param {string} userId - User identifier
   * @param {string} name - Playlist name
   * @param {string} description - Playlist description
   * @param {boolean} isPublic - Whether playlist is public
   * @returns {Promise<Object>} Newly created playlist object
   */
  async createPlaylist(userId, name, description = '', isPublic = false) {
    this._ensureInitialized();
    return await this.adapter.createPlaylist(userId, name, description, isPublic);
  }

  // ========== Track Operations ==========

  /**
   * Get tracks from a specific playlist
   * @param {string} playlistId - Playlist identifier (or 'liked' for saved tracks)
   * @param {number} limit - Number of tracks to fetch
   * @param {number} offset - Starting index for pagination
   * @returns {Promise<Object>} Object containing items array and pagination info
   */
  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    this._ensureInitialized();
    return await this.adapter.getPlaylistTracks(playlistId, limit, offset);
  }

  /**
   * Get all tracks from a playlist (handles pagination automatically)
   * @param {string} playlistId - Playlist identifier
   * @returns {Promise<Set>} Set of all track IDs
   */
  async getAllPlaylistTracks(playlistId) {
    this._ensureInitialized();
    return await this.adapter.getAllPlaylistTracks(playlistId);
  }

  /**
   * Get user's liked/saved tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<Object>} Object containing total count
   */
  async getLikedTracks(limit = 1) {
    this._ensureInitialized();
    return await this.adapter.getLikedTracks(limit);
  }

  /**
   * Add a track to a playlist
   * @param {string} playlistId - Playlist identifier
   * @param {string} trackId - Track identifier
   * @returns {Promise<Object>} Response object
   */
  async addTrackToPlaylist(playlistId, trackId) {
    this._ensureInitialized();
    return await this.adapter.addTrackToPlaylist(playlistId, trackId);
  }

  /**
   * Remove a track from a playlist
   * @param {string} playlistId - Playlist identifier
   * @param {string} trackId - Track identifier
   * @returns {Promise<Object>} Response object
   */
  async removeTrackFromPlaylist(playlistId, trackId) {
    this._ensureInitialized();
    return await this.adapter.removeTrackFromPlaylist(playlistId, trackId);
  }

  // ========== Artist Operations ==========

  /**
   * Get artist data and metadata
   * @param {string} artistId - Artist identifier
   * @returns {Promise<Object>} Artist data object
   */
  async getArtistData(artistId) {
    this._ensureInitialized();
    return await this.adapter.getArtistData(artistId);
  }

  // ========== Private Helper Methods ==========

  /**
   * Ensure the API is initialized before making calls
   * @private
   * @throws {Error} If API is not initialized
   */
  _ensureInitialized() {
    if (!this.adapter) {
      throw new Error('MusicStreamingAPI not initialized. Call initialize() with an access token first.');
    }
  }
}

// Export singleton instance
// Note: Not freezing the instance to allow internal property updates during initialization
const instance = new MusicStreamingAPI();

export default instance;
