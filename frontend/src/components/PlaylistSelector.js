import React from 'react';
import styled from 'styled-components';
import LikedSongsIcon from '../images/LikedSongsIcon.png';

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  padding: 20px 0;
`;

const PlaylistCard = styled.div`
  background-color: var(--surface-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  animation: fadeIn 0.4s ease-out forwards;
  animation-delay: ${props => (props.index || 0) * 0.05}s;

  &:hover {
    transform: translateY(-4px);
    background-color: #383838;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    transform: translateY(-4px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PlaylistImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  margin-bottom: 12px;
  background-color: #121212;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
    pointer-events: none;
  }
`;

const PlaylistCardHover = styled(PlaylistCard)`
  &:hover ${PlaylistImage} img {
    transform: scale(1.05);
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
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
  
  &:hover {
    background-color: #1ed760;
    box-shadow: 0 8px 24px rgba(29, 185, 84, 0.5);
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
        <LibraryCard onClick={() => onSelect('liked')} index={0}>
          <PlaylistImage>
            <img 
              src={LikedSongsIcon}
              alt="Liked Songs"
            />
          </PlaylistImage>
          <PlaylistName>Liked Songs</PlaylistName>
          <PlaylistInfo>Your Library</PlaylistInfo>
        </LibraryCard>
      )}
      
      {playlists?.map((playlist, index) => (
        <PlaylistCardHover 
          key={playlist.id}
          onClick={() => onSelect(playlist.id)}
          index={index}
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
        </PlaylistCardHover>
      ))}
    </PlaylistGrid>
  );
};

export default PlaylistSelector; 