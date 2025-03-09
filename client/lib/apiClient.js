/**
 * Firebase ക്ലൗഡ് ഫങ്ഷൻസിലേക്കുള്ള API റിക്വസ്റ്റുകൾ മാനേജ് ചെയ്യുന്നതിനുള്ള ക്ലയന്റ്
 */

// Firebase ഫങ്ഷൻ API എൻഡ്പോയിന്റ് - ഡെപ്ലോയ് ചെയ്യുമ്പോൾ URL മാറ്റുക
const API_BASE_URL = typeof window !== 'undefined' 
  ? (window.ENV?.FIREBASE_API_URL || "https://your-firebase-project-id.web.app/api")
  : "https://your-firebase-project-id.web.app/api";

/**
 * API ക്ലയന്റ് വഴി റിക്വസ്റ്റുകൾ അയക്കാനുള്ള ഫങ്ഷൻ
 * 
 * @param {string} endpoint - API എൻഡ്പോയിന്റ് പാത്ത്
 * @param {object} options - ഫെച്ച് ഓപ്ഷനുകൾ
 * @returns {Promise<any>} - API റെസ്പോൺസ്
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  // ഡിഫോൾട്ട് ഓപ്ഷനുകൾ
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // യൂസറിന്റെ ഓത് ടോക്കൺ ഉൾപ്പെടുത്തുന്നു, ഉണ്ടെങ്കിൽ
  const authToken = localStorage.getItem('authToken'); 
  if (authToken) {
    defaultOptions.headers.Authorization = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * വിവിധ API കോളുകൾ നടത്തുന്നതിനുള്ള വരാപ്പർ ഫങ്ഷനുകൾ
 */
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api; 