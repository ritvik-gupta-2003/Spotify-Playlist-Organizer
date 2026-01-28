/**
 * BaseMusicAdapter - Abstract interface for client-side music streaming operations
 * Defines the contract that all streaming service adapters must implement
 */

class BaseMusicAdapter {
  /**
   * Initialize the adapter with access token
   * @param {string} accessToken - Valid access token for API requests
   */
  constructor(accessToken) {
    if (this.constructor === BaseMusicAdapter) {
      throw new Error("BaseMusicAdapter is abstract and cannot be instantiated directly");
    }
    this.accessToken = accessToken;
    this.tokenRefreshCallback = null;
  }

  /**
   * Set or update the access token
   * @param {string} accessToken - New access token
   */
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Set callback function for token refresh
   * @param {Function} callback - Function to call when token needs refresh
   */
  setTokenRefreshCallback(callback) {
    this.tokenRefreshCallback = callback;
  }

  /**
   * Get current authenticated user data
   * @returns {Promise<Object>} User profile data
   */
  async getUserData() {
    throw new Error("Method 'getUserData()' must be implemented");
  }

  /**
   * Get user's playlists with pagination
   * @param {number} limit - Number of playlists to fetch
   * @param {number} offset - Starting index for pagination
   * @returns {Promise<Object>} Object containing items array and pagination info
   */
  async getUserPlaylists(limit = 50, offset = 0) {
    throw new Error("Method 'getUserPlaylists()' must be implemented");
  }

  /**
   * Get all user playlists (handles pagination automatically)
   * @returns {Promise<Array>} Array of all playlist objects
   */
  async getAllUserPlaylists() {
    throw new Error("Method 'getAllUserPlaylists()' must be implemented");
  }

  /**
   * Get tracks from a specific playlist
   * @param {string} playlistId - Playlist identifier
   * @param {number} limit - Number of tracks to fetch
   * @param {number} offset - Starting index for pagination
   * @returns {Promise<Object>} Object containing items array and pagination info
   */
  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    throw new Error("Method 'getPlaylistTracks()' must be implemented");
  }

  /**
   * Get all tracks from a playlist (handles pagination automatically)
   * @param {string} playlistId - Playlist identifier
   * @returns {Promise<Array>} Array of all track objects
   */
  async getAllPlaylistTracks(playlistId) {
    throw new Error("Method 'getAllPlaylistTracks()' must be implemented");
  }

  /**
   * Get user's liked/saved tracks
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<Object>} Object containing items array and total count
   */
  async getLikedTracks(limit = 1) {
    throw new Error("Method 'getLikedTracks()' must be implemented");
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
    throw new Error("Method 'createPlaylist()' must be implemented");
  }

  /**
   * Add a track to a playlist
   * @param {string} playlistId - Playlist identifier
   * @param {string} trackId - Track identifier
   * @returns {Promise<Object>} Response object
   */
  async addTrackToPlaylist(playlistId, trackId) {
    throw new Error("Method 'addTrackToPlaylist()' must be implemented");
  }

  /**
   * Remove a track from a playlist
   * @param {string} playlistId - Playlist identifier
   * @param {string} trackId - Track identifier
   * @returns {Promise<Object>} Response object
   */
  async removeTrackFromPlaylist(playlistId, trackId) {
    throw new Error("Method 'removeTrackFromPlaylist()' must be implemented");
  }

  /**
   * Get artist data and metadata
   * @param {string} artistId - Artist identifier
   * @returns {Promise<Object>} Artist data object
   */
  async getArtistData(artistId) {
    throw new Error("Method 'getArtistData()' must be implemented");
  }

  /**
   * Handle API errors consistently
   * Automatically refreshes token on 401 errors
   * @param {Response} response - Fetch response object
   * @param {string} operation - Description of the operation that failed
   * @throws {Error} Formatted error with status code
   */
  async handleError(response, operation) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401 && this.tokenRefreshCallback) {
      console.log('Token expired, attempting refresh...');
      try {
        await this.tokenRefreshCallback();
        throw new Error('TOKEN_REFRESHED'); // Signal to retry the request
      } catch (refreshError) {
        if (refreshError.message === 'TOKEN_REFRESHED') {
          throw refreshError; // Pass through to allow retry
        }
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    const errorText = await response.text();
    throw new Error(`${operation} failed: HTTP ${response.status} - ${errorText}`);
  }
}

export default BaseMusicAdapter;
