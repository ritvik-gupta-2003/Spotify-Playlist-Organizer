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

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
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

const CreatePlaylistBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 100%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PlaylistInput = styled.input`
  width: 100%;
  padding: 12px;
  background-color: #1a1a1a;
  border: none;
  border-radius: 4px;
  color: var(--text-primary);
  margin-top: 10px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-color);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #e91429;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    opacity: 0.8;
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

const PopupButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 16px;
  font-weight: bold;

  &:hover {
    transform: scale(1.05);
  }
`;

const EmptyPlaylistPopup = ({ onClose }) => (
  <PopupOverlay>
    <PopupContent>
      <h3>Empty Playlist</h3>
      <p>Sorry, please select a playlist with at least one track.</p>
      <PopupButton onClick={onClose}>OK</PopupButton>
    </PopupContent>
  </PopupOverlay>
);

const LIKED_SONGS_ICON = '/images/LikedSongsIcon.png';

const CreateButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: scale(1.05);
  }
`;

const CreatePlaylistInput = styled(SearchInput)`
  width: 250px;
  margin: 0;
  padding-right: 40px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
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

const ProfileButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MainPage = ({ accessToken, user }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showEmptyPlaylistPopup, setShowEmptyPlaylistPopup] = useState(false);
  const [likedSongsCount, setLikedSongsCount] = useState(0);
  const [localUser, setLocalUser] = useState(user);
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const userData = await response.json();
        setLocalUser(userData);
      } catch (error) {
        console.error('User data fetch error:', error);
      }
    };

    if (!localUser && accessToken) {
      fetchUserData();
    }
  }, [accessToken, localUser]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=1', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setLikedSongsCount(data.total);
      } catch (error) {
        console.error('Liked songs fetch error:', error);
      }
    };

    const fetchAllPlaylists = async () => {
      setIsLoading(true);
      const playlistMap = new Map();
      let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';

      try {
        while (nextUrl) {
          const response = await fetch(nextUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          
          data.items.forEach(playlist => {
            if (!playlistMap.has(playlist.id)) {
              playlistMap.set(playlist.id, playlist);
            }
          });
          
          nextUrl = data.next;
        }

        const uniquePlaylists = Array.from(playlistMap.values());
        setPlaylists(uniquePlaylists);
      } catch (error) {
        console.error('Playlists fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchLikedSongs();
      fetchAllPlaylists();
    }
  }, [accessToken]);

  const handlePlaylistSelect = (playlistId) => {
    const selectedPlaylist = playlists.find(p => p.id === playlistId);
    
    if (selectedPlaylist && selectedPlaylist.tracks.total === 0) {
      setShowEmptyPlaylistPopup(true);
      return;
    }

    history.push({
      pathname: '/sort',
      search: `?playlist=${playlistId}`,
      state: { userPlaylists: playlists }
    });
  };

  const filteredPlaylists = playlists
    .filter(playlist => 
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      playlist.name !== 'DJ'
    );

  const createNewPlaylist = async (name) => {
    try {
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      
      const createResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          public: false,
          description: 'Created with Playlist Sorter'
        })
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create playlist');
      }
      
      const newPlaylist = await createResponse.json();
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <MainContainer>
        <Header>
          <h1>Your Playlists</h1>
        </Header>
        <div>Loading all playlists...</div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Header>
        <h1>Your Playlists</h1>
        <HeaderContent>
          <SearchInput
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isCreating ? (
            <InputWrapper>
              <CreatePlaylistInput
                type="text"
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newPlaylistName.trim()) {
                    const newPlaylist = await createNewPlaylist(newPlaylistName);
                    if (newPlaylist) {
                      setPlaylists(prev => [newPlaylist, ...prev]);
                      setIsCreating(false);
                      setNewPlaylistName('');
                    }
                  } else if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewPlaylistName('');
                  }
                }}
                autoFocus
              />
              <CloseButton
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }}
              >
                ×
              </CloseButton>
            </InputWrapper>
          ) : (
            <CreateButton onClick={() => setIsCreating(true)}>
              Create New Playlist
            </CreateButton>
          )}
          <ProfileButton onClick={() => history.push('/settings', { user: localUser })}>
            {localUser && localUser.images && localUser.images[0] && localUser.images[0].url ? (
              <img 
                src={localUser.images[0].url} 
                alt="Profile"
                onError={(e) => {
                  console.error('Profile image failed to load');
                  e.target.style.display = 'none';
                  e.target.parentElement.appendChild(document.createElement('div')).className = 'default-avatar';
                }}
              />
            ) : (
              <DefaultAvatar />
            )}
          </ProfileButton>
        </HeaderContent>
      </Header>

      <PlaylistSelector
        playlists={[
          {
            id: 'liked',
            name: `Your Liked Songs`,
            images: [],
            isLiked: true,
            tracks: { total: likedSongsCount }
          },
          ...filteredPlaylists
        ]}
        onSelect={handlePlaylistSelect}
      />

      {showEmptyPlaylistPopup && (
        <EmptyPlaylistPopup onClose={() => setShowEmptyPlaylistPopup(false)} />
      )}
    </MainContainer>
  );
};

export default MainPage; 