import React from 'react';
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
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
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
  transition: background-color 0.2s;

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

const SettingsPage = ({ user, onLogout }) => {
  const history = useHistory();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <SettingsContainer>
      <BackButton onClick={() => history.goBack()}>
        <ArrowBackIcon /> Back
      </BackButton>

      <ProfileSection>
        {user.images?.[0]?.url ? (
          <ProfileImage 
            src={user.images[0].url} 
            alt="Profile"
          />
        ) : (
          <DefaultAvatar />
        )}
        <ProfileInfo>
          <UserName>{user.display_name}</UserName>
          <UserEmail>{user.email}</UserEmail>
          <LogoutButton onClick={onLogout}>
            Logout
          </LogoutButton>
        </ProfileInfo>
      </ProfileSection>
    </SettingsContainer>
  );
};

export default SettingsPage; 