/**
 * LocalFileErrorPopup component - displays when a local file track is encountered
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

const LocalFileErrorPopup = styled.div`
  background: var(--surface-color);
  max-width: 300px;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

const PopupButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 28px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  box-shadow: 0 2px 8px rgba(29, 185, 84, 0.2);

  &:hover {
    transform: scale3d(1.08, 1.08, 1);
    box-shadow: 0 4px 12px rgba(29, 185, 84, 0.4);
  }
  
  &:active {
    transform: scale3d(1.02, 1.02, 1);
  }
`;

/**
 * Error popup shown when a local file track is encountered
 * @param {Function} onPrevious - Callback to go to previous track
 * @param {Function} onNext - Callback to go to next track
 * @param {boolean} hasNextTrack - Whether there is a next track available
 */
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

export default LocalFileError;
