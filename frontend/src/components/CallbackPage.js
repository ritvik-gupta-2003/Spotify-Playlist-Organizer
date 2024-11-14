import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const CallbackPage = () => {
  const history = useHistory();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        try {
          const response = await fetch(`http://localhost:5010/callback?code=${code}`, {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Authentication failed');
          }
          
          const data = await response.json();
          localStorage.setItem('spotify_access_token', data.access_token);
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
          
          // Clean URL and redirect to main page
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