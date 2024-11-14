import React from 'react';
import styled from 'styled-components';

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
`;

const PlaylistCard = styled.div`
  background-color: var(--surface-color);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    background-color: #383838;
  }
`;

const PlaylistImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  margin-bottom: 12px;
  background-color: #121212;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaylistName = styled.h3`
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--text-primary);
`;

const PlaylistInfo = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
`;

const LibraryCard = styled(PlaylistCard)`
  background-color: var(--primary-color);
  
  &:hover {
    background-color: #1ed760;
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

const PlaylistSelector = ({ playlists = [], onSelect, includeLibrary }) => {
  return (
    <PlaylistGrid>
      {includeLibrary && (
        <LibraryCard onClick={() => onSelect('liked')}>
          <PlaylistImage>
            <img 
              src="https://misc.scdn.co/liked-songs/liked-songs-640.png"
              alt="Liked Songs"
            />
          </PlaylistImage>
          <PlaylistName>Liked Songs</PlaylistName>
          <PlaylistInfo>Your Library</PlaylistInfo>
        </LibraryCard>
      )}
      
      {playlists?.map(playlist => (
        <PlaylistCard 
          key={playlist.id}
          onClick={() => onSelect(playlist.id)}
        >
          <PlaylistImage>
            {playlist.images && playlist.images.length > 0 ? (
              <img 
                src={playlist.images[0].url}
                alt={playlist.name}
              />
            ) : null}
          </PlaylistImage>
          <PlaylistName>{playlist.name}</PlaylistName>
          <PlaylistInfo>{playlist.tracks?.total || 0} tracks</PlaylistInfo>
        </PlaylistCard>
      ))}
    </PlaylistGrid>
  );
};

export default PlaylistSelector; 