import React from 'react';
import styled from 'styled-components';
import { API_URL } from '../config';

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
      console.log('Attempting login request...');
      const response = await fetch(`${API_URL}/login`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      window.location.href = data.url;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        stack: error.stack,
        headers: error.headers
      });
    }
  };

  return (
    <LoginContainer>
      <h1>Playlist Organizer</h1>
      <LoginButton onClick={handleLogin}>
        Login with your Spotify
      </LoginButton>
    </LoginContainer>
  );
};

export default LoginPage; 