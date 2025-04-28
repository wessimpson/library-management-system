import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../utils/AuthContext';

const DebugMonitor = () => {
  const { currentUser, isAuthenticated, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    // Add Axios request interceptor to log unauthorized requests
    const axiosInterceptor = axios.interceptors.request.use(
      config => {
        const url = config.url;
        const method = config.method?.toUpperCase() || 'GET';
          
        if (method === 'POST' && url.includes('/api/events')) {
          console.log('DEBUG: Intercepted POST request to /api/events:', { 
            url, 
            auth: isAuthenticated,
            isAdmin,
            headers: config.headers 
          });
        }
          
        return config;
      },
      error => Promise.reject(error)
    );
      
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.request.eject(axiosInterceptor);
    };
  }, [isAuthenticated, isAdmin]);

  return null; // This component doesn't render anything
};

export default DebugMonitor;