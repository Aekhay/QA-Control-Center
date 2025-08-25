import { LinkItem, TestDataSet, ApiEnvironment } from './types';

const API_BASE_URL = 'https://4io86fy67g.execute-api.us-east-1.amazonaws.com/prod';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const text = await response.text();
    // Handle empty response body from proxy on success
    return text ? JSON.parse(text) : Promise.resolve({} as T);
  }
  // Handle cases where the response body might be empty (e.g., for DELETE)
  return Promise.resolve(undefined as any);
}

// --- Links API ---

interface GetLinksApiResponse {
    links: LinkItem[];
}

export const getLinks = async (): Promise<LinkItem[]> => {
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/links`)}`);
  const data: GetLinksApiResponse = await handleResponse(response);
  return data.links;
};

export const addLink = async (linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> => {
  // NOTE: POST requests will likely fail due to CORS if not configured on the API Gateway.
  // The allorigins.win proxy does not reliably support POST.
  const response = await fetch(`${API_BASE_URL}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData),
  });
  const result = await handleResponse<{ data: LinkItem }>(response);
  return result.data;
};

export const updateLink = async (linkData: LinkItem): Promise<LinkItem> => {
    // NOTE: PUT requests will likely fail due to CORS if not configured on the API Gateway.
    const response = await fetch(`${API_BASE_URL}/links/${linkData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkData),
    });
    return handleResponse<LinkItem>(response);
};

export const deleteLinks = async (ids: string[]): Promise<void> => {
    // NOTE: DELETE requests will likely fail due to CORS if not configured on the API Gateway.
    await fetch(`${API_BASE_URL}/links`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
    });
};


// --- Test Data API ---

interface GetTestDataApiResponse {
    testDataSets: TestDataSet[];
}

export const getTestDataSets = async (): Promise<TestDataSet[]> => {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/test-data`)}`);
    const data: GetTestDataApiResponse = await handleResponse(response);
    return data.testDataSets;
};

export const addTestDataSet = async (dataSet: Omit<TestDataSet, 'id'>): Promise<TestDataSet> => {
    // NOTE: POST requests will likely fail due to CORS if not configured on the API Gateway.
    const response = await fetch(`${API_BASE_URL}/test-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSet),
    });
    const result = await handleResponse<{ data: TestDataSet }>(response);
    return result.data;
};

export const deleteTestDataSet = async (id: string): Promise<void> => {
    // NOTE: DELETE requests will likely fail due to CORS if not configured on the API Gateway.
    await fetch(`${API_BASE_URL}/test-data/${id}`, { method: 'DELETE' });
};


// --- API Environments API ---

interface GetApiEnvironmentsResponse {
    environments: ApiEnvironment[];
}

export const getApiEnvironments = async (): Promise<ApiEnvironment[]> => {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/api-environments`)}`);
    const data: GetApiEnvironmentsResponse = await handleResponse(response);
    return data.environments;
};

export const addApiEnvironment = async (env: Omit<ApiEnvironment, 'id'>): Promise<ApiEnvironment> => {
    // NOTE: POST requests will likely fail due to CORS if not configured on the API Gateway.
    const response = await fetch(`${API_BASE_URL}/api-environments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(env),
    });
    const result = await handleResponse<{ data: ApiEnvironment }>(response);
    return result.data;
};

export const updateApiEnvironment = async (env: ApiEnvironment): Promise<ApiEnvironment> => {
    // NOTE: PUT requests will likely fail due to CORS if not configured on the API Gateway.
    const response = await fetch(`${API_BASE_URL}/api-environments/${env.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(env),
    });
    return handleResponse<ApiEnvironment>(response);
};

export const deleteApiEnvironment = async (id: string): Promise<void> => {
    // NOTE: DELETE requests will likely fail due to CORS if not configured on the API Gateway.
    await fetch(`${API_BASE_URL}/api-environments/${id}`, { method: 'DELETE' });
};
