import type { StatsResponse } from '../types';

interface StatsBarProps {
  stats: StatsResponse | null;
  loading: boolean;
}

export function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Total', value: stats.total, color: 'bg-gray-100' },
    { label: 'Critical', value: stats.critical, color: 'bg-red-100', textColor: 'text-red-700' },
    { label: 'High', value: stats.high, color: 'bg-orange-100', textColor: 'text-orange-700' },
    { label: 'Medium', value: stats.medium, color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { label: 'Low', value: stats.low, color: 'bg-green-100', textColor: 'text-green-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className={`${card.color} rounded-lg p-4 text-center`}>
          <div className="text-gray-600 text-sm font-medium">{card.label}</div>
          <div className={`text-3xl font-bold mt-2 ${card.textColor || 'text-gray-900'}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
