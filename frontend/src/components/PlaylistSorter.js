import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import AudioPlayer from './AudioPlayer';

const SorterContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  min-height: 100vh;
  gap: 20px;
  padding: 20px;
`;

const AlbumSection = styled.div`
  text-align: center;
`;

const AlbumArt = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SongInfo = styled.div`
  padding: 20px;
`;

const GenreList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
`;

const GenreItem = styled.li`
  background-color: var(--surface-color);
  padding: 8px 16px;
  margin: 8px 0;
  border-radius: 16px;
`;

const PlaylistsSection = styled.div`
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 20px;
`;

const PlaylistCheckbox = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
`;

const NavigationButtons = styled.div`
  position: fixed;
  bottom: 90px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlaylistSorter = ({ accessToken }) => {
  const location = useLocation();
  const playlistId = new URLSearchParams(location.search).get('playlist');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlaylists, setSelectedPlaylists] = useState({});
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      let endpoint = playlistId === 'liked' 
        ? 'https://api.spotify.com/v1/me/tracks'
        : `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await response.json();
      setTracks(data.items.map(item => item.track));
      setCurrentTrack(data.items[0].track);
    };

    const fetchUserPlaylists = async () => {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await response.json();
      setUserPlaylists(data.items.slice(0, 10));
    };

    if (accessToken && playlistId) {
      fetchTracks();
      fetchUserPlaylists();
    }
  }, [accessToken, playlistId]);

  const handleKeyPress = (event) => {
    switch (event.key) {
      case ' ':
        setIsPlaying(!isPlaying);
        break;
      case 'Enter':
        handleSave();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      default:
        const num = parseInt(event.key);
        if (!isNaN(num) && num >= 0 && num <= 9) {
          togglePlaylist(userPlaylists[num === 0 ? 9 : num - 1].id);
        }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentIndex, selectedPlaylists]);

  const togglePlaylist = (playlistId) => {
    setSelectedPlaylists(prev => ({
      ...prev,
      [playlistId]: !prev[playlistId]
    }));
  };

  const handleNext = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentTrack(tracks[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentTrack(tracks[currentIndex - 1]);
    }
  };

  const handleSave = async () => {
    // Implementation for saving to selected playlists
    for (const [playlistId, isSelected] of Object.entries(selectedPlaylists)) {
      if (isSelected) {
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: [currentTrack.uri]
          })
        });
      }
    }
    handleNext();
  };

  if (!currentTrack) return <div>Loading...</div>;

  return (
    <>
      <ProgressBar style={{ width: `${(currentIndex / tracks.length) * 100}%` }} />
      <div style={{ textAlign: 'center', padding: '20px' }}>
        {currentIndex + 1} / {tracks.length}
      </div>
      
      <SorterContainer>
        <AlbumSection>
          <AlbumArt src={currentTrack.album.images[0].url} alt="Album Art" />
          <h3>{currentTrack.album.name}</h3>
          <p>{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
        </AlbumSection>

        <SongInfo>
          <h2>{currentTrack.name}</h2>
          <GenreList>
            {currentTrack.artists[0]?.genres?.map(genre => (
              <GenreItem key={genre}>{genre}</GenreItem>
            ))}
          </GenreList>
        </SongInfo>

        <PlaylistsSection>
          {userPlaylists.map((playlist, index) => (
            <PlaylistCheckbox
              key={playlist.id}
              onClick={() => togglePlaylist(playlist.id)}
            >
              <input
                type="checkbox"
                checked={selectedPlaylists[playlist.id] || false}
                readOnly
              />
              <span style={{ marginLeft: '10px' }}>
                {index + 1}. {playlist.name}
              </span>
            </PlaylistCheckbox>
          ))}
        </PlaylistsSection>
      </SorterContainer>

      <NavigationButtons>
        <Button onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleNext} disabled={currentIndex === tracks.length - 1}>
          Next
        </Button>
      </NavigationButtons>

      <AudioPlayer
        trackUri={currentTrack.uri}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        accessToken={accessToken}
      />
    </>
  );
};

export default PlaylistSorter; 