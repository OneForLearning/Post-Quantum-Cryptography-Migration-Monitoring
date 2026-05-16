import type { Item, ItemsResponse } from '../types';
import { ItemRow } from './ItemRow';

interface ItemTableProps {
  data: ItemsResponse | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function ItemTable({ data, loading, page, onPageChange }: ItemTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 h-96 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Aucun article trouvé.</p>
      </div>
    );
  }

  const { items, pagination } = data;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left text-sm font-semibold">Priorité</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Score</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Secteurs</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Titre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Mots-clés</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ItemRow key={item.url} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="border-t border-gray-200 px-4 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.pages} — {pagination.total} articles
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Précédent
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
