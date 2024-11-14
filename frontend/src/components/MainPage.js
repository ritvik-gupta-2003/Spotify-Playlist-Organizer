import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import PlaylistSelector from './PlaylistSelector';

const MainContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const SearchInput = styled.input`
  background-color: var(--surface-color);
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  color: var(--text-primary);
  width: 300px;
  font-size: 16px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }
`;

const MainPage = ({ accessToken, setUser }) => {
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setUserProfile(data);
        setUser(data);
      } catch (error) {
        console.error('Profile fetch error:', error);
        history.push('/');
      }
    };

    const fetchPlaylists = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setPlaylists(data.items);
      } catch (error) {
        console.error('Playlists fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      getProfile();
      fetchPlaylists();
    }
  }, [accessToken, setUser, history]);

  const handlePlaylistSelect = (playlistId) => {
    history.push(`/sort?playlist=${playlistId}`);
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MainContainer>
      <Header>
        <h1>Your Playlists</h1>
        <SearchInput
          type="text"
          placeholder="Search playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Header>
      
      <PlaylistSelector
        playlists={filteredPlaylists}
        onSelect={handlePlaylistSelect}
        includeLibrary={true}
      />
    </MainContainer>
  );
};

export default MainPage; 