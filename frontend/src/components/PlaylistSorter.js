import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const SHOW_AUDIO_FEATURES = false;

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
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
  ${!SHOW_AUDIO_FEATURES && `
    justify-content: center;
    align-items: center;
    font-size: 1.4rem;
    
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
  `}
  gap: 15px;
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
  transition: background-color 0.2s ease;

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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.variant === 'nav' 
    ? '0 4px 16px rgba(29, 185, 84, 0.3)' 
    : props.variant === 'secondary' 
    ? '0 2px 8px rgba(233, 20, 41, 0.3)'
    : '0 2px 8px rgba(29, 185, 84, 0.2)'};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.08)'};
    box-shadow: ${props => props.variant === 'nav' 
      ? '0 6px 20px rgba(29, 185, 84, 0.5)' 
      : props.variant === 'secondary' 
      ? '0 4px 12px rgba(233, 20, 41, 0.5)'
      : '0 4px 12px rgba(29, 185, 84, 0.4)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(1.02)'};
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
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.isEmpty 
    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
    : props.isSelected 
    ? '0 3px 12px rgba(29, 185, 84, 0.3)' 
    : '0 3px 12px rgba(233, 20, 41, 0.3)'};
  
  &:hover {
    background: ${props => props.isEmpty 
      ? 'rgba(35, 35, 35, 0.7)' 
      : 'rgba(50, 50, 50, 0.9)'};
    transform: ${props => !props.isEmpty ? 'translateY(-1px)' : 'none'};
    box-shadow: ${props => props.isEmpty 
      ? '0 3px 10px rgba(0, 0, 0, 0.25)' 
      : props.isSelected 
      ? '0 5px 16px rgba(29, 185, 84, 0.45)' 
      : '0 5px 16px rgba(233, 20, 41, 0.45)'};
  }
  
  &:active {
    transform: ${props => !props.isEmpty ? 'scale(0.98)' : 'none'};
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
    transform: translateX(4px);
  }
  
  &:active {
    transform: scale(0.98) translateX(4px);
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  
  &:hover {
    opacity: 1;
    background: rgba(233, 20, 41, 0.35);
    border-color: rgba(233, 20, 41, 0.9);
    transform: scale(1.1);
    color: #ffffff;
  }
  
  &:active {
    transform: scale(0.95);
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
  transition: width 0.3s ease;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    background: rgba(29, 185, 84, 0.2);
    border-color: rgba(29, 185, 84, 0.8);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(29, 185, 84, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const GlobalLoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #1DB954;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  max-width: 80%;
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
 * Main page container with dynamic background based on album cover
 * Creates a Spotify-style blurred album artwork background effect
 */
const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #121212;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: ${props => props.albumArt ? `url(${props.albumArt})` : 'none'};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: ${props => props.albumArt ? '1' : '0'};
    z-index: 0;
    transition: background-image 0.5s ease-in-out, opacity 0.5s ease-in-out;
    filter: blur(20px);
    transform: scale(1.1);
  }
  
  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%);
    z-index: 0;
    pointer-events: none;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: var(--surface-color);
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const PopupButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const UnsavedChangesPopup = ({ onSave, onDiscard, onCancel }) => (
  <PopupOverlay>
    <PopupContent>
      <h3>Unsaved Changes</h3>
      <p>You have unsaved changes. What would you like to do?</p>
      <PopupButtons>
        <Button onClick={onSave}>Save Changes</Button>
        <Button onClick={onDiscard}>Discard Changes</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </PopupButtons>
    </PopupContent>
  </PopupOverlay>
);

const DiscardChangesPopup = ({ onClose }) => (
  <PopupOverlay>
    <PopupContent>
      <h3>Changes Discarded</h3>
      <p>All changes have been discarded.</p>
      <PopupButtons>
        <Button onClick={onClose}>OK</Button>
      </PopupButtons>
    </PopupContent>
  </PopupOverlay>
);

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
`;

const ProfileButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease;
  position: absolute;
  top: 20px;
  right: 20px;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
  }
`;

const LocalFileErrorPopup = styled(PopupContent)`
  background: var(--surface-color);
  max-width: 300px;
  padding: 20px;
`;

const LocalFileError = ({ onPrevious, onNext, hasNextTrack }) => (
  <PopupOverlay>
    <LocalFileErrorPopup>
      <h3>Sorry, Local Files Not Allowed</h3>
      <p>This track cannot be processed as it is a local file.</p>
      <PopupButtons>
        <Button onClick={onPrevious}>Previous</Button>
        {hasNextTrack && <Button onClick={onNext}>Next</Button>}
      </PopupButtons>
    </LocalFileErrorPopup>
  </PopupOverlay>
);

const GlobalStyle = createGlobalStyle`
  body {
    overflow: hidden;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  @keyframes trackSlideNext {
    0% {
      opacity: 0;
      transform: translateX(50px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes trackSlidePrev {
    0% {
      opacity: 0;
      transform: translateX(-50px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

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
  const [backgroundColors, setBackgroundColors] = useState(['#000', '#000', '#000', '#000', '#000']);
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedStates, setSelectedStates] = useState({});
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [userData, setUserData] = useState(user);
  const [showLocalFileError, setShowLocalFileError] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [audioFeaturesCache, setAudioFeaturesCache] = useState({});
  const [slideDirection, setSlideDirection] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData) {
        try {
          const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          
          if (!response.ok) throw new Error('Failed to fetch user data');
          
          const data = await response.json();
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
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  useEffect(() => {
    /**
     * Fetch initial tracks and populate cache with ALL tracks from current playlist
     * This ensures accurate track existence checks when current playlist is selected as target
     */
    const fetchInitialTracks = async () => {
      const playlistId = new URLSearchParams(location.search).get('playlist');
      const endpoint = playlistId === 'liked' 
        ? 'https://api.spotify.com/v1/me/tracks?limit=50'
        : `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
      
      try {
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const trackList = data.items
          .map(item => item.track)
          .filter(track => track && !track.is_local);
        
        if (SHOW_AUDIO_FEATURES) {
          const trackIds = trackList.map(track => track.id).join(',');
          try {
            const audioResponse = await fetch(
              `https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              }
            );

            if (audioResponse.ok) {
              const { audio_features } = await audioResponse.json();
              const newCache = {};
              audio_features.forEach((features, index) => {
                if (features) {
                  newCache[trackList[index].id] = features;
                }
              });
              setAudioFeaturesCache(prev => ({...prev, ...newCache}));
            }
          } catch (error) {
            console.error('Error fetching audio features:', error);
          }
        }
        
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
        
        console.log(`Initial load: ${initialTrackIds.size} tracks cached for ${currentId}, total: ${data.total}`);
        
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
          const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const data = await response.json();
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
      
      console.log(`\n=== Updating states for track: ${currentTrack.name} ===`);
      
      // Get list of playlists that need their tracks fetched
      // Check if they're fully loaded, not just if cache exists
      const playlistsToFetch = [];
      for (const [index, playlist] of Object.entries(selectedPlaylists)) {
        if (!playlist) continue;
        // Only skip if this playlist has been fully loaded
        if (!fullyLoadedPlaylists.current.has(playlist.id)) {
          playlistsToFetch.push(playlist);
          console.log(`Playlist "${playlist.name}" needs to be fully loaded`);
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
        
        console.log(`  ${playlist.name}: exists=${trackExists}, cache_size=${trackIds?.size || 0}`);
        
        // Check for pending unsaved changes for this track/playlist combo
        const pendingChange = unsavedChanges.find(
          change => change.trackId === currentTrack.id && change.playlistId === playlist.id
        );
        
        // Priority: pending changes override actual state
        if (pendingChange) {
          newSelectedStates[playlist.id] = pendingChange.action === 'add';
          console.log(`  Pending change: ${pendingChange.action}`);
        } else {
          // Show actual state from Spotify
          newSelectedStates[playlist.id] = trackExists;
        }
      }
      
      console.log('Setting states:', newSelectedStates);
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

  const addTrackToPlaylist = async (playlistId, trackId) => {
    try {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        })
      });
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  };

  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [{
            uri: `spotify:track:${trackId}`
          }]
        })
      });
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
    
    console.log(`\n=== Selecting playlist "${playlist.name}" ===`);
    console.log(`Playlist ID: ${playlist.id}`);
    console.log(`Current track: ${currentTrack.name} (${currentTrack.id})`);
    
    // ALWAYS force refetch when selecting a playlist to ensure we have ALL tracks
    // This prevents issues with partial caches from previous operations
    console.log('⚠ Forcing complete refetch to ensure ALL tracks are loaded');
    
    // Fetch all tracks from playlist and cache them
    const trackIds = await fetchPlaylistTracks(playlist.id, true);
    
    // Check if current track exists in this playlist using cached data
    const trackExists = trackIds?.has(currentTrack.id) || false;
    
    console.log(`Track exists in playlist: ${trackExists}`);
    console.log(`Total tracks in playlist: ${trackIds?.size || 0}`);
    
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
      const response = await fetch(nextTracksUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const newTracks = data.items
        .map(item => item.track)
        .filter(track => track && !track.is_local);
      
      // Update cache for current playlist with new track IDs
      const playlistId = new URLSearchParams(location.search).get('playlist');
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
      
      if (SHOW_AUDIO_FEATURES) {
        const trackIds = newTracks.map(track => track.id).join(',');
        try {
          const audioResponse = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            }
          );

          if (audioResponse.ok) {
            const { audio_features } = await audioResponse.json();
            const newCache = {};
            audio_features.forEach((features, index) => {
              if (features) {
                newCache[newTracks[index].id] = features;
              }
            });
            setAudioFeaturesCache(prev => ({...prev, ...newCache}));
          }
        } catch (error) {
          console.error('Error fetching audio features:', error);
        }
      }
      
      setTracks(prev => [...prev, ...newTracks]);
      setNextTracksUrl(data.next);

      console.log(`Loaded ${newTracks.length} more tracks. Total cached for ${currentId}: ${playlistTracksCache.current[currentId]?.size || 0}`);

      if (newTracks.length < 25 && data.next) {
        fetchMoreTracks();
      }
    } catch (error) {
      console.error('Error fetching more tracks:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getAvailablePlaylists = () => {
    const selectedIds = Object.values(selectedPlaylists)
      .filter(Boolean)
      .map(playlist => playlist.id);
    return filteredPlaylists.filter(playlist => 
      !selectedIds.includes(playlist.id) && playlist.name !== 'DJ'
    );
  };

  const createNewPlaylist = async (name) => {
    try {
      // First get the user's ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      
      // Create the playlist
      const createResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          public: false,
          description: 'Created by Playlist Sorter'
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create playlist');
      }
      
      const newPlaylist = await createResponse.json();
      
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

  const handleSearchKeyDown = (e, index) => {
    if (e.key === 'Escape') {
      setShowingSearchBox(prev => ({...prev, [index]: false}));
      setActiveDropdown(null);
    }
  };

  /**
   * Fetch ALL tracks from a playlist (handles pagination)
   * Caches track IDs in both ref (sync) and state (reactive) for reliability
   * @param {string} playlistId - The Spotify playlist ID
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
      console.log(`Using cached tracks for ${playlistId}: ${playlistTracksCache.current[playlistId]?.size || 0} tracks (fully loaded)`);
      return playlistTracksCache.current[playlistId];
    }
    
    // If a fetch is already ongoing for this playlist, wait for it
    if (ongoingFetches.current.has(playlistId)) {
      console.log(`Fetch already in progress for ${playlistId}, waiting...`);
      return ongoingFetches.current.get(playlistId);
    }
    
    // If forcing refetch, clear the fully loaded flag
    if (forceRefetch) {
      fullyLoadedPlaylists.current.delete(playlistId);
    }
    
    console.log(`Fetching all tracks for playlist ${playlistId}${forceRefetch ? ' (forced refetch)' : ''}...`);
    
    // Create a promise for this fetch and store it
    const fetchPromise = (async () => {
      try {
        let allTrackIds = new Set();
        let trackDetails = []; // Store track info for debugging
        // Use fields parameter to fetch only Spotify URLs for efficiency
        let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track(external_urls.spotify)),next,offset,limit,total`;
        let pageCount = 0;
        let initialTotal = null; // Track the initial total from first page
        let currentTotal = 0;
        const MAX_PAGES = 200; // Safety limit: 200 pages * 50 tracks = 10,000 tracks max
        
        /**
         * Extracts track ID from Spotify URL
         * Format: https://open.spotify.com/track/{track_id}
         * @param {string} spotifyUrl - The Spotify track URL
         * @returns {string|null} - The track ID or null if invalid
         */
        const extractTrackIdFromUrl = (spotifyUrl) => {
          if (!spotifyUrl) return null;
          const match = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
          return match ? match[1] : null;
        };
        
        // Fetch all pages of tracks
        while (nextUrl && pageCount < MAX_PAGES) {
          pageCount++;
          console.log(`  Fetching page ${pageCount} for ${playlistId}...`);
          
          const response = await fetch(nextUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            console.error(`HTTP error on page ${pageCount}! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          console.log(`  📊 API Response Debug for page ${pageCount}:`);
          console.log(`     - data.items.length: ${data.items?.length || 0}`);
          console.log(`     - data.total: ${data.total}`);
          console.log(`     - data.offset: ${data.offset}`);
          console.log(`     - data.limit: ${data.limit}`);
          console.log(`     - data.next: ${data.next ? 'EXISTS' : 'NULL'}`);
          if (data.next) {
            // Extract offset from next URL for debugging
            const nextUrlObj = new URL(data.next);
            const nextOffset = nextUrlObj.searchParams.get('offset');
            const nextLimit = nextUrlObj.searchParams.get('limit');
            console.log(`     - Next will request: offset=${nextOffset}, limit=${nextLimit}`);
          }
          
          // Store the initial total from the first page
          if (initialTotal === null) {
            initialTotal = data.total;
          }
          currentTotal = data.total;
          
          // Add track IDs from this page with detailed tracking
          let pageTrackCount = 0;
          let nullTracks = 0;
          let tracksWithoutId = 0;
          let duplicateTracks = 0;
          
          data.items.forEach((item, idx) => {
            if (!item.track) {
              nullTracks++;
            } else if (!item.track.external_urls?.spotify) {
              tracksWithoutId++;
              console.log(`     - Track at index ${idx} has no Spotify URL`);
            } else {
              // Extract track ID from Spotify URL
              const trackId = extractTrackIdFromUrl(item.track.external_urls.spotify);
              if (!trackId) {
                tracksWithoutId++;
                console.log(`     - Track at index ${idx} has invalid Spotify URL:`, item.track.external_urls.spotify);
              } else {
                const sizeBefore = allTrackIds.size;
                allTrackIds.add(trackId);
                if (allTrackIds.size === sizeBefore) {
                  duplicateTracks++;
                } else {
                  pageTrackCount++;
                  // Store track details for debugging
                  trackDetails.push({
                    id: trackId,
                    url: item.track.external_urls.spotify
                  });
                }
              }
            }
          });
          
          console.log(`  📈 Page ${pageCount} Results:`);
          console.log(`     - Valid tracks added: ${pageTrackCount}`);
          console.log(`     - Null tracks: ${nullTracks}`);
          console.log(`     - Tracks without ID: ${tracksWithoutId}`);
          console.log(`     - Duplicate tracks: ${duplicateTracks}`);
          console.log(`     - Total unique tracks so far: ${allTrackIds.size}/${currentTotal}`);
          
          // Use Spotify's next URL - trust the API response
          nextUrl = data.next;
          
          if (nextUrl) {
            console.log(`     - Next URL exists, continuing to page ${pageCount + 1}...`);
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            console.log(`     - No next URL, pagination complete`);
          }
        }
        
        // Warn if we hit the page limit
        if (pageCount >= MAX_PAGES && nextUrl) {
          console.warn(`⚠ Hit maximum page limit (${MAX_PAGES}) for ${playlistId}. Some tracks may not be fetched.`);
        }
        
        console.log(`\n✓ FETCH SUMMARY for ${playlistId}:`);
        console.log(`   - Pages fetched: ${pageCount}`);
        console.log(`   - Unique tracks collected: ${allTrackIds.size}`);
        console.log(`   - API reported total: ${currentTotal}`);
        console.log(`\n   📋 Sample tracks (first 10 of ${trackDetails.length}):`);
        trackDetails.slice(0, 10).forEach((track, i) => {
          console.log(`      ${i + 1}. [${track.id}] ${track.url}`);
        });
        
        // Cache in ref (synchronous)
        playlistTracksCache.current[playlistId] = allTrackIds;
        
        // Cache in state (reactive for UI updates)
        setPlaylistTracks(prev => ({
          ...prev,
          [playlistId]: allTrackIds
        }));
        
        // Mark this playlist as fully loaded
        fullyLoadedPlaylists.current.add(playlistId);
        console.log(`Marked ${playlistId} as fully loaded`);
        
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

  const handleTrackNumberInput = (e) => {
    const value = e.target.value;
    setJumpToTrack(value);
    
    const num = parseInt(value);
    if (num && num > 0 && num <= totalTracks) {
      setCurrentIndex(num - 1);
      setCurrentTrack(tracks[num - 1]);
    }
  };

  const getColorPalette = async (imageUrl) => {
    try {
      const img = document.createElement('img');
      img.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
      const colors = [];
      
      const samplePoints = [
        { x: 0, y: 0 },                    // Top left
        { x: sampleSize - 1, y: 0 },       // Top right
        { x: sampleSize - 1, y: sampleSize - 1 }, // Bottom right
        { x: 0, y: sampleSize - 1 },       // Bottom left
        { x: Math.floor(sampleSize / 2), y: Math.floor(sampleSize / 2) } // Center
      ];
      
      for (const point of samplePoints) {
        const i = (point.y * sampleSize + point.x) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        colors.push(`rgba(${r},${g},${b},0.8)`);
      }
      
      return colors;
    } catch (error) {
      console.error('Error generating color palette:', error);
      return ['rgba(30,30,30,0.8)', 'rgba(50,50,50,0.8)', 'rgba(70,70,70,0.8)', 'rgba(40,40,40,0.8)', 'rgba(60,60,60,0.8)'];
    }
  };

  useEffect(() => {
    if (currentTrack?.album?.images?.[0]?.url) {
      getColorPalette(currentTrack.album.images[0].url)
        .then(colors => setBackgroundColors(colors));
    }
  }, [currentTrack]);

  const handleBack = () => {
    const hasUnsavedChanges = unsavedChanges.length > 0;
    if (hasUnsavedChanges) {
      setShowUnsavedPopup(true);
      setPendingAction('back');
    } else {
      history.push('/main');
    }
  };

  const handleProfileClick = () => {
    const hasUnsavedChanges = unsavedChanges.length > 0;
    if (hasUnsavedChanges) {
      setShowUnsavedPopup(true);
      setPendingAction('settings');
    } else {
      history.push('/settings');
    }
  };

  const handlePopupAction = async (action) => {
    if (action === 'save') {
      await handleSave();
      if (pendingAction === 'back') {
        history.push('/main');
      } else if (pendingAction === 'settings') {
        history.push('/settings');
      } else if (pendingAction.type === 'removePlaylist') {
        removePlaylistConfirmed(pendingAction.index);
      }
    } else if (action === 'discard') {
      if (pendingAction === 'back') {
        history.push('/main');
      } else if (pendingAction === 'settings') {
        history.push('/settings');
      } else if (pendingAction.type === 'removePlaylist') {
        removePlaylistConfirmed(pendingAction.index);
      }
      setUnsavedChanges([]);
    }
    setShowUnsavedPopup(false);
    setPendingAction(null);
  };

  const handleLocalFileNext = () => {
    setShowLocalFileError(false);
    handleNext();
  };

  const handleLocalFilePrevious = () => {
    setShowLocalFileError(false);
    handlePrevious();
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!currentTrack) return;
      
      try {
        const artistResponse = await fetch(
          `https://api.spotify.com/v1/artists/${currentTrack.artists[0].id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        if (!artistResponse.ok) {
          throw new Error('Failed to fetch artist data');
        }

        const artist = await artistResponse.json();
        setArtistData(artist);
        
        // Set initial track metadata (even if we're not showing audio features)
        setTrackMetadata({
          tempo: 0,
          acousticness: 0,
          danceability: 0,
          energy: 0,
          instrumentalness: 0,
          loudness: 0,
          valence: 0
        });
      } catch (error) {
        console.error('Error fetching artist data:', error);
      }
    };

    fetchArtistData();
  }, [currentTrack, accessToken]);

  if (!currentTrack || !trackMetadata || !artistData) {
    return (
      <GlobalLoadingOverlay>
        <LoadingSpinner />
        <LoadingText>Loading...</LoadingText>
      </GlobalLoadingOverlay>
    );
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer albumArt={currentTrack?.album?.images?.[0]?.url}>
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
                  ? 'trackSlideNext 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  : slideDirection === 'prev'
                  ? 'trackSlidePrev 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
        <GlobalLoadingOverlay>
          <LoadingSpinner />
          <LoadingText>{loadingMessage || 'Loading playlist data...'}</LoadingText>
        </GlobalLoadingOverlay>
      )}
    </>
  );
};

export default PlaylistSorter; 