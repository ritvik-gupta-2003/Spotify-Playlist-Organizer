/**
 * EmptyPlaylistPopup component - displays when user selects an empty playlist
 */
import React from 'react';
import styled from 'styled-components';

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

/**
 * Popup shown when user tries to select an empty playlist
 * @param {Function} onClose - Callback function to close the popup
 */
const EmptyPlaylistPopup = ({ onClose }) => (
  <PopupOverlay>
    <PopupContent>
      <h3>Empty Playlist</h3>
      <p>Sorry, please select a playlist with at least one track.</p>
      <PopupButton onClick={onClose}>OK</PopupButton>
    </PopupContent>
  </PopupOverlay>
);

export default EmptyPlaylistPopup;
