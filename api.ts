import { LinkItem } from './types';

const API_BASE_URL = 'https://4io86fy67g.execute-api.us-east-1.amazonaws.com/prod';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  // Handle successful requests with no content (e.g., DELETE)
  if (response.status === 204) {
    return Promise.resolve(undefined as any);
  }

  // All other successful responses should have a JSON body
  return response.json();
}

// --- Links API ---

interface GetLinksApiResponse {
  message: string;
  links: LinkItem[];
}

export const getLinks = async (): Promise<LinkItem[]> => {
  // Using a CORS proxy to bypass "Failed to fetch" errors during development.
  // This is a temporary workaround. The backend (API Gateway) should be configured
  // to handle CORS for all required methods (GET, POST, PUT, DELETE).
  const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${API_BASE_URL}/links`)}`;

  const response = await fetch(proxiedUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data: GetLinksApiResponse = await handleResponse(response);
  return data.links || []; // Return empty array if links are null/undefined
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
  const response = await fetch(`${API_BASE_URL}/links/${linkData.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData),
  });
  return handleResponse<LinkItem>(response);
};

export const deleteLinks = async (ids: string[]): Promise<void> => {
  await fetch(`${API_BASE_URL}/links`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
};
