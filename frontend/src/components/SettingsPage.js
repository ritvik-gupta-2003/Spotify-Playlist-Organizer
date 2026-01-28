/**
 * SettingsPage component displays user profile and logout option
 */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  padding: 20px;
  background-color: var(--surface-color);
  border-radius: 12px;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const UserEmail = styled.p`
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const LogoutButton = styled.button`
  background-color: #e91429;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;

  &:hover {
    transform: scale3d(1.05, 1.05, 1);
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: background-color;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const DefaultAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background-color: var(--primary-color);
  }
`;

/**
 * Settings page showing user profile and logout button
 * @param {Object} user - User data from Spotify
 * @param {Function} onLogout - Logout callback function
 */
const SettingsPage = ({ user, onLogout }) => {
  const history = useHistory();
  const [localUser, setLocalUser] = useState(user || history.location.state?.user);
  
  /**
   * Fetch user data if not provided via props
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('spotify_access_token')}`
          }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const userData = await response.json();
        setLocalUser(userData);
      } catch (error) {
        console.error('User data fetch error:', error);
      }
    };

    if (!localUser) {
      fetchUserData();
    }
  }, [localUser]);

  if (!localUser) {
    return (
      <SettingsContainer>
        <BackButton onClick={() => history.goBack()}>
          <ArrowBackIcon /> Back
        </BackButton>
        <div>Loading user data...</div>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      <BackButton onClick={() => history.goBack()}>
        <ArrowBackIcon /> Back
      </BackButton>

      <ProfileSection>
        {localUser.images && localUser.images[0] && localUser.images[0].url ? (
          <ProfileImage 
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
        <ProfileInfo>
          <UserName>{localUser.display_name || 'User'}</UserName>
          <UserEmail>{localUser.email || 'No email available'}</UserEmail>
          <LogoutButton onClick={onLogout}>
            Logout
          </LogoutButton>
        </ProfileInfo>
      </ProfileSection>
    </SettingsContainer>
  );
};

export default SettingsPage; 