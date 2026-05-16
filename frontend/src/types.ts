export interface Item {
  source_name: string;
  title: string;
  url: string;
  summary: string;
  published: string | null;
  category: string;
  sector_tags: string[];
  priority: string;
  first_seen: string | null;
  language: string;
  matched_keywords: string[];
  score: number;
  content_type: string;
  job_company?: string;
  job_location?: string;
  job_seniority?: string;
}

export interface ItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface StatsResponse {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  categories: Record<string, number>;
  sectors: Record<string, number>;
  languages: Record<string, number>;
}

export interface Source {
  name: string;
  type: string;
  url: string;
  enabled: boolean;
  language: string;
  tags: string[];
}

export interface SourcesResponse {
  sources: Source[];
}

export type SortOption = 'score' | 'date' | 'trending';
