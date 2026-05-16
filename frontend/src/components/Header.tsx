export function Header() {
  const now = new Date().toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Veille PQC</h1>
        <p className="text-gray-600 text-sm mt-1">
          Surveillance de la cryptographie post-quantique — Généré le {now}
        </p>
      </div>
    </header>
  );
}
