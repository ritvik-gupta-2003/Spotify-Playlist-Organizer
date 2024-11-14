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

const PlaylistImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  margin-bottom: 12px;
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

const PlaylistSelector = ({ playlists = [], onSelect, includeLibrary }) => {
  const defaultPlaylistImage = '/default-playlist-image.png';

  return (
    <PlaylistGrid>
      {includeLibrary && (
        <LibraryCard onClick={() => onSelect('liked')}>
          <PlaylistImage 
            src="https://misc.scdn.co/liked-songs/liked-songs-640.png"
            alt="Liked Songs"
          />
          <PlaylistName>Liked Songs</PlaylistName>
          <PlaylistInfo>Your Library</PlaylistInfo>
        </LibraryCard>
      )}
      
      {playlists?.map(playlist => (
        <PlaylistCard 
          key={playlist.id}
          onClick={() => onSelect(playlist.id)}
        >
          <PlaylistImage 
            src={(playlist.images && playlist.images.length > 0) 
              ? playlist.images[0].url 
              : defaultPlaylistImage}
            alt={playlist.name}
          />
          <PlaylistName>{playlist.name}</PlaylistName>
          <PlaylistInfo>{playlist.tracks?.total || 0} tracks</PlaylistInfo>
        </PlaylistCard>
      ))}
    </PlaylistGrid>
  );
};

export default PlaylistSelector; 