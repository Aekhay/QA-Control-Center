export interface LinkItem {
  id: string;
  category: string;
  name: string;
  url: string;
}

export interface CategorizedLinks {
  [key: string]: LinkItem[];
}
