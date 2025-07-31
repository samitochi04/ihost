// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    health: '/api/health',
    chat: '/api/chat',
  }
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
};
