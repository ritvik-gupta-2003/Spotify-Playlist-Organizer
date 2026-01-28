/**
 * UnsavedChangesPopup component - prompts user when navigating with unsaved changes
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

const PopupButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: ${props => props.variant === 'secondary' ? '#e91429' : 'var(--primary-color)'};
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
  box-shadow: ${props => props.variant === 'secondary' 
    ? '0 2px 8px rgba(233, 20, 41, 0.3)'
    : '0 2px 8px rgba(29, 185, 84, 0.2)'};

  &:hover {
    transform: scale3d(1.08, 1.08, 1);
    box-shadow: ${props => props.variant === 'secondary' 
      ? '0 4px 12px rgba(233, 20, 41, 0.5)'
      : '0 4px 12px rgba(29, 185, 84, 0.4)'};
  }
  
  &:active {
    transform: scale3d(1.02, 1.02, 1);
  }
`;

/**
 * Popup displayed when user has unsaved changes and tries to navigate away
 * @param {Function} onSave - Callback to save changes and continue
 * @param {Function} onDiscard - Callback to discard changes and continue
 * @param {Function} onCancel - Callback to cancel navigation
 */
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

export default UnsavedChangesPopup;
