import type { Item } from '../types';

interface ItemRowProps {
  item: Item;
}

const priorityColors: Record<string, { bg: string; text: string; badge: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-200 text-red-900' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-200 text-orange-900' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-200 text-yellow-900' },
  low: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-200 text-green-900' },
  '': { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-900' },
};

export function ItemRow({ item }: ItemRowProps) {
  const colors = priorityColors[item.priority] || priorityColors[''];
  const isNew = item.first_seen
    ? new Date(item.first_seen).getTime() > Date.now() - 48 * 60 * 60 * 1000
    : false;

  return (
    <tr className={`${colors.bg} border-b border-gray-200 hover:opacity-75 transition-opacity`}>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colors.badge}`}>
          {item.priority || 'unknown'}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium">{item.score}</td>
      <td className="px-4 py-3 text-sm">{item.category}</td>
      <td className="px-4 py-3 text-xs">
        {item.sector_tags.length > 0 ? item.sector_tags.join(', ') : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">{item.source_name}</td>
      <td className="px-4 py-3">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
          {item.title}
        </a>
        {isNew && <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-purple-200 text-purple-900 rounded">NEW</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
        {item.published ? new Date(item.published).toLocaleDateString('fr-FR') : '—'}
      </td>
      <td className="px-4 py-3 text-xs">
        {item.matched_keywords.length > 0 ? item.matched_keywords.join(', ') : '—'}
      </td>
    </tr>
  );
}
