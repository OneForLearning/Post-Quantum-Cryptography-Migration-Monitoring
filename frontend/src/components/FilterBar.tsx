import type { StatsResponse, SortOption } from '../types';

interface FilterBarProps {
  stats: StatsResponse | null;
  sort: SortOption;
  category: string;
  sector: string;
  search: string;
  onSortChange: (sort: SortOption) => void;
  onCategoryChange: (category: string) => void;
  onSectorChange: (sector: string) => void;
  onSearchChange: (search: string) => void;
}

export function FilterBar({
  stats,
  sort,
  category,
  sector,
  search,
  onSortChange,
  onCategoryChange,
  onSectorChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
      {/* Tri */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tri</label>
        <div className="flex gap-2 flex-wrap">
          {(['score', 'date', 'trending'] as SortOption[]).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                sort === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {s === 'score' ? 'Score' : s === 'date' ? 'Date' : 'Tendances'}
            </button>
          ))}
        </div>
      </div>

      {/* Recherche */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Titre, source, mots-clés..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtres multi-select */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Catégories */}
          {Object.keys(stats.categories).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {Object.keys(stats.categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({stats.categories[cat]})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Secteurs */}
          {Object.keys(stats.sectors).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secteur</label>
              <select
                value={sector}
                onChange={(e) => onSectorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les secteurs</option>
                {Object.keys(stats.sectors).map((sec) => (
                  <option key={sec} value={sec}>
                    {sec} ({stats.sectors[sec]})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
