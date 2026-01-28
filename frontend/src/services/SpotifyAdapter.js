/**
 * SpotifyAdapter - Spotify implementation of BaseMusicAdapter
 * Handles all Spotify Web API interactions
 */

import BaseMusicAdapter from './BaseMusicAdapter';

class SpotifyAdapter extends BaseMusicAdapter {
  /**
   * Initialize Spotify adapter with access token
   * @param {string} accessToken - Valid Spotify access token
   */
  constructor(accessToken) {
    super(accessToken);
    this.apiBaseUrl = 'https://api.spotify.com/v1/';
  }

  /**
   * Make a fetch request with automatic token refresh retry
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @param {string} operation - Operation description for error messages
   * @returns {Promise<Response>} Fetch response
   */
  async fetchWithRetry(url, options, operation) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        await this.handleError(response, operation);
      }
      
      return response;
    } catch (error) {
      // If token was refreshed, retry the request once
      if (error.message === 'TOKEN_REFRESHED') {
        console.log(`Retrying ${operation} with refreshed token...`);
        
        // Update authorization header with new token
        const retryOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`
          }
        };
        
        const retryResponse = await fetch(url, retryOptions);
        
        if (!retryResponse.ok) {
          await this.handleError(retryResponse, operation);
        }
        
        return retryResponse;
      }
      
      throw error;
    }
  }

  /**
   * Get current authenticated user data
   * @returns {Promise<Object>} User profile data
   */
  async getUserData() {
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}me`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      },
      'Get user data'
    );

    return await response.json();
  }

  /**
   * Get user's playlists with pagination
   * @param {number} limit - Number of playlists to fetch (max 50)
   * @param {number} offset - Starting index for pagination
   * @returns {Promise<Object>} Object containing items array and pagination info
   */
  async getUserPlaylists(limit = 50, offset = 0) {
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}me/playlists?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      },
      'Get user playlists'
    );

    return await response.json();
  }

  /**
   * Get all user playlists (handles pagination automatically)
   * @returns {Promise<Array>} Array of all playlist objects
   */
  async getAllUserPlaylists() {
    let allPlaylists = [];
    let nextUrl = `${this.apiBaseUrl}me/playlists?limit=50`;

    while (nextUrl) {
      const response = await this.fetchWithRetry(
        nextUrl,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        },
        'Get all playlists'
      );

      const data = await response.json();
      const validPlaylists = data.items.filter(playlist => playlist && playlist.id);
      allPlaylists = [...allPlaylists, ...validPlaylists];
      
      nextUrl = data.next;
    }

    // Deduplicate playlists by ID
    const uniquePlaylistsMap = new Map();
    allPlaylists.forEach(playlist => {
      if (playlist && playlist.id && !uniquePlaylistsMap.has(playlist.id)) {
        uniquePlaylistsMap.set(playlist.id, playlist);
      }
    });

    return Array.from(uniquePlaylistsMap.values());
  }

  /**
   * Get tracks from a specific playlist
   * @param {string} playlistId - Playlist identifier (or 'liked' for saved tracks)
   * @param {number} limit - Number of tracks to fetch
   * @param {number} offset - Starting index for pagination
   * @returns {Promise<Object>} Object containing items array and pagination info
   */
  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    const endpoint = playlistId === 'liked'
      ? `${this.apiBaseUrl}me/tracks?limit=${limit}&offset=${offset}`
      : `${this.apiBaseUrl}playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;

    const response = await this.fetchWithRetry(
      endpoint,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      },
      'Get playlist tracks'
    );

    return await response.json();
  }

  /**
   * Get all tracks from a playlist (handles pagination automatically)
   * @param {string} playlistId - Playlist identifier
   * @returns {Promise<Array>} Array of all track objects with track IDs
   */
  async getAllPlaylistTracks(playlistId) {
    let allTrackIds = new Set();
    let nextUrl = `${this.apiBaseUrl}playlists/${playlistId}/tracks?limit=50&fields=items(track(external_urls.spotify)),next,total`;
    let pageCount = 0;
    const MAX_PAGES = 200;

    /**
     * Extract track ID from Spotify URL
     * @param {string} spotifyUrl - Spotify track URL
     * @returns {string|null} Track ID or null
     */
    const extractTrackIdFromUrl = (spotifyUrl) => {
      if (!spotifyUrl) return null;
      const match = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    };

    while (nextUrl && pageCount < MAX_PAGES) {
      pageCount++;

      const response = await this.fetchWithRetry(
        nextUrl,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        },
        'Get all playlist tracks'
      );

      const data = await response.json();

      // Extract track IDs from this page
      data.items.forEach(item => {
        if (item.track?.external_urls?.spotify) {
          const trackId = extractTrackIdFromUrl(item.track.external_urls.spotify);
          if (trackId) {
            allTrackIds.add(trackId);
          }
        }
      });

      nextUrl = data.next;

      // Small delay to avoid rate limiting
      if (nextUrl) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allTrackIds;
  }

  /**
   * Get user's liked/saved tracks count
   * @param {number} limit - Number of tracks to fetch
   * @returns {Promise<Object>} Object containing total count
   */
  async getLikedTracks(limit = 1) {
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}me/tracks?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      },
      'Get liked tracks'
    );

    return await response.json();
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
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          public: isPublic,
          description: description
        })
      },
      'Create playlist'
    );

    return await response.json();
  }

  /**
   * Add a track to a playlist
   * @param {string} playlistId - Playlist identifier
   * @param {string} trackId - Track identifier
   * @returns {Promise<Object>} Response object with snapshot_id
   */
  async addTrackToPlaylist(playlistId, trackId) {
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        })
      },
      'Add track to playlist'
    );

    return await response.json();
  }

  /**
   * Remove a track from a playlist
   * @param {string} playlistId - Playlist identifier
   * @param {string} trackId - Track identifier
   * @returns {Promise<Object>} Response object with snapshot_id
   */
  async removeTrackFromPlaylist(playlistId, trackId) {
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}playlists/${playlistId}/tracks`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [{
            uri: `spotify:track:${trackId}`
          }]
        })
      },
      'Remove track from playlist'
    );

    return await response.json();
  }

  /**
   * Get artist data and metadata
   * @param {string} artistId - Artist identifier
   * @returns {Promise<Object>} Artist data object
   */
  async getArtistData(artistId) {
    const response = await this.fetchWithRetry(
      `${this.apiBaseUrl}artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      },
      'Get artist data'
    );

    return await response.json();
  }
}

export default SpotifyAdapter;
