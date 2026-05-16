import { useEffect, useState } from 'react';
import { fetchJobs, fetchStats } from '../api';
import { StatsResponse } from '../types';
import { JobTable } from './JobTable';

export function JobsView() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [seniority, setSeniority] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0, pages: 1 });

  const per_page = 25;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const jobsResponse = await fetchJobs('date', page, per_page, seniority || undefined, search || undefined);
        setJobs(jobsResponse.items);
        setPagination(jobsResponse.pagination);

        const statsResponse = await fetchStats('job');
        setStats(statsResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, search, seniority]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">Total</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Titre, entreprise, localisation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Séniorité
            </label>
            <select
              value={seniority}
              onChange={(e) => {
                setSeniority(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les niveaux</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="principal">Principal</option>
              <option value="staff">Staff</option>
              <option value="junior">Junior</option>
              <option value="intern">Intern</option>
              <option value="associate">Associate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Chargement des offres...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && (
        <JobTable
          jobs={jobs}
          page={pagination.page}
          per_page={pagination.per_page}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
