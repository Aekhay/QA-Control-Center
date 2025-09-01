export type HealthStatus = 'checking' | 'online' | 'offline' | 'idle';

export interface LinkItem {
  id: string;
  category: string;
  name: string;
  url: string;
  healthStatus?: HealthStatus;
}

export interface CategorizedLinks {
  [key: string]: LinkItem[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface TestDataSet {
    id: string;
    name: string;
    tableData: TableData;
    createdAt: string;
}

export interface ApiEnvironment {
  id: string;
  name: string;
  url: string;
}

export interface SiblingApiResponse {
  siblings?: string[];
}

export interface ChromeProfile {
  id: string;
  name: string;
  directoryName: string;
}
