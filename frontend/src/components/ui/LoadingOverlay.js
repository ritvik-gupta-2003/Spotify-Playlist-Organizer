/**
 * LoadingOverlay component - displays loading spinner with message
 */
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalLoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #1DB954;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  will-change: transform;
  backface-visibility: hidden;
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  max-width: 80%;
`;

const GlobalStyle = createGlobalStyle`
  @keyframes spin {
    0% {
      transform: rotate3d(0, 0, 1, 0deg);
    }
    100% {
      transform: rotate3d(0, 0, 1, 360deg);
    }
  }
`;

/**
 * Full-screen loading overlay with spinner and optional message
 * @param {string} message - Loading message to display
 */
const LoadingOverlay = ({ message = 'Loading...' }) => (
  <>
    <GlobalStyle />
    <GlobalLoadingOverlay>
      <LoadingSpinner />
      <LoadingText>{message}</LoadingText>
    </GlobalLoadingOverlay>
  </>
);

export default LoadingOverlay;
