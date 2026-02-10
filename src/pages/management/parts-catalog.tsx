/**
 * Admin Parts Catalog Page
 * Browse MobileSentrix wholesale parts reference data.
 */

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { authFetch, handleAuthError } from '@/utils/auth';
import { toast } from 'sonner';
import {
  Package, Search, RefreshCw, Loader2, ExternalLink, X,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
} from 'lucide-react';

interface Part {
  id: string;
  sku: string;
  name: string;
  brand: string;
  device_line: string | null;
  model_compatibility: string | null;
  category: string | null;
  quality_tier: string;
  wholesale_price: number | null;
  is_in_stock: boolean;
  warranty_info: string | null;
  source_url: string | null;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  inStock: number;
  outOfStock: number;
  avgPrice: number;
  lastSynced: string | null;
}

interface ScrapeLog {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  products_found: number;
  products_upserted: number;
  errors: unknown[];
  duration_ms: number | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'screen', label: 'Screen' },
  { value: 'battery', label: 'Battery' },
  { value: 'keyboard', label: 'Keyboard' },
  { value: 'trackpad', label: 'Trackpad' },
  { value: 'charger', label: 'Charger' },
  { value: 'fan', label: 'Fan' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'camera', label: 'Camera' },
  { value: 'hinge', label: 'Hinge' },
  { value: 'cable', label: 'Cable' },
  { value: 'logic_board', label: 'Logic Board' },
  { value: 'ssd', label: 'SSD' },
  { value: 'ram', label: 'RAM' },
  { value: 'other', label: 'Other' },
];

const QUALITY_TIERS = [
  { value: 'all', label: 'All Quality' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'oem', label: 'OEM' },
];

export default function PartsCatalog() {
  const [parts, setParts] = useState<Part[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [scrapeLogs, setScrapeLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [deviceLine, setDeviceLine] = useState('all');
  const [category, setCategory] = useState('all');
  const [quality, setQuality] = useState('all');
  const [stock, setStock] = useState('all');

  // UI state
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await authFetch('/api/management/parts-catalog?stats=true');
      if (!res.ok) { handleAuthError(res); return; }
      const data = await res.json();
      setStats(data.stats);
    } catch {
      // stats are non-critical
    }
  }, []);

  const fetchParts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.set('search', search);
      if (deviceLine !== 'all') params.set('device_line', deviceLine);
      if (category !== 'all') params.set('category', category);
      if (quality !== 'all') params.set('quality', quality);
      if (stock !== 'all') params.set('stock', stock);

      const res = await authFetch(`/api/management/parts-catalog?${params}`);
      if (!res.ok) { handleAuthError(res); return; }
      const data = await res.json();
      setParts(data.parts || []);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  }, [search, deviceLine, category, quality, stock]);

  const fetchScrapeLogs = useCallback(async () => {
    try {
      const res = await authFetch('/api/management/scrape-logs');
      if (!res.ok) return;
      const data = await res.json();
      setScrapeLogs(data.logs || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchParts(1);
    fetchScrapeLogs();
  }, [fetchStats, fetchParts, fetchScrapeLogs]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchParts(1), 300);
    return () => clearTimeout(timer);
  }, [search, deviceLine, category, quality, stock, fetchParts]);

  const qualityBadge = (tier: string) => {
    const colors: Record<string, string> = {
      oem: 'bg-green-100 text-green-800',
      premium: 'bg-blue-100 text-blue-800',
      standard: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[tier] || 'bg-gray-100 text-gray-800'}`}>
        {tier}
      </span>
    );
  };

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const scrapeStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      completed_with_errors: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <AdminLayout title="Parts Catalog">
      <AdminPageHeader
        title="Parts Catalog"
        description={stats ? `${stats.total} parts — Last synced: ${timeAgo(stats.lastSynced)}` : 'Loading...'}
        actions={
          <button
            onClick={() => { fetchStats(); fetchParts(pagination.page); fetchScrapeLogs(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Total Parts</div>
            <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500">In Stock</div>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Out of Stock</div>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Avg Wholesale</div>
            <div className="text-2xl font-bold text-accent-600">${stats.avgPrice.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU, name, or model..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={deviceLine}
            onChange={(e) => setDeviceLine(e.target.value)}
          >
            <option value="all">All Devices</option>
            <option value="MacBook Pro">MacBook Pro</option>
            <option value="MacBook Air">MacBook Air</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
          >
            {QUALITY_TIERS.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : parts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No parts found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Quality</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parts.map((part) => (
                    <tr
                      key={part.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedPart(part)}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 whitespace-nowrap">
                        {part.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {part.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                        {part.model_compatibility || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell capitalize">
                        {part.category?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {qualityBadge(part.quality_tier)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 whitespace-nowrap">
                        {part.wholesale_price != null ? `$${Number(part.wholesale_price).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${part.is_in_stock ? 'bg-green-500' : 'bg-red-400'}`} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 hidden xl:table-cell whitespace-nowrap">
                        {timeAgo(part.last_synced_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchParts(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchParts(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Scrape History (collapsible) */}
      <div className="mt-8">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
        >
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Scrape History
        </button>
        {showHistory && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {scrapeLogs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No scrape runs yet</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Found</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Upserted</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scrapeLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(log.started_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {scrapeStatusBadge(log.status)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">
                        {log.products_found}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900">
                        {log.products_upserted}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-gray-500">
                        {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedPart(null)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
              <button
                onClick={() => setSelectedPart(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-gray-900 pr-8 mb-4">{selectedPart.name}</h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">SKU</div>
                    <div className="text-sm font-mono text-gray-900">{selectedPart.sku}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Brand</div>
                    <div className="text-sm text-gray-900">{selectedPart.brand}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Device Line</div>
                    <div className="text-sm text-gray-900">{selectedPart.device_line || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Model</div>
                    <div className="text-sm text-gray-900">{selectedPart.model_compatibility || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Category</div>
                    <div className="text-sm text-gray-900 capitalize">{selectedPart.category?.replace(/_/g, ' ') || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Quality</div>
                    <div className="mt-0.5">{qualityBadge(selectedPart.quality_tier)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Wholesale Price</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPart.wholesale_price != null ? `$${Number(selectedPart.wholesale_price).toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Stock</div>
                    <div className="text-sm">
                      <span className={`inline-flex items-center gap-1.5 ${selectedPart.is_in_stock ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`inline-block h-2 w-2 rounded-full ${selectedPart.is_in_stock ? 'bg-green-500' : 'bg-red-400'}`} />
                        {selectedPart.is_in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPart.warranty_info && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Warranty</div>
                    <div className="text-sm text-gray-900">{selectedPart.warranty_info}</div>
                  </div>
                )}

                {selectedPart.source_url && (
                  <div className="pt-2 border-t border-gray-200">
                    <a
                      href={selectedPart.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View on MobileSentrix
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-400 pt-2">
                  Last synced: {new Date(selectedPart.last_synced_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
