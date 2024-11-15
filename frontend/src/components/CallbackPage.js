import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { API_URL } from '../config';

const CallbackPage = () => {
  const history = useHistory();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        try {
          const response = await fetch(`${API_URL}/callback?code=${code}`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Origin': window.location.origin
            }
          });
          
          if (!response.ok) {
            throw new Error('Authentication failed');
          }
          
          const data = await response.json();
          localStorage.setItem('spotify_access_token', data.access_token);
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
          
          history.replace('/main');
        } catch (error) {
          console.error('Callback error:', error);
          history.replace('/');
        }
      }
    };

    handleCallback();
  }, [history]);

  return <div>Loading...</div>;
};

export default CallbackPage; 