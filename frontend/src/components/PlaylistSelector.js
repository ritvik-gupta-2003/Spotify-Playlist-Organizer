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
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: ${props => (props.index || 0) * 0.04}s;

  &:hover {
    transform: translate3d(0, -4px, 0);
    background-color: #383838;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    transform: translate3d(0, -4px, 0);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate3d(0, 20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
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
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    backface-visibility: hidden;
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
    transform: scale3d(1.05, 1.05, 1);
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

/**
 * Renders a grid of playlist cards with hover effects
 * @param {Array} playlists - Array of playlist objects to display
 * @param {Function} onSelect - Callback function when a playlist is selected
 */
const PlaylistSelector = ({ playlists = [], onSelect }) => {
  return (
    <PlaylistGrid>
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