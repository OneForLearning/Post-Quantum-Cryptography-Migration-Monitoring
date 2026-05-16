import type { Item, ItemsResponse, StatsResponse } from './types';

let staticData: Item[] = [];

async function loadStaticData(): Promise<Item[]> {
  if (staticData.length > 0) return staticData;

  const response = await fetch('/data.json');
  if (!response.ok) throw new Error('Failed to fetch static data');
  const data = await response.json();
  staticData = data.items || [];
  return staticData;
}

function filterAndPaginateItems(
  items: Item[],
  sort: string = 'score',
  contentType?: string,
  category?: string,
  sector?: string,
  priority?: string,
  search?: string,
  page: number = 1,
  per_page: number = 25,
): ItemsResponse {
  let filtered = items;

  if (contentType) {
    filtered = filtered.filter(item => item.content_type === contentType);
  }

  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }

  if (sector) {
    filtered = filtered.filter(item => item.sector_tags.includes(sector));
  }

  if (priority) {
    filtered = filtered.filter(item => item.priority === priority);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower) ||
      item.source_name.toLowerCase().includes(searchLower) ||
      item.matched_keywords.some(k => k.toLowerCase().includes(searchLower))
    );
  }

  // Appliquer le tri
  if (sort === 'date') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.published || 0).getTime();
      const dateB = new Date(b.published || 0).getTime();
      return dateB - dateA;
    });
  } else if (sort === 'trending') {
    const now = new Date();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    filtered = filtered.filter(item => {
      if (!item.first_seen) return false;
      const age = now.getTime() - new Date(item.first_seen).getTime();
      return age <= fortyEightHours && item.score >= 20;
    });
    filtered.sort((a, b) => {
      const dateA = new Date(a.first_seen || 0).getTime();
      const dateB = new Date(b.first_seen || 0).getTime();
      return dateB - dateA;
    });
  } else {
    // score (défaut)
    filtered.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const dateA = new Date(a.published || 0).getTime();
      const dateB = new Date(b.published || 0).getTime();
      return dateB - dateA;
    });
  }

  // Pagination
  const total = filtered.length;
  const pages = Math.ceil(total / per_page);
  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paginated = filtered.slice(start, end);

  return {
    items: paginated,
    pagination: {
      page,
      per_page,
      total,
      pages,
    },
  };
}

function calculateStats(items: Item[]): StatsResponse {
  const stats: StatsResponse = {
    total: items.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    categories: {},
    sectors: {},
    languages: {},
  };

  items.forEach(item => {
    if (item.priority === 'critical') stats.critical++;
    else if (item.priority === 'high') stats.high++;
    else if (item.priority === 'medium') stats.medium++;
    else stats.low++;

    stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    item.sector_tags.forEach(sector => {
      stats.sectors[sector] = (stats.sectors[sector] || 0) + 1;
    });
    stats.languages[item.language] = (stats.languages[item.language] || 0) + 1;
  });

  return stats;
}

export async function fetchItems(
  sort: string = 'score',
  _order: string = 'desc',
  category?: string,
  sector?: string,
  priority?: string,
  search?: string,
  page: number = 1,
  per_page: number = 25,
  contentType?: string,
): Promise<ItemsResponse> {
  const items = await loadStaticData();
  return filterAndPaginateItems(items, sort, contentType, category, sector, priority, search, page, per_page);
}

export async function fetchStats(contentType?: string): Promise<StatsResponse> {
  const items = await loadStaticData();
  const filtered = contentType ? items.filter(item => item.content_type === contentType) : items;
  return calculateStats(filtered);
}

export async function fetchJobs(
  sort: string = 'date',
  page: number = 1,
  per_page: number = 25,
  priority?: string,
  search?: string,
): Promise<ItemsResponse> {
  const items = await loadStaticData();
  return filterAndPaginateItems(items, sort, 'job', undefined, undefined, priority, search, page, per_page);
}
