import type { ItemsResponse, StatsResponse, SourcesResponse } from './types';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

export async function fetchItems(
  sort: string = 'score',
  order: string = 'desc',
  category?: string,
  sector?: string,
  priority?: string,
  search?: string,
  page: number = 1,
  per_page: number = 25,
): Promise<ItemsResponse> {
  const params = new URLSearchParams({
    sort,
    order,
    page: page.toString(),
    per_page: per_page.toString(),
  });

  if (category) params.append('category', category);
  if (sector) params.append('sector', sector);
  if (priority) params.append('priority', priority);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE}/items?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE}/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function fetchSources(): Promise<SourcesResponse> {
  const response = await fetch(`${API_BASE}/sources`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Failed to fetch sources');
  return response.json();
}

// Mode statique : charger depuis data.json
export async function fetchStaticData(): Promise<ItemsResponse> {
  const response = await fetch('/data.json');
  if (!response.ok) throw new Error('Failed to fetch static data');
  const data = await response.json();
  return {
    items: data.items,
    pagination: {
      page: 1,
      per_page: data.items.length,
      total: data.items.length,
      pages: 1,
    },
  };
}
