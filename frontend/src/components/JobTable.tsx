import { Item } from '../types';

interface JobTableProps {
  jobs: Item[];
  page: number;
  per_page: number;
  total: number;
  onPageChange: (page: number) => void;
}

function isNewJob(firstSeen: string | null): boolean {
  if (!firstSeen) return false;
  const now = new Date();
  const seen = new Date(firstSeen);
  const hours = (now.getTime() - seen.getTime()) / (1000 * 60 * 60);
  return hours < 48;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

const seniorityColors: Record<string, string> = {
  senior: 'bg-purple-100 text-purple-900',
  lead: 'bg-indigo-100 text-indigo-900',
  principal: 'bg-indigo-100 text-indigo-900',
  staff: 'bg-indigo-100 text-indigo-900',
  junior: 'bg-yellow-100 text-yellow-900',
  intern: 'bg-yellow-100 text-yellow-900',
  associate: 'bg-blue-100 text-blue-900',
};

export function JobTable({ jobs, page, per_page, total, onPageChange }: JobTableProps) {
  const pages = Math.ceil(total / per_page);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Titre</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Entreprise</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Localisation</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Séniorité</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map(job => (
            <tr key={job.url} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center space-x-2">
                  {isNewJob(job.first_seen) && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-900 rounded">
                      NEW
                    </span>
                  )}
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium truncate"
                  >
                    {job.title}
                  </a>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{job.job_company || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{job.job_location || '—'}</td>
              <td className="px-4 py-3 text-sm">
                {job.job_seniority ? (
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${seniorityColors[job.job_seniority] || 'bg-gray-100 text-gray-900'}`}>
                    {job.job_seniority}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(job.published)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {jobs.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          Aucune offre d'emploi trouvée
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6 pb-6">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {page} sur {pages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-3 py-2 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
