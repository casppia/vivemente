import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FacebookProvider } from 'react-facebook';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <FacebookProvider appId="YOUR_FACEBOOK_APP_ID">
        <App />
      </FacebookProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);