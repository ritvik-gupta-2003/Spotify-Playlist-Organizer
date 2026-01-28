/**
 * ProfileButton component - reusable user profile button with avatar
 */
import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;

  &:hover {
    transform: scale3d(1.1, 1.1, 1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

/**
 * Profile button component with user avatar or default avatar
 * @param {Object} user - User object with profile image data
 * @param {Function} onClick - Click handler function
 * @param {Object} style - Additional inline styles
 */
const ProfileButton = ({ user, onClick, style }) => {
  return (
    <Button onClick={onClick} style={style}>
      {user && user.images && user.images[0] && user.images[0].url ? (
        <img 
          src={user.images[0].url} 
          alt="Profile"
          onError={(e) => {
            console.error('Profile image failed to load');
            e.target.style.display = 'none';
            const defaultAvatar = document.createElement('div');
            defaultAvatar.className = 'default-avatar';
            e.target.parentElement.appendChild(defaultAvatar);
          }}
        />
      ) : (
        <DefaultAvatar />
      )}
    </Button>
  );
};

export default ProfileButton;
export { DefaultAvatar };
