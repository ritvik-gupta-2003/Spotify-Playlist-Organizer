import React from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
`;

const LoginButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 15px 30px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5010/login', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <LoginContainer>
      <h1>Spotify Playlist Organizer</h1>
      <LoginButton onClick={handleLogin}>
        Login with Spotify
      </LoginButton>
    </LoginContainer>
  );
};

export default LoginPage; 