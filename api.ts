// api.ts

import { LinkItem } from './types';

// This URL should point to the root of your API Gateway stage
const API_BASE_URL = 'https://4io86fy67g.execute-api.us-east-1.amazonaws.com/prod';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }
  if (response.status === 204) { // Handle No Content for DELETE
    return Promise.resolve(undefined as any);
  }
  return response.json();
}

// --- Links API ---

interface GetLinksApiResponse {
  message: string;
  links: LinkItem[];
}

export const getLinks = async (): Promise<LinkItem[]> => {
  // REMOVED: The CORS proxy is no longer needed.
  // const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${API_BASE_URL}/links`)}`;
  
  // FIXED: Direct call to the API endpoint
  const response = await fetch(`${API_BASE_URL}/links`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data: GetLinksApiResponse = await handleResponse(response);
  return data.links || [];
};

export const addLink = async (linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> => {
  const response = await fetch(`${API_BASE_URL}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData),
  });
  const data: { message: string; data: LinkItem } = await handleResponse(response);
  return data.data;
};

export const updateLink = async (linkData: LinkItem): Promise<LinkItem> => {
  const response = await fetch(`${API_BASE_URL}/links/${linkData.id}`, { // Path includes the ID
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData),
  });
  return handleResponse<LinkItem>(response);
};

// This function now expects a 204 No Content response
export const deleteLinks = async (ids: string[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/links`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  // handleResponse will correctly process the empty 204 response
  await handleResponse(response);
};