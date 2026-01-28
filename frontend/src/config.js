// Use localhost:5000 for development, Heroku URL for production
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Streaming service configuration (spotify, soundcloud, youtube_music, etc.)
export const STREAMING_SERVICE = process.env.REACT_APP_STREAMING_SERVICE || 'spotify';