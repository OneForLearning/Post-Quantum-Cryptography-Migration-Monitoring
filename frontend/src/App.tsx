import { useState, useEffect } from 'react';
import type { ItemsResponse, StatsResponse, SortOption } from './types';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ItemTable } from './components/ItemTable';
import { TabNav } from './components/TabNav';
import { JobsView } from './components/JobsView';
import { fetchItems, fetchStats } from './api';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'veille' | 'jobs'>('veille');
  const [items, setItems] = useState<ItemsResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('score');
  const [category, setCategory] = useState('');
  const [sector, setSector] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [useStaticData, setUseStaticData] = useState(false);

  // Déterminer si on utilise le mode statique (GitHub Pages)
  useEffect(() => {
    const isProd = (import.meta as any).env.MODE === 'production';
    setUseStaticData(isProd && !window.location.hostname.includes('localhost'));
  }, []);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (useStaticData) {
          // Mode statique : une seule requête pour tout
          const itemsData = await fetchItems(sort, 'desc', category || undefined, sector || undefined, undefined, search, page, 25);
          setItems(itemsData);
          // Générer les stats à partir des items statiques
          const stats = generateStats(itemsData.items);
          setStats(stats);
        } else {
          // Mode API
          const [itemsData, statsData] = await Promise.all([
            fetchItems(sort, 'desc', category || undefined, sector || undefined, undefined, search, page, 25),
            fetchStats(),
          ]);
          setItems(itemsData);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sort, category, sector, search, page, useStaticData]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSectorChange = (newSector: string) => {
    setSector(newSector);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'veille' ? (
          <div className="space-y-6">
            <StatsBar stats={stats} loading={loading} />
            <FilterBar
              stats={stats}
              sort={sort}
              category={category}
              sector={sector}
              search={search}
              onSortChange={handleSortChange}
              onCategoryChange={handleCategoryChange}
              onSectorChange={handleSectorChange}
              onSearchChange={handleSearch}
            />
            <ItemTable
              data={items}
              loading={loading}
              page={page}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <JobsView />
        )}
      </main>
    </div>
  );
}

// Utilitaire pour générer les stats depuis les items statiques
function generateStats(allItems: any[]) {
  const stats = {
    total: allItems.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    categories: {} as Record<string, number>,
    sectors: {} as Record<string, number>,
    languages: {} as Record<string, number>,
  };

  allItems.forEach((item) => {
    // Compter par priorité
    if (item.priority === 'critical') stats.critical++;
    else if (item.priority === 'high') stats.high++;
    else if (item.priority === 'medium') stats.medium++;
    else if (item.priority === 'low') stats.low++;

    // Compter par catégorie
    stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;

    // Compter par secteur
    (item.sector_tags || []).forEach((sector: string) => {
      stats.sectors[sector] = (stats.sectors[sector] || 0) + 1;
    });

    // Compter par langue
    stats.languages[item.language] = (stats.languages[item.language] || 0) + 1;
  });

  return stats;
}

export default App;
