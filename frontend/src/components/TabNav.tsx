interface TabNavProps {
  activeTab: 'veille' | 'jobs';
  onTabChange: (tab: 'veille' | 'jobs') => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 flex space-x-8">
        <button
          onClick={() => onTabChange('veille')}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
            activeTab === 'veille'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Veille PQC
        </button>
        <button
          onClick={() => onTabChange('jobs')}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
            activeTab === 'jobs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Offres d'emploi
        </button>
      </nav>
    </div>
  );
}
