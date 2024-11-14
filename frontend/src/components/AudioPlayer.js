import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--surface-color);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--primary-color);
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ProgressContainer = styled.div`
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
`;

const Progress = styled.div`
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -4px;
    width: 12px;
    height: 12px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: none;
  }
  
  &:hover::after {
    display: block;
  }
`;

const TimeDisplay = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  min-width: 45px;
`;

const AudioPlayer = ({ trackUri, isPlaying, setIsPlaying, accessToken }) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackUri.split(':')[2]}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        
        if (audioRef.current) {
          audioRef.current.src = data.preview_url;
          audioRef.current.load();
          if (isPlaying) audioRef.current.play();
        }
      } catch (error) {
        console.error('Error setting up player:', error);
      }
    };

    setupPlayer();
  }, [trackUri, accessToken]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContainer>
      <PlayButton onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </PlayButton>
      
      <TimeDisplay>{formatTime(progress)}</TimeDisplay>
      
      <ProgressContainer ref={progressRef} onClick={handleProgressClick}>
        <Progress style={{ width: `${(progress / duration) * 100}%` }} />
      </ProgressContainer>
      
      <TimeDisplay>{formatTime(duration)}</TimeDisplay>
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </PlayerContainer>
  );
};

export default AudioPlayer; 