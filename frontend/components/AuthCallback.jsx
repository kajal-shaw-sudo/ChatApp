import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr));
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to main app
      window.location.href = '/';
    } else {
      // Error in auth
      window.location.href = '/?error=auth_failed';
    }
  }, []);

  return (
    <div className="app centered">
      <div className="card">
        <h2>Authenticating...</h2>
        <p className="small">Please wait while we log you in</p>
      </div>
    </div>
  );
}