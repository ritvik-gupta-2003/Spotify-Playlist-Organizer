import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

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

const SorterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  margin-top: 20px;
  height: calc(100vh - 180px);
`;

const Section = styled.div`
  background-color: rgba(var(--surface-color-rgb), 0.8);
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  backdrop-filter: blur(10px);
`;

const AlbumSection = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 20px;
  gap: 20px;
`;

const AlbumArt = styled.img`
  width: 80%;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const TrackInfo = styled.div`
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
`;

const MetadataSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetadataLabel = styled.span`
  white-space: nowrap;
`;

const MetadataValue = styled.span`
  text-align: right;
`;

const PlaylistsSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }
`;

const PlaylistEntry = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
`;

const PlaylistBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: ${props => props.isEmpty ? '#1a1a1a' : 'var(--surface-color)'};
  border-radius: 8px;
  width: 100%;
  border: 2px solid ${props => {
    if (props.isEmpty) return 'none';
    return props.isSelected ? '#1db954' : '#e91429';
  }};
  cursor: ${props => !props.isEmpty ? 'pointer' : 'default'};
  
  &:hover {
    background-color: ${props => !props.isEmpty ? 'rgba(255, 255, 255, 0.1)' : '#1a1a1a'};
  }
`;

const PlaylistNumber = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: var(--text-secondary);
  width: 24px;
`;

const PlaylistSearchBox = styled.div`
  flex: 1;
  position: relative;
`;

const PlaylistInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  background-color: #1a1a1a;
  border: none;
  border-radius: 4px;
  color: var(--text-primary);
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const PlaylistDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--surface-color);
  border-radius: 4px;
  height: 250px;
  overflow-y: auto;
  z-index: 10;
  border: 1px solid var(--primary-color);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
  }
`;

const PlaylistOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  height: 50px;
  
  img, div {
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e91429;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  font-size: 18px;
  
  &:hover {
    opacity: 1;
  }
`;

const SpotifyEmbed = styled.iframe`
  width: 100%;
  height: 80px;
  border: none;
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

const PlaylistSelectionOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
`;

const SelectionOption = styled.button`
  padding: 8px 12px;
  background-color: #1a1a1a;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
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

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => `
      radial-gradient(circle at 0% 0%, ${props.colors[0]} 0%, transparent 50%),
      radial-gradient(circle at 100% 0%, ${props.colors[1]} 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, ${props.colors[2]} 0%, transparent 50%),
      radial-gradient(circle at 0% 100%, ${props.colors[3]} 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, ${props.colors[4]} 0%, transparent 70%)
    `};
    opacity: 0.8;
    z-index: -1;
    transition: all 0.5s ease;
    filter: blur(60px);
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
  const [loadingPlaylist, setLoadingPlaylist] = useState(null);
  const [jumpToTrack, setJumpToTrack] = useState('');
  const [backgroundColors, setBackgroundColors] = useState(['#000', '#000', '#000', '#000']);
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedStates, setSelectedStates] = useState({});
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [userData, setUserData] = useState(user);
  const [showLocalFileError, setShowLocalFileError] = useState(false);
  const [playableTotalTracks, setPlayableTotalTracks] = useState(0);

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
        const trackList = data.items.map(item => item.track).filter(track => track && !track.is_local);
        
        setTracks(trackList);
        setCurrentTrack(trackList[0]);
        setTotalTracks(data.total);
        setPlayableTotalTracks(trackList.length);
        setNextTracksUrl(data.next);
        
        const currentId = playlistId === 'liked' ? 'liked' : playlistId;
        setPlaylistTracks(prev => ({
          ...prev,
          [currentId]: new Set(trackList.map(track => track.id))
        }));
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

  useEffect(() => {
    const fetchTrackMetadata = async () => {
      if (currentTrack) {
        const [metadataResponse, artistResponse] = await Promise.all([
          fetch(`https://api.spotify.com/v1/audio-features/${currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          fetch(`https://api.spotify.com/v1/artists/${currentTrack.artists[0].id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ]);

        const [metadata, artist] = await Promise.all([
          metadataResponse.json(),
          artistResponse.json()
        ]);

        setTrackMetadata(metadata);
        setArtistData(artist);
      }
    };

    fetchTrackMetadata();
  }, [currentTrack, accessToken]);

  useEffect(() => {
    const updatePlaylistStates = async () => {
      if (!currentTrack) return;
      
      const newSelectedStates = { ...selectedStates };
      
      for (const playlist of Object.values(selectedPlaylists)) {
        if (!playlist) continue;
        
        // If we haven't loaded this playlist's tracks yet, load them
        if (!playlistTracks[playlist.id]) {
          await fetchPlaylistTracks(playlist.id);
        }
        
        // Check if current track exists in this playlist
        const trackExists = playlistTracks[playlist.id]?.has(currentTrack.id);
        
        // Check for pending changes
        const pendingChange = unsavedChanges.find(
          change => change.trackId === currentTrack.id && change.playlistId === playlist.id
        );
        
        if (pendingChange) {
          newSelectedStates[playlist.id] = pendingChange.action === 'add';
        } else {
          newSelectedStates[playlist.id] = trackExists;
        }
      }
      
      setSelectedStates(newSelectedStates);
    };

    updatePlaylistStates();
  }, [currentTrack, selectedPlaylists, playlistTracks, unsavedChanges]);

  const handleNext = useCallback(() => {
    if (currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      
      if (nextTrack.is_local) {
        setShowLocalFileError(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setCurrentTrack(nextTrack);
        
        if (currentIndex >= tracks.length - 6 && nextTracksUrl) {
          fetchMoreTracks();
        }
      }
    }
  }, [currentIndex, tracks, nextTracksUrl]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevTrack = tracks[currentIndex - 1];
      
      if (prevTrack.is_local) {
        setShowLocalFileError(true);
      } else {
        setCurrentIndex(prev => prev - 1);
        setCurrentTrack(prevTrack);
      }
    }
  }, [currentIndex, tracks]);

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

  const handleSave = async () => {
    try {
      await Promise.all(unsavedChanges.map(async (change) => {
        const playlist = Object.values(selectedPlaylists).find(p => p.id === change.playlistId);
        if (!playlist) return;

        if (change.action === 'add') {
          await addTrackToPlaylist(playlist.id, change.trackId);
          setPlaylistTracks(prev => ({
            ...prev,
            [playlist.id]: new Set([...(prev[playlist.id] || []), change.trackId])
          }));
        } else {
          await removeTrackFromPlaylist(playlist.id, change.trackId);
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

  const selectPlaylist = async (index, playlist) => {
    // First load the playlist tracks if we haven't already
    if (!playlistTracks[playlist.id]) {
      await fetchPlaylistTracks(playlist.id);
    }
    
    // Add playlist to selected playlists
    setSelectedPlaylists(prev => ({
      ...prev,
      [index]: playlist
    }));
    
    // Check if current track exists in this playlist
    const trackExists = playlistTracks[playlist.id]?.has(currentTrack.id);
    
    // Set initial state based on track existence
    setSelectedStates(prev => ({
      ...prev,
      [playlist.id]: true // Always set to true when selecting a new playlist
    }));
    
    // Only add to unsaved changes if the track isn't already in the playlist
    if (!trackExists) {
      setUnsavedChanges(prev => [...prev, {
        trackId: currentTrack.id,
        playlistId: playlist.id,
        action: 'add'
      }]);
    }
    
    setActiveDropdown(null);
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

  const fetchMoreTracks = async () => {
    if (!nextTracksUrl || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await fetch(nextTracksUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const newTracks = data.items.map(item => item.track).filter(track => track && !track.is_local);
      
      setTracks(prev => [...prev, ...newTracks]);
      setNextTracksUrl(data.next);
      setPlayableTotalTracks(prev => prev + newTracks.length);
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
      
      // Initialize the playlist tracks set
      setPlaylistTracks(prev => ({
        ...prev,
        [newPlaylist.id]: new Set()
      }));
      
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

  const fetchPlaylistTracks = async (playlistId) => {
    if (!playlistId) {
      console.warn('Attempted to fetch tracks for undefined playlist ID');
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const trackIds = new Set(data.items.map(item => item.track.id));
      
      setPlaylistTracks(prev => ({
        ...prev,
        [playlistId]: trackIds
      }));
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
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
        colors.push(`rgba(${r},${g},${b},0.6)`);
      }
      
      return colors;
    } catch (error) {
      console.error('Error generating color palette:', error);
      return ['rgba(0,0,0,0.6)', 'rgba(20,20,20,0.6)', 'rgba(40,40,40,0.6)', 'rgba(60,60,60,0.6)', 'rgba(80,80,80,0.6)'];
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

  if (!currentTrack || !trackMetadata || !artistData) return <div>Loading...</div>;

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <PageContainer colors={backgroundColors}>
      <ProgressBar progress={currentIndex + 1} total={playableTotalTracks} />
      <BackButton onClick={handleBack}>
        <ArrowBackIcon /> Back
      </BackButton>
      <ProfileButton onClick={handleProfileClick}>
        {userData?.images?.[0]?.url ? (
          <img 
            src={userData.images[0].url} 
            alt="Profile" 
          />
        ) : (
          <DefaultAvatar />
        )}
      </ProfileButton>

      <TrackCounter>
        <TrackNumberInput 
          value={jumpToTrack || currentIndex + 1}
          onChange={handleTrackNumberInput}
          onBlur={() => setJumpToTrack('')}
          type="number"
          min="1"
          max={playableTotalTracks}
        /> / {playableTotalTracks}
        {isLoadingMore && <span> (Loading more...)</span>}
      </TrackCounter>

      {loadingPlaylist && (
        <LoadingOverlay>
          Loading playlist tracks...
        </LoadingOverlay>
      )}

      <SorterContainer>
        <AlbumSection>
          <AlbumArt src={currentTrack.album.images[0].url} alt="Album Art" />
          <TrackInfo>
            <h2>{currentTrack.name}</h2>
            <p>{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
            <p>{currentTrack.album.name}</p>
          </TrackInfo>
          <SpotifyEmbed 
            src={`https://open.spotify.com/embed/track/${currentTrack.id}`}
            allow="encrypted-media"
          />
        </AlbumSection>

        <MetadataSection>
          <MetadataItem>
            <MetadataLabel>Artist Genres</MetadataLabel>
            <MetadataValue>
              {artistData.genres
                .map(genre => genre.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' '))
                .join(', ') || 'N/A'}
            </MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <span>Length</span>
            <span>{formatDuration(currentTrack.duration_ms)}</span>
          </MetadataItem>
          <MetadataItem>
            <span>Tempo</span>
            <span>{Math.round(trackMetadata.tempo)} BPM</span>
          </MetadataItem>
          <MetadataItem>
            <span>Acousticness</span>
            <span>{Math.round(trackMetadata.acousticness * 100)}%</span>
          </MetadataItem>
          <MetadataItem>
            <span>Danceability</span>
            <span>{Math.round(trackMetadata.danceability * 100)}%</span>
          </MetadataItem>
          <MetadataItem>
            <span>Energy</span>
            <span>{Math.round(trackMetadata.energy * 100)}%</span>
          </MetadataItem>
          <MetadataItem>
            <span>Instrumentalness</span>
            <span>{Math.round(trackMetadata.instrumentalness * 100)}%</span>
          </MetadataItem>
          <MetadataItem>
            <span>Loudness</span>
            <span>{trackMetadata.loudness.toFixed(1)} dB</span>
          </MetadataItem>
          <MetadataItem>
            <span>Valence</span>
            <span>{Math.round(trackMetadata.valence * 100)}%</span>
          </MetadataItem>
        </MetadataSection>

        <PlaylistsSection>
          {Array.from({length: 10}).map((_, index) => (
            <PlaylistEntry key={index}>
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
                        style={{width: 40, height: 40, borderRadius: 4}}
                      />
                    ) : (
                      <div style={{ width: 40, height: 40, background: '#282828', borderRadius: 4 }} />
                    )}
                    <span>{selectedPlaylists[index].name}</span>
                  </>
                ) : (
                  <PlaylistSearchBox>
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
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                      <PlaylistDropdown>
                        {getAvailablePlaylists().map(playlist => (
                          <PlaylistOption 
                            key={playlist.id}
                            onClick={() => {
                              selectPlaylist(index, playlist);
                              setShowingSearchBox(prev => ({...prev, [index]: false}));
                            }}
                          >
                            {playlist.images && playlist.images.length > 0 ? (
                              <img src={playlist.images[0].url} alt="" />
                            ) : (
                              <div style={{ width: 40, height: 40, background: '#282828', borderRadius: 4 }} />
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
        <Button onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button 
          onClick={() => {
            setUnsavedChanges([]);
            setShowDiscardPopup(true);
          }} 
          variant="secondary"
        >
          Discard
        </Button>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleNext} disabled={currentIndex === tracks.length - 1}>
          Next
        </Button>
      </NavigationButtons>

      <ProgressBar progress={currentIndex + 1} total={playableTotalTracks} />

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
  );
};

export default PlaylistSorter; 