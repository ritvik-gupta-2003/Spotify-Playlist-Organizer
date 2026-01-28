/**
 * PlaylistSorter component - main interface for organizing tracks into playlists
 * Displays track information and allows quick sorting into multiple playlists
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import UnsavedChangesPopup from './popups/UnsavedChangesPopup';
import DiscardChangesPopup from './popups/DiscardChangesPopup';
import LocalFileError from './popups/LocalFileErrorPopup';
import LoadingOverlay from './ui/LoadingOverlay';
import MusicStreamingAPI from '../services/MusicStreamingAPI';

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  font-size: 1.2rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const TrackCounter = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--text-primary);
`;

/**
 * Main sorting container with modern card-based layout
 * Responsive grid that adapts to screen size
 */
const SorterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  margin-top: 80px;
  height: calc(100vh - 280px);
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
`;

/**
 * Base section styling with glassmorphism effect
 * Provides modern, fluid appearance with backdrop blur
 */
const Section = styled.div`
  background-color: rgba(40, 40, 40, 0.7);
  border-radius: 20px;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  
  &:hover {
    transform: translate3d(0, -2px, 0);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
    
    &:hover {
      background: #1ed760;
    }
  }
`;

const AlbumSection = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px 20px;
  gap: 10px;
  overflow: hidden;
`;

const AlbumArt = styled.img`
  width: 80%;
  max-width: 400px;
  max-height: 35vh;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
`;

const TrackInfo = styled.div`
  text-align: center;
  width: 100%;
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  
  h2 {
    font-size: clamp(1.8rem, 4vh, 2.5rem);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 700;
  }
  
  p {
    font-size: clamp(1.2rem, 2.5vh, 1.5rem);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const TrackMetadata = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  flex-shrink: 0;
  
  p {
    margin: 0;
    color: var(--text-primary);
    font-size: clamp(1.2rem, 2.5vh, 1.5rem);
    font-weight: 400;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 300px;
  padding: 8px 0;
`;

const MetadataLabel = styled.span`
  color: var(--text-secondary);
`;

const MetadataValue = styled.span`
  color: var(--text-primary);
  text-align: right;
`;

const GenreList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const GenreLabel = styled.p`
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.2rem, 2.5vh, 1.5rem);
  font-weight: 600;
  margin-bottom: 4px;
`;

const GenreItem = styled.span`
  color: var(--text-primary);
  font-size: clamp(1.1rem, 2.3vh, 1.4rem);
  font-weight: 400;
`;

const MetadataSection = styled(Section)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  gap: 15px;
  
  ${MetadataItem} {
    margin: 15px 0;
  }
  
  ${MetadataLabel} {
    font-size: 1.6rem;
  }
  
  ${MetadataValue} {
    font-size: 1.6rem;
  }
  
  ${GenreList} {
    font-size: 1.4rem;
  }
  
  ${GenreItem} {
    font-size: 1.4rem;
    margin: 5px 0;
  }
`;

/**
 * Playlist selection section with modern card styling
 * Contains all 10 playlist slots
 * overflow: visible allows dropdowns to extend beyond section boundaries
 * Disable transform to prevent stacking context issues with dropdowns
 */
const PlaylistsSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow: visible !important;
  padding: 28px 24px;
  position: relative;
  
  &:hover {
    transform: none !important;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--text-primary);
    text-align: center;
  }
`;

const PlaylistCheckbox = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: background-color;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 10px;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: ${props => props.variant === 'secondary' ? '#e91429' : 'var(--primary-color)'};
  color: white;
  border: none;
  padding: ${props => props.variant === 'nav' ? '16px 32px' : '12px 24px'};
  border-radius: 28px;
  cursor: pointer;
  font-weight: bold;
  font-size: ${props => props.variant === 'nav' ? '1.1rem' : '1rem'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  box-shadow: ${props => props.variant === 'nav' 
    ? '0 4px 16px rgba(29, 185, 84, 0.3)' 
    : props.variant === 'secondary' 
    ? '0 2px 8px rgba(233, 20, 41, 0.3)'
    : '0 2px 8px rgba(29, 185, 84, 0.2)'};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale3d(1.08, 1.08, 1)'};
    box-shadow: ${props => props.variant === 'nav' 
      ? '0 6px 20px rgba(29, 185, 84, 0.5)' 
      : props.variant === 'secondary' 
      ? '0 4px 12px rgba(233, 20, 41, 0.5)'
      : '0 4px 12px rgba(29, 185, 84, 0.4)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale3d(1.02, 1.02, 1)'};
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.variant === 'nav' ? '12px 24px' : '10px 20px'};
    font-size: ${props => props.variant === 'nav' ? '1rem' : '0.9rem'};
  }
`;

/**
 * Individual playlist entry row with modern spacing
 * Grid layout: number | playlist box | remove button
 * Dynamic z-index ensures dropdown appears above other entries
 */
const PlaylistEntry = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  gap: 14px;
  align-items: center;
  height: calc((100% - 90px) / 10);
  min-height: 52px;
  position: relative;
  z-index: ${props => props.isActive ? '9999' : '1'};
`;

/**
 * Playlist box with glassmorphism effect and dynamic borders
 * Shows selected (green) or unselected (red) state
 */
const PlaylistBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${props => props.isEmpty ? '12px 16px' : '10px 14px'};
  background: ${props => props.isEmpty 
    ? 'rgba(30, 30, 30, 0.6)' 
    : 'rgba(40, 40, 40, 0.85)'};
  backdrop-filter: blur(10px);
  border-radius: 12px;
  width: 100%;
  height: 100%;
  border: 2px solid ${props => {
    if (props.isEmpty) return 'rgba(255, 255, 255, 0.08)';
    return props.isSelected ? 'rgba(29, 185, 84, 0.8)' : 'rgba(233, 20, 41, 0.8)';
  }};
  cursor: ${props => !props.isEmpty ? 'pointer' : 'default'};
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  box-shadow: ${props => props.isEmpty 
    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
    : props.isSelected 
    ? '0 3px 12px rgba(29, 185, 84, 0.3)' 
    : '0 3px 12px rgba(233, 20, 41, 0.3)'};
  
  &:hover {
    background: ${props => props.isEmpty 
      ? 'rgba(35, 35, 35, 0.7)' 
      : 'rgba(50, 50, 50, 0.9)'};
    transform: ${props => !props.isEmpty ? 'translate3d(0, -1px, 0)' : 'none'};
    box-shadow: ${props => props.isEmpty 
      ? '0 3px 10px rgba(0, 0, 0, 0.25)' 
      : props.isSelected 
      ? '0 5px 16px rgba(29, 185, 84, 0.45)' 
      : '0 5px 16px rgba(233, 20, 41, 0.45)'};
  }
  
  &:active {
    transform: ${props => !props.isEmpty ? 'scale3d(0.98, 0.98, 1)' : 'none'};
  }
`;

/**
 * Playlist number indicator (0-9) with modern styling
 */
const PlaylistNumber = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-secondary);
  width: 28px;
  text-align: center;
  opacity: 0.85;
`;

/**
 * Wrapper for playlist search with relative positioning for dropdown
 * Higher z-index when active to ensure dropdown appears above other elements
 */
const PlaylistSearchBox = styled.div`
  flex: 1;
  position: relative;
  z-index: ${props => props.isActive ? '10000' : '1'};
`;

/**
 * Input field for playlist search/creation with modern styling
 */
const PlaylistInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  background: rgba(20, 20, 20, 0.9);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: border-color, background;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: rgba(25, 25, 25, 1);
    box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.15);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

/**
 * Dropdown menu for playlist selection with glassmorphism
 * High z-index ensures it appears above all other playlist entries
 */
const PlaylistDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(40, 40, 40, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  height: 250px;
  overflow-y: auto;
  z-index: 10001;
  border: 1.5px solid rgba(29, 185, 84, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin: 4px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
    
    &:hover {
      background: #1ed760;
    }
  }
`;

/**
 * Individual playlist option in dropdown with hover effects
 */
const PlaylistOption = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  cursor: pointer;
  height: 56px;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  border-radius: 8px;
  margin: 4px 6px;
  
  img, div {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.95rem;
  }
  
  &:hover {
    background: rgba(29, 185, 84, 0.2);
    transform: translate3d(4px, 0, 0);
  }
  
  &:active {
    transform: scale3d(0.98, 0.98, 1) translate3d(4px, 0, 0);
  }
`;

/**
 * Remove button with modern styling and hover effects
 * White X on red background for visibility
 */
const RemoveButton = styled.button`
  background: rgba(233, 20, 41, 0.15);
  border: 1.5px solid rgba(233, 20, 41, 0.5);
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  padding: 6px;
  opacity: 0.9;
  font-size: 20px;
  font-weight: 700;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  line-height: 1;
  
  &:hover {
    opacity: 1;
    background: rgba(233, 20, 41, 0.35);
    border-color: rgba(233, 20, 41, 0.9);
    transform: scale3d(1.1, 1.1, 1);
    color: #ffffff;
  }
  
  &:active {
    transform: scale3d(0.95, 0.95, 1);
  }
`;

const SpotifyEmbed = styled.iframe`
  width: 100%;
  height: clamp(70px, 10vh, 90px);
  border: none;
  flex-shrink: 0;
  border-radius: 12px;
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => (props.progress / props.total) * 100}%;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
  backface-visibility: hidden;
  z-index: 1000;
`;

/**
 * Container for playlist selection options (Select/Create buttons)
 */
const PlaylistSelectionOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
`;

/**
 * Individual selection option button with modern styling
 */
const SelectionOption = styled.button`
  padding: 10px 14px;
  background: rgba(29, 185, 84, 0.12);
  border: 1.5px solid rgba(29, 185, 84, 0.5);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    background: rgba(29, 185, 84, 0.2);
    border-color: rgba(29, 185, 84, 0.8);
    transform: translate3d(0, -1px, 0);
    box-shadow: 0 3px 8px rgba(29, 185, 84, 0.25);
  }
  
  &:active {
    transform: scale3d(0.98, 0.98, 1);
  }
`;


const TrackNumberInput = styled.input`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 18px;
  width: 50px;
  text-align: center;
  
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

/**
 * Background layer for crossfading between album arts
 */
const BackgroundLayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(20px);
  transform: scale(1.1);
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.6s ease-in-out;
  z-index: 0;
  pointer-events: none;
`;

/**
 * Main page container with dynamic background based on album cover
 * Creates a Spotify-style blurred album artwork background effect
 */
const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  z-index: 2;
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%);
  z-index: 1;
  pointer-events: none;
`;



const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
  
  @keyframes trackSlideNext {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes trackSlidePrev {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

/**
 * Playlist sorter component for organizing tracks
 * @param {string} accessToken - Spotify access token
 * @param {Object} user - User data from Spotify
 */
const PlaylistSorter = ({ accessToken, user }) => {
  const location = useLocation();
  const history = useHistory();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackMetadata, setTrackMetadata] = useState(null);
  const [artistData, setArtistData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlaylists, setSelectedPlaylists] = useState({});
  const [userPlaylists, setUserPlaylists] = useState(location.state?.userPlaylists || []);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filteredPlaylists, setFilteredPlaylists] = useState(location.state?.userPlaylists || []);
  const [totalTracks, setTotalTracks] = useState(0);
  const [nextTracksUrl, setNextTracksUrl] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showingSearchBox, setShowingSearchBox] = useState({});
  const [showingCreateNew, setShowingCreateNew] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState({});
  const [isLoadingPlaylistData, setIsLoadingPlaylistData] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Use ref for synchronous cache access across async operations
  const playlistTracksCache = useRef({});
  // Track which playlists have been fully loaded (all pages fetched)
  const fullyLoadedPlaylists = useRef(new Set());
  // Track ongoing fetch operations to prevent concurrent requests
  const ongoingFetches = useRef(new Map());
  const [jumpToTrack, setJumpToTrack] = useState('');
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedStates, setSelectedStates] = useState({});
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [userData, setUserData] = useState(user);
  const [showLocalFileError, setShowLocalFileError] = useState(false);
  const [slideDirection, setSlideDirection] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [previousBackground, setPreviousBackground] = useState(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData) {
        try {
          // Initialize API if not already done
          if (!MusicStreamingAPI.isInitialized()) {
            MusicStreamingAPI.initialize(accessToken, 'spotify');
          }
          
          const data = await MusicStreamingAPI.getUserData();
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [accessToken, userData]);

  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => {
        setSlideDirection(null);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  /**
   * Handle smooth background transitions when track changes
   * Preloads new image before crossfading to prevent black flash
   */
  useEffect(() => {
    const albumArtUrl = currentTrack?.album?.images?.[0]?.url;
    if (!albumArtUrl) return;
    
    // If background hasn't changed, do nothing
    if (albumArtUrl === currentBackground) return;
    
    // If this is the first track, set it immediately without fade
    if (!currentBackground) {
      setCurrentBackground(albumArtUrl);
      setBackgroundLoaded(true);
      return;
    }
    
    // Preload the new image before transitioning
    const img = new Image();
    img.onload = () => {
      // Move current to previous and hide new
      setPreviousBackground(currentBackground);
      setBackgroundLoaded(false);
      
      // Set new background
      setCurrentBackground(albumArtUrl);
      
      // Trigger fade-in after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBackgroundLoaded(true);
        });
      });
    };
    img.onerror = () => {
      // If image fails to load, still update to avoid being stuck
      setCurrentBackground(albumArtUrl);
      setBackgroundLoaded(true);
    };
    img.src = albumArtUrl;
  }, [currentTrack]);

  useEffect(() => {
    /**
     * Fetch initial tracks and populate cache with ALL tracks from current playlist
     * This ensures accurate track existence checks when current playlist is selected as target
     */
    const fetchInitialTracks = async () => {
      const playlistId = new URLSearchParams(location.search).get('playlist');
      
      try {
        // Initialize API if not already done
        if (!MusicStreamingAPI.isInitialized()) {
          MusicStreamingAPI.initialize(accessToken, 'spotify');
        }
        
        const data = await MusicStreamingAPI.getPlaylistTracks(playlistId, 50, 0);
        
        const trackList = data.items
          .map(item => item.track)
          .filter(track => track && !track.is_local);
        
        setTracks(trackList);
        setCurrentTrack(trackList[0]);
        setTotalTracks(data.total);
        setNextTracksUrl(data.next);
        
        const currentId = playlistId === 'liked' ? 'liked' : playlistId;
        const initialTrackIds = new Set(trackList.map(track => track.id));
        
        // Cache in both ref and state (initially only first 50)
        playlistTracksCache.current[currentId] = initialTrackIds;
        setPlaylistTracks(prev => ({
          ...prev,
          [currentId]: initialTrackIds
        }));
        
        console.log(`Loaded ${initialTrackIds.size} tracks (total: ${data.total})`);
        
        // Immediately start loading remaining tracks if there are more
        // This ensures the cache is complete for accurate existence checks
        if (trackList.length < 25 && data.next) {
          fetchMoreTracks();
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
        history.push('/main');
      }
    };

    const fetchUserPlaylists = async () => {
      if (!location.state?.userPlaylists) {
        try {
          // Initialize API if not already done
          if (!MusicStreamingAPI.isInitialized()) {
            MusicStreamingAPI.initialize(accessToken, 'spotify');
          }
          
          const data = await MusicStreamingAPI.getUserPlaylists(50, 0);
          const playlists = data.items;
          setUserPlaylists(playlists);
          setFilteredPlaylists(playlists);
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      }
    };

    if (accessToken) {
      fetchInitialTracks();
      fetchUserPlaylists();
    }
  }, [accessToken, location.search, history]);


  /**
   * Update playlist states whenever the current track changes
   * Checks track membership in all selected playlists and updates UI accordingly
   * Fetches and caches all playlist tracks if not already loaded
   */
  useEffect(() => {
    const updatePlaylistStates = async () => {
      if (!currentTrack) return;
      
      console.log(`Updating states for track: ${currentTrack.name}`);
      
      // Get list of playlists that need their tracks fetched
      const playlistsToFetch = [];
      for (const [index, playlist] of Object.entries(selectedPlaylists)) {
        if (!playlist) continue;
        if (!fullyLoadedPlaylists.current.has(playlist.id)) {
          playlistsToFetch.push(playlist);
        }
      }
      
      // If we need to fetch any playlists, show loading overlay and block interaction
      if (playlistsToFetch.length > 0) {
        setIsLoadingPlaylistData(true);
        
        // Fetch all playlists sequentially to avoid rate limiting
        for (let i = 0; i < playlistsToFetch.length; i++) {
          const playlist = playlistsToFetch[i];
          setLoadingMessage(`Loading playlist ${playlist.name}...`);
          // Force refetch to ensure ALL tracks are loaded
          await fetchPlaylistTracks(playlist.id, true);
          // Small delay between requests to avoid rate limiting
          if (i < playlistsToFetch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setIsLoadingPlaylistData(false);
        setLoadingMessage('');
      }
      
      const newSelectedStates = {};
      
      // Process each selected playlist using cached data
      for (const [index, playlist] of Object.entries(selectedPlaylists)) {
        if (!playlist) continue;
        
        // Get cached track IDs
        const trackIds = playlistTracksCache.current[playlist.id];
        const trackExists = trackIds?.has(currentTrack.id) || false;
        
        // Check for pending unsaved changes for this track/playlist combo
        const pendingChange = unsavedChanges.find(
          change => change.trackId === currentTrack.id && change.playlistId === playlist.id
        );
        
        // Priority: pending changes override actual state
        if (pendingChange) {
          newSelectedStates[playlist.id] = pendingChange.action === 'add';
        } else {
          newSelectedStates[playlist.id] = trackExists;
        }
      }
      
      setSelectedStates(newSelectedStates);
    };

    updatePlaylistStates();
  }, [currentTrack, selectedPlaylists, unsavedChanges]);

  const handleNext = useCallback(() => {
    // Block navigation during playlist data loading
    if (isLoadingPlaylistData) return;
    
    if (currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      
      setSlideDirection('next');
      
      if (nextTrack.is_local) {
        setShowLocalFileError(true);
        setCurrentIndex(prev => prev + 2);
        if (currentIndex + 2 < tracks.length) {
          setCurrentTrack(tracks[currentIndex + 2]);
        }
      } else {
        setCurrentIndex(prev => prev + 1);
        setCurrentTrack(nextTrack);
      }
      
      if (currentIndex >= tracks.length - 26 && nextTracksUrl) {
        fetchMoreTracks();
      }
    }
  }, [currentIndex, tracks, nextTracksUrl, isLoadingPlaylistData]);

  const handlePrevious = useCallback(() => {
    // Block navigation during playlist data loading
    if (isLoadingPlaylistData) return;
    
    if (currentIndex > 0) {
      const prevTrack = tracks[currentIndex - 1];
      
      setSlideDirection('prev');
      
      if (prevTrack.is_local) {
        setShowLocalFileError(true);
        setCurrentIndex(prev => prev - 2);
        if (currentIndex - 2 >= 0) {
          setCurrentTrack(tracks[currentIndex - 2]);
        }
      } else {
        setCurrentIndex(prev => prev - 1);
        setCurrentTrack(prevTrack);
      }
    }
  }, [currentIndex, tracks, isLoadingPlaylistData]);

  const togglePlaylist = useCallback((playlistId) => {
    const currentState = selectedStates[playlistId];
    const trackExists = playlistTracks[playlistId]?.has(currentTrack.id);
    
    setSelectedStates(prev => ({
      ...prev,
      [playlistId]: !currentState
    }));
    
    // Only add to unsavedChanges if the new state is different from the track's existence
    const newState = !currentState;
    if (newState !== trackExists) {
      setUnsavedChanges(prev => {
        // Remove any existing changes for this track/playlist combination
        const filtered = prev.filter(
          change => !(change.trackId === currentTrack.id && change.playlistId === playlistId)
        );
        
        // Add the new change
        return [...filtered, {
          trackId: currentTrack.id,
          playlistId: playlistId,
          action: newState ? 'add' : 'remove'
        }];
      });
    } else {
      // If the new state matches the track's existence, remove any pending changes
      setUnsavedChanges(prev => 
        prev.filter(change => !(change.trackId === currentTrack.id && change.playlistId === playlistId))
      );
    }
  }, [currentTrack, selectedStates, playlistTracks]);

  const handleKeyPress = useCallback((event) => {
    if (event.target.tagName === 'INPUT') return;

    switch (event.key) {
      case 'ArrowRight':
        handleNext();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        const num = parseInt(event.key);
        const index = num;
        const playlistAtIndex = selectedPlaylists[index];
        if (playlistAtIndex) {
          togglePlaylist(playlistAtIndex.id);
        }
        break;
      }
      default:
        break;
    }
  }, [handleNext, handlePrevious, selectedPlaylists, togglePlaylist]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  /**
   * Handle clicks outside of dropdown/search areas
   * Closes dropdown and resets search if no playlist is selected
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if we have an active dropdown or search box
      if (activeDropdown !== null || Object.values(showingSearchBox).some(val => val) || Object.values(showingCreateNew).some(val => val)) {
        // Check if click is outside playlist search areas
        const clickedElement = event.target;
        const isInsidePlaylistBox = clickedElement.closest('[data-playlist-search]');
        
        if (!isInsidePlaylistBox) {
          // Close active dropdown
          if (activeDropdown !== null) {
            setActiveDropdown(null);
            
            // If no playlist is selected for this slot, close the search box
            if (!selectedPlaylists[activeDropdown]) {
              setShowingSearchBox(prev => ({...prev, [activeDropdown]: false}));
            }
          }
          
          // Close any search boxes that don't have a playlist selected
          Object.keys(showingSearchBox).forEach(index => {
            if (showingSearchBox[index] && !selectedPlaylists[index]) {
              setShowingSearchBox(prev => ({...prev, [index]: false}));
            }
          });
          
          // Close any create new boxes that don't have a playlist selected
          Object.keys(showingCreateNew).forEach(index => {
            if (showingCreateNew[index] && !selectedPlaylists[index]) {
              setShowingCreateNew(prev => ({...prev, [index]: false}));
              setNewPlaylistName(prev => ({...prev, [index]: ''}));
            }
          });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown, showingSearchBox, showingCreateNew, selectedPlaylists]);

  /**
   * Add a track to a playlist
   * @param {string} playlistId - Playlist ID
   * @param {string} trackId - Track ID
   */
  const addTrackToPlaylist = async (playlistId, trackId) => {
    try {
      await MusicStreamingAPI.addTrackToPlaylist(playlistId, trackId);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  };

  /**
   * Remove a track from a playlist
   * @param {string} playlistId - Playlist ID
   * @param {string} trackId - Track ID
   */
  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      await MusicStreamingAPI.removeTrackFromPlaylist(playlistId, trackId);
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      throw error;
    }
  };

  /**
   * Save all pending changes to Spotify
   * Updates both ref cache and state cache to reflect changes without re-fetching
   */
  const handleSave = async () => {
    try {
      await Promise.all(unsavedChanges.map(async (change) => {
        const playlist = Object.values(selectedPlaylists).find(p => p.id === change.playlistId);
        if (!playlist) return;

        if (change.action === 'add') {
          await addTrackToPlaylist(playlist.id, change.trackId);
          
          // Update ref cache (synchronous)
          if (playlistTracksCache.current[playlist.id]) {
            playlistTracksCache.current[playlist.id].add(change.trackId);
          }
          
          // Update state cache (reactive)
          setPlaylistTracks(prev => ({
            ...prev,
            [playlist.id]: new Set([...(prev[playlist.id] || []), change.trackId])
          }));
        } else {
          await removeTrackFromPlaylist(playlist.id, change.trackId);
          
          // Update ref cache (synchronous)
          if (playlistTracksCache.current[playlist.id]) {
            playlistTracksCache.current[playlist.id].delete(change.trackId);
          }
          
          // Update state cache (reactive)
          setPlaylistTracks(prev => {
            const newSet = new Set(prev[playlist.id]);
            newSet.delete(change.trackId);
            return { ...prev, [playlist.id]: newSet };
          });
        }
      }));

      setUnsavedChanges([]);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  /**
   * Filter playlists based on search query
   * @param {string} query - Search query
   */
  const handlePlaylistSearch = (query) => {
    if (!userPlaylists?.length) return;
    
    const filtered = query 
      ? userPlaylists.filter(playlist => 
          playlist.name.toLowerCase().includes(query.toLowerCase())
        )
      : userPlaylists;
      
    setFilteredPlaylists(filtered);
  };

  /**
   * Select a playlist and check if current track exists in it
   * Fetches and caches all playlist tracks, blocks interaction during load
   */
  const selectPlaylist = async (index, playlist) => {
    // Close dropdown immediately to provide instant feedback
    setActiveDropdown(null);
    
    // Show global loading overlay to block all interactions
    setIsLoadingPlaylistData(true);
    setLoadingMessage(`Loading ${playlist.name}...`);
    
    // Add playlist to selected playlists immediately
    setSelectedPlaylists(prev => ({
      ...prev,
      [index]: playlist
    }));
    
    console.log(`Selecting playlist: ${playlist.name}`);
    
    // Force refetch to ensure we have ALL tracks
    const trackIds = await fetchPlaylistTracks(playlist.id, true);
    
    // Check if current track exists in this playlist
    const trackExists = trackIds?.has(currentTrack.id) || false;
    
    console.log(`Track exists: ${trackExists}, Total tracks: ${trackIds?.size || 0}`);
    
    // Show actual state from Spotify (green if exists, red if not)
    setSelectedStates(prev => ({
      ...prev,
      [playlist.id]: trackExists
    }));
    
    // Don't automatically add unsaved changes - user will toggle manually if they want
    
    // Clear loading state
    setIsLoadingPlaylistData(false);
    setLoadingMessage('');
  };

  /**
   * Remove a playlist from selection with unsaved changes check
   * @param {number} index - Playlist slot index
   */
  const removePlaylist = (index) => {
    const playlistToRemove = selectedPlaylists[index];
    
    if (playlistToRemove && unsavedChanges.some(change => 
      change.playlistId === playlistToRemove.id && change.trackId === currentTrack.id
    )) {
      setShowUnsavedPopup(true);
      setPendingAction({ type: 'removePlaylist', index });
    } else {
      removePlaylistConfirmed(index);
    }
  };

  /**
   * Confirm removal of a playlist from selection
   * @param {number} index - Playlist slot index
   */
  const removePlaylistConfirmed = (index) => {
    setSelectedPlaylists(prev => {
      const newPlaylists = {...prev};
      delete newPlaylists[index];
      return newPlaylists;
    });
  };

  /**
   * Fetch additional tracks for the current playlist being sorted
   * Updates both the tracks array and the cache to maintain consistency
   */
  const fetchMoreTracks = async () => {
    if (!nextTracksUrl || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      // Parse the next URL to get offset and limit
      const url = new URL(nextTracksUrl);
      const playlistId = new URLSearchParams(location.search).get('playlist');
      const offset = url.searchParams.get('offset') || 0;
      const limit = url.searchParams.get('limit') || 50;
      
      const data = await MusicStreamingAPI.getPlaylistTracks(playlistId, limit, offset);
      
      const newTracks = data.items
        .map(item => item.track)
        .filter(track => track && !track.is_local);
      
      // Update cache for current playlist with new track IDs
      const currentId = playlistId === 'liked' ? 'liked' : playlistId;
      
      if (playlistTracksCache.current[currentId]) {
        newTracks.forEach(track => {
          playlistTracksCache.current[currentId].add(track.id);
        });
      }
      
      setPlaylistTracks(prev => {
        const updatedSet = new Set(prev[currentId] || []);
        newTracks.forEach(track => updatedSet.add(track.id));
        return {
          ...prev,
          [currentId]: updatedSet
        };
      });
      
      setTracks(prev => [...prev, ...newTracks]);
      setNextTracksUrl(data.next);

      console.log(`Loaded ${newTracks.length} more tracks`);

      if (newTracks.length < 25 && data.next) {
        fetchMoreTracks();
      }
    } catch (error) {
      console.error('Error fetching more tracks:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  /**
   * Get list of playlists that haven't been selected yet
   * @returns {Array} Available playlists
   */
  const getAvailablePlaylists = () => {
    const selectedIds = Object.values(selectedPlaylists)
      .filter(Boolean)
      .map(playlist => playlist.id);
    return filteredPlaylists.filter(playlist => 
      !selectedIds.includes(playlist.id) && playlist.name !== 'DJ'
    );
  };

  /**
   * Create a new playlist for the current user
   * @param {string} name - Name of the playlist to create
   * @returns {Object|null} The newly created playlist or null on error
   */
  const createNewPlaylist = async (name) => {
    try {
      if (!userData?.id) {
        throw new Error('User data not available');
      }
      
      const newPlaylist = await MusicStreamingAPI.createPlaylist(
        userData.id,
        name,
        'Created by Playlist Sorter',
        false
      );
      
      // Initialize empty track set in both caches
      const emptySet = new Set();
      playlistTracksCache.current[newPlaylist.id] = emptySet;
      setPlaylistTracks(prev => ({
        ...prev,
        [newPlaylist.id]: emptySet
      }));
      
      // Mark as fully loaded (it's empty, so it's complete)
      fullyLoadedPlaylists.current.add(newPlaylist.id);
      
      // Add to available playlists if not already there
      setUserPlaylists(prev => {
        if (prev.some(p => p.id === newPlaylist.id)) {
          return prev;
        }
        return [...prev, newPlaylist];
      });
      
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  };

  /**
   * Handle keyboard events in playlist search box
   * @param {Event} e - Keyboard event
   * @param {number} index - Playlist slot index
   */
  const handleSearchKeyDown = (e, index) => {
    if (e.key === 'Escape') {
      setShowingSearchBox(prev => ({...prev, [index]: false}));
      setActiveDropdown(null);
    }
  };

  /**
   * Fetch ALL tracks from a playlist (handles pagination)
   * Caches track IDs in both ref (sync) and state (reactive) for reliability
   * @param {string} playlistId - The playlist ID
   * @param {boolean} forceRefetch - Force refetch even if cached
   * @returns {Promise<Set>} Set of all track IDs in the playlist
   */
  const fetchPlaylistTracks = async (playlistId, forceRefetch = false) => {
    if (!playlistId) {
      console.warn('Attempted to fetch tracks for undefined playlist ID');
      return new Set();
    }
    
    // Check if playlist is fully loaded and cached (unless forcing refetch)
    if (!forceRefetch && fullyLoadedPlaylists.current.has(playlistId)) {
      console.log(`Using cached tracks for playlist: ${playlistTracksCache.current[playlistId]?.size || 0} tracks`);
      return playlistTracksCache.current[playlistId];
    }
    
    // If a fetch is already ongoing for this playlist, wait for it
    if (ongoingFetches.current.has(playlistId)) {
      console.log(`Fetch in progress, waiting...`);
      return ongoingFetches.current.get(playlistId);
    }
    
    // If forcing refetch, clear the fully loaded flag
    if (forceRefetch) {
      fullyLoadedPlaylists.current.delete(playlistId);
    }
    
    console.log(`Fetching playlist tracks${forceRefetch ? ' (forced)' : ''}...`);
    
    // Create a promise for this fetch and store it
    const fetchPromise = (async () => {
      try {
        // Use the adapter's getAllPlaylistTracks method
        const allTrackIds = await MusicStreamingAPI.getAllPlaylistTracks(playlistId);
        
        console.log(`Loaded ${allTrackIds.size} tracks for playlist ${playlistId}`);
        
        // Cache in ref (synchronous)
        playlistTracksCache.current[playlistId] = allTrackIds;
        
        // Cache in state (reactive for UI updates)
        setPlaylistTracks(prev => ({
          ...prev,
          [playlistId]: allTrackIds
        }));
        
        // Mark this playlist as fully loaded
        fullyLoadedPlaylists.current.add(playlistId);
        
        return allTrackIds;
      } catch (error) {
        console.error(`Error fetching playlist tracks for ${playlistId}:`, error);
        return new Set();
      } finally {
        // Remove from ongoing fetches when complete
        ongoingFetches.current.delete(playlistId);
      }
    })();
    
    // Store the promise so concurrent calls can await it
    ongoingFetches.current.set(playlistId, fetchPromise);
    
    return fetchPromise;
  };

  /**
   * Handle track number input for jumping to specific track
   * @param {Event} e - Input change event
   */
  const handleTrackNumberInput = (e) => {
    const value = e.target.value;
    setJumpToTrack(value);
    
    const num = parseInt(value);
    if (num && num > 0 && num <= totalTracks) {
      setCurrentIndex(num - 1);
      setCurrentTrack(tracks[num - 1]);
    }
  };

  /**
   * Handle back button click with unsaved changes check
   */
  const handleBack = () => {
    if (unsavedChanges.length > 0) {
      setShowUnsavedPopup(true);
      setPendingAction('back');
    } else {
      history.push('/main');
    }
  };

  /**
   * Handle profile button click with unsaved changes check
   */
  const handleProfileClick = () => {
    if (unsavedChanges.length > 0) {
      setShowUnsavedPopup(true);
      setPendingAction('settings');
    } else {
      history.push('/settings');
    }
  };

  /**
   * Handle popup action (save/discard/cancel)
   * @param {string} action - Action to perform
   */
  const handlePopupAction = async (action) => {
    if (action === 'save') {
      await handleSave();
    } else if (action === 'discard') {
      setUnsavedChanges([]);
    }

    // Execute pending action after save/discard
    if (pendingAction === 'back') {
      history.push('/main');
    } else if (pendingAction === 'settings') {
      history.push('/settings');
    } else if (pendingAction?.type === 'removePlaylist') {
      removePlaylistConfirmed(pendingAction.index);
    }

    setShowUnsavedPopup(false);
    setPendingAction(null);
  };

  /**
   * Handle navigation from local file error popup
   */
  const handleLocalFileNext = () => {
    setShowLocalFileError(false);
    handleNext();
  };

  const handleLocalFilePrevious = () => {
    setShowLocalFileError(false);
    handlePrevious();
  };

  /**
   * Fetch artist data for the current track
   */
  useEffect(() => {
    const fetchArtistData = async () => {
      if (!currentTrack) return;
      
      try {
        const artist = await MusicStreamingAPI.getArtistData(currentTrack.artists[0].id);
        setArtistData(artist);
        setTrackMetadata({});
      } catch (error) {
        console.error('Error fetching artist data:', error);
      }
    };

    fetchArtistData();
  }, [currentTrack, accessToken]);

  if (!currentTrack || !artistData) {
    return (
      <>
        <GlobalStyle />
        <LoadingOverlay message="Loading playlist..." />
      </>
    );
  }

  /**
   * Format duration from milliseconds to MM:SS
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <>
      <GlobalStyle />
      {/* Background layers for smooth crossfade */}
      <BackgroundLayer src={previousBackground} visible={!!previousBackground && !backgroundLoaded} />
      <BackgroundLayer src={currentBackground} visible={backgroundLoaded} />
      <BackgroundOverlay />
      
      <PageContainer>
        <ProgressBar 
          progress={currentIndex + 1} 
          total={totalTracks}
        />
        <BackButton onClick={handleBack}>
          <ArrowBackIcon /> Back
        </BackButton>

        <TrackCounter>
          <TrackNumberInput 
            value={jumpToTrack || currentIndex + 1}
            onChange={handleTrackNumberInput}
            onBlur={() => setJumpToTrack('')}
            type="number"
            min="1"
            max={totalTracks}
          /> / {totalTracks}
          {isLoadingMore && <span> (Loading more...)</span>}
        </TrackCounter>

        <SorterContainer>
          <AlbumSection
            key={currentTrack.id}
            style={{
              animation:
                slideDirection === 'next'
                  ? 'trackSlideNext 0.25s ease-out'
                  : slideDirection === 'prev'
                  ? 'trackSlidePrev 0.25s ease-out'
                  : 'none',
            }}
          >
            <AlbumArt src={currentTrack.album.images[0].url} alt="Album Art" />
            <TrackInfo>
              <h2>{currentTrack.name}</h2>
              <p>{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
              <p>{currentTrack.album.name}</p>
            </TrackInfo>
            <TrackMetadata>
              <p>Duration: {formatDuration(currentTrack.duration_ms)}</p>
              {artistData?.genres?.length > 0 && (
                <GenreList>
                  <GenreLabel>Artist Genre:</GenreLabel>
                  {artistData.genres
                    .slice(0, 3)
                    .map((genre, index) => (
                      <GenreItem key={index}>
                        {genre
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </GenreItem>
                    ))}
                </GenreList>
              )}
            </TrackMetadata>
            <SpotifyEmbed 
              src={`https://open.spotify.com/embed/track/${currentTrack.id}`}
              allow="encrypted-media"
            />
          </AlbumSection>

          <PlaylistsSection>
            {Array.from({length: 10}).map((_, index) => (
              <PlaylistEntry key={index} isActive={activeDropdown === index}>
                <PlaylistNumber>{index}</PlaylistNumber>
                <PlaylistBox 
                  isEmpty={!selectedPlaylists[index]}
                  isSelected={selectedStates[selectedPlaylists[index]?.id]}
                  onClick={() => {
                    if (selectedPlaylists[index]) {
                      togglePlaylist(selectedPlaylists[index].id);
                    }
                  }}
                >
                  {selectedPlaylists[index] ? (
                    <>
                      {selectedPlaylists[index].images && selectedPlaylists[index].images.length > 0 ? (
                        <img 
                          src={selectedPlaylists[index].images[0].url} 
                          alt="" 
                          style={{
                            width: 44, 
                            height: 44, 
                            borderRadius: 8, 
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: 44, 
                          height: 44, 
                          background: 'rgba(40, 40, 40, 0.8)', 
                          borderRadius: 8,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }} />
                      )}
                      <span style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}>{selectedPlaylists[index].name}</span>
                    </>
                  ) : (
                    <PlaylistSearchBox isActive={activeDropdown === index} data-playlist-search>
                      {!showingSearchBox[index] && !showingCreateNew[index] ? (
                        <PlaylistSelectionOptions>
                          <SelectionOption 
                            onClick={() => {
                              setShowingSearchBox(prev => ({...prev, [index]: true}));
                              setTimeout(() => {
                                const input = document.querySelector(`#playlist-search-${index}`);
                                if (input) input.focus();
                              }, 0);
                            }}
                          >
                            Select A Playlist
                          </SelectionOption>
                          <SelectionOption onClick={() => setShowingCreateNew(prev => ({...prev, [index]: true}))}>
                            Create New Playlist
                          </SelectionOption>
                        </PlaylistSelectionOptions>
                      ) : showingCreateNew[index] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                          <PlaylistInput
                            placeholder="Enter playlist name..."
                            value={newPlaylistName[index] || ''}
                            onChange={(e) => setNewPlaylistName(prev => ({...prev, [index]: e.target.value}))}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && newPlaylistName[index]?.trim()) {
                                e.preventDefault();
                                const newPlaylist = await createNewPlaylist(newPlaylistName[index]);
                                if (newPlaylist) {
                                  selectPlaylist(index, newPlaylist);
                                  setNewPlaylistName(prev => ({...prev, [index]: ''}));
                                  setShowingCreateNew(prev => ({...prev, [index]: false}));
                                }
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setShowingCreateNew(prev => ({...prev, [index]: false}));
                                setNewPlaylistName(prev => ({...prev, [index]: ''}));
                              }
                            }}
                          />
                          <RemoveButton onClick={() => {
                            setShowingCreateNew(prev => ({...prev, [index]: false}));
                            setNewPlaylistName(prev => ({...prev, [index]: ''}));
                          }}>×</RemoveButton>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                          <PlaylistInput 
                            id={`playlist-search-${index}`}
                            placeholder="Select A Playlist"
                            autoFocus
                            onFocus={() => setActiveDropdown(index)}
                            onChange={(e) => handlePlaylistSearch(e.target.value)}
                            onKeyDown={(e) => handleSearchKeyDown(e, index)}
                          />
                          <RemoveButton 
                            onClick={() => {
                              setShowingSearchBox(prev => ({...prev, [index]: false}));
                              setActiveDropdown(null);
                            }}
                          >
                            ×
                          </RemoveButton>
                        </div>
                      )}
                      {activeDropdown === index && (
                        <PlaylistDropdown data-playlist-search>
                          {getAvailablePlaylists().map(playlist => (
                            <PlaylistOption 
                              key={playlist.id}
                              onClick={() => {
                                selectPlaylist(index, playlist);
                                setShowingSearchBox(prev => ({...prev, [index]: false}));
                              }}
                            >
                              {playlist.images && playlist.images.length > 0 ? (
                                <img 
                                  src={playlist.images[0].url} 
                                  alt=""
                                  style={{
                                    objectFit: 'cover',
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                                  }}
                                />
                              ) : (
                                <div style={{ 
                                  width: 36, 
                                  height: 36, 
                                  background: 'rgba(40, 40, 40, 0.8)', 
                                  borderRadius: 6,
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                                }} />
                              )}
                              <span>{playlist.name}</span>
                            </PlaylistOption>
                          ))}
                        </PlaylistDropdown>
                      )}
                    </PlaylistSearchBox>
                  )}
                </PlaylistBox>
                {selectedPlaylists[index] && (
                  <RemoveButton onClick={() => removePlaylist(index)}>×</RemoveButton>
                )}
              </PlaylistEntry>
            ))}
          </PlaylistsSection>
        </SorterContainer>

        <NavigationButtons>
          <Button onClick={handlePrevious} disabled={currentIndex === 0 || isLoadingPlaylistData} variant="nav">
            ← Previous
          </Button>
          <Button 
            onClick={() => {
              setUnsavedChanges([]);
              setShowDiscardPopup(true);
            }} 
            variant="secondary"
            disabled={isLoadingPlaylistData}
          >
            Discard
          </Button>
          <Button onClick={handleSave} disabled={isLoadingPlaylistData}>
            Save
          </Button>
          <Button onClick={handleNext} disabled={currentIndex === tracks.length - 1 || isLoadingPlaylistData} variant="nav">
            Next →
          </Button>
        </NavigationButtons>

        {showUnsavedPopup && (
          <UnsavedChangesPopup
            onSave={() => handlePopupAction('save')}
            onDiscard={() => handlePopupAction('discard')}
            onCancel={() => {
              setShowUnsavedPopup(false);
              setPendingAction(null);
            }}
          />
        )}

        {showDiscardPopup && (
          <DiscardChangesPopup onClose={() => setShowDiscardPopup(false)} />
        )}

        {showLocalFileError && (
          <LocalFileError 
            onPrevious={handleLocalFilePrevious}
            onNext={handleLocalFileNext}
            hasNextTrack={currentIndex < tracks.length - 1}
          />
        )}
      </PageContainer>
      
      {isLoadingPlaylistData && (
        <LoadingOverlay message={loadingMessage || 'Loading playlist data...'} />
      )}
    </>
  );
};

export default PlaylistSorter; 