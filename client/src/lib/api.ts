
// API client for backend communication

// Base API URL - adjust if your backend runs on a different port
const API_BASE_URL = 'http://localhost:3001/api';

// Utility function for making API requests
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session-based auth
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error('API request error:', err);
    throw err;
  }
}

// Story API functions
export const storyApi = {
  getOptions: () => apiRequest('GET', '/story/options'),
  
  generateStory: (storyParams: any) => 
    apiRequest('POST', '/story/generate', {
      ...storyParams,
      user_id: 'default_user', // In a real app, get from auth
    }),
  
  makeChoice: (choiceData: any) => 
    apiRequest('POST', '/story/choice', {
      ...choiceData,
      user_id: 'default_user', // In a real app, get from auth
    }),
  
  getCurrentStory: () => 
    apiRequest('GET', '/story/current/default_user'), // In a real app, get from auth
};

// User progress API functions
export const userApi = {
  getProgress: () => 
    apiRequest('GET', '/progress/default_user'), // In a real app, get from auth
};

// Missions API functions
export const missionsApi = {
  completeMission: (missionId: number) => 
    apiRequest('POST', '/missions/complete', {
      user_id: 'default_user', // In a real app, get from auth
      mission_id: missionId,
    }),
};
