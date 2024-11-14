import React, { useState, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import PlaylistSorter from './components/PlaylistSorter';
import SettingsPage from './components/SettingsPage';
import CallbackPage from './components/CallbackPage';

const App = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('spotify_access_token');
      if (!token || user) return;

      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [accessToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const refresh = params.get('refresh_token');

    if (token) {
      setAccessToken(token);
      setRefreshToken(refresh);
      localStorage.setItem('spotify_access_token', token);
      localStorage.setItem('spotify_refresh_token', refresh);
      history.push('/main');
    }
  }, [history]);

  const handleLogout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    history.push('/');
  };

  return (
    <Switch>
      <Route exact path="/" component={LoginPage} />
      <Route path="/callback" component={CallbackPage} />
      <Route 
        path="/main" 
        render={() => <MainPage accessToken={localStorage.getItem('spotify_access_token')} user={user} />} 
      />
      <Route 
        path="/sort" 
        render={() => (
          <PlaylistSorter 
            accessToken={localStorage.getItem('spotify_access_token')} 
            user={user}
          />
        )} 
      />
      <Route 
        path="/settings" 
        render={() => (
          <SettingsPage 
            user={user} 
            onLogout={handleLogout} 
          />
        )} 
      />
    </Switch>
  );
};

export default App; 