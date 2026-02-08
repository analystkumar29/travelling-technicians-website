import { useState, useEffect, useCallback } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import { authFetch, handleAuthError } from '@/utils/auth';
import { toast } from 'sonner';
import {
  Route,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Zap,
  Map,
  MapPin,
  Building2,
  LayoutGrid,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RouteCount {
  route_type: string;
  total: number;
  active: number;
}

interface RebuildLogEntry {
  id: string;
  trigger_source: string;
  routes_generated: number;
  routes_skipped: number;
  duration_ms: number;
  error_message: string | null;
  start_time: string;
  end_time: string;
}

interface TriggerInfo {
  name: string;
  table: string;
  enabled: boolean;
  type: string;
}

interface IntegrityCheck {
  label: string;
  status: 'ok' | 'warning' | 'error';
  count: number;
  message: string;
}

interface HealthData {
  routeCounts: RouteCount[];
  dimensions: { cities: number; models: number; services: number; neighborhoods: number };
  stats: { total_routes: number; last_refresh: string; refresh_needed: boolean; active_cities: number; active_models: number; active_services: number };
  logs: RebuildLogEntry[];
  triggers: TriggerInfo[];
  integrityChecks: IntegrityCheck[];
  expectedCounts: Record<string, number>;
  recentErrors: number;
}

interface ActionConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  variant: 'default' | 'danger';
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ACTIONS: ActionConfig[] = [
  { key: 'rebuild_all', label: 'Full Rebuild', description: 'Rebuild all ~4,919 routes (takes ~15s)', icon: Database, variant: 'danger' },
  { key: 'refresh_model_service', label: 'Model-Service', description: 'Refresh 3,172 model-service routes', icon: Zap, variant: 'default' },
  { key: 'rebuild_city_pages', label: 'City Pages', description: 'Rebuild 13 city landing pages', icon: Building2, variant: 'default' },
  { key: 'rebuild_city_service', label: 'City-Service', description: 'Rebuild 52 city-service pages', icon: Map, variant: 'default' },
  { key: 'rebuild_neighborhoods', label: 'Neighborhoods', description: 'Rebuild 96 neighborhood pages', icon: MapPin, variant: 'default' },
  { key: 'refresh_sitemap', label: 'Sitemap Cache', description: 'Refresh materialized sitemap view', icon: LayoutGrid, variant: 'default' },
];

const ROUTE_TYPE_LABELS: Record<string, string> = {
  'model-service-page': 'Model-Service',
  'city-model-page': 'City-Model',
  'city-service-page': 'City-Service',
  'city-page': 'City Landing',
  'neighborhood-page': 'Neighborhood',
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function RouteHealthDashboard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ActionConfig | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/management/route-health');
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load');
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load route health data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const executeAction = async (actionKey: string) => {
    setRunningAction(actionKey);
    setConfirmAction(null);
    try {
      const res = await authFetch('/api/management/route-health', {
        method: 'POST',
        body: JSON.stringify({ action: actionKey }),
      });
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success(`${json.message} (${formatDuration(json.duration_ms)})`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast.error(msg);
    } finally {
      setRunningAction(null);
    }
  };

  const handleActionClick = (action: ActionConfig) => {
    if (action.variant === 'danger') {
      setConfirmAction(action);
    } else {
      executeAction(action.key);
    }
  };

  /* --- Loading state --- */
  if (loading && !data) {
    return (
      <>
        <AdminPageHeader title="Route Health" description="Monitor route generation, trigger status, and data integrity." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  /* --- Error state --- */
  if (error && !data) {
    return (
      <>
        <AdminPageHeader title="Route Health" description="Monitor route generation, trigger status, and data integrity." />
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary-800 text-white hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  if (!data) return null;

  /* --- Computed values --- */
  const totalRoutes = data.routeCounts.reduce((sum, r) => sum + r.total, 0);
  const totalActive = data.routeCounts.reduce((sum, r) => sum + r.active, 0);

  const totalExpected = Object.values(data.expectedCounts).reduce((sum, n) => sum + n, 0);
  const coveragePct = totalExpected > 0 ? Math.round((totalActive / totalExpected) * 1000) / 10 : 100;
  const coverageOk = coveragePct >= 99.9;

  const lastLog = data.logs[0];
  const lastDuration = lastLog ? formatDuration(lastLog.duration_ms) : 'N/A';
  const lastSource = lastLog?.trigger_source || 'unknown';
  const lastTime = lastLog ? formatDate(lastLog.start_time) : 'never';

  const issueCount = data.integrityChecks.filter((c) => c.status !== 'ok').length;

  // Group triggers by table
  const triggersByTable = data.triggers.reduce<Record<string, TriggerInfo[]>>((acc, t) => {
    if (!acc[t.table]) acc[t.table] = [];
    acc[t.table].push(t);
    return acc;
  }, {});

  return (
    <>
      <AdminPageHeader
        title="Route Health"
        description="Monitor route generation, trigger status, and data integrity."
        actions={
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Section 1: Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatsCard
          label="Total Routes"
          value={totalRoutes.toLocaleString()}
          icon={Route}
          color="blue"
          trend={
            <span>Last refresh: {data.stats.last_refresh ? timeAgo(data.stats.last_refresh) : 'unknown'}</span>
          }
        />
        <AdminStatsCard
          label="Coverage"
          value={`${coveragePct}%`}
          icon={Target}
          color={coverageOk ? 'green' : 'red'}
          trend={
            <span>{totalActive.toLocaleString()} / {totalExpected.toLocaleString()} expected</span>
          }
        />
        <AdminStatsCard
          label="Last Rebuild"
          value={lastDuration}
          icon={Clock}
          color="amber"
          trend={
            <span>{lastSource} &middot; {lastTime}</span>
          }
        />
        <AdminStatsCard
          label="Issues"
          value={issueCount + data.recentErrors}
          icon={issueCount + data.recentErrors === 0 ? CheckCircle2 : AlertTriangle}
          color={issueCount + data.recentErrors === 0 ? 'green' : 'red'}
          trend={
            <span>{data.recentErrors} log errors, {issueCount} integrity issues</span>
          }
        />
      </div>

      {/* Section 2: Route Type Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 font-heading">Route Type Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Route Type</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.routeCounts.map((rc) => {
                const expected = data.expectedCounts[rc.route_type] ?? rc.total;
                const ok = rc.active >= expected;
                const missing = expected - rc.active;
                return (
                  <tr key={rc.route_type} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {ROUTE_TYPE_LABELS[rc.route_type] || rc.route_type}
                      <span className="ml-2 text-xs text-gray-400 font-mono">{rc.route_type}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700 font-mono">{expected.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-gray-700 font-mono">{rc.total.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-gray-700 font-mono">{rc.active.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      {ok ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <XCircle className="h-3 w-3" /> Missing {missing}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-3 text-gray-900">Total</td>
                <td className="px-6 py-3 text-right text-gray-900 font-mono">{totalExpected.toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-gray-900 font-mono">{totalRoutes.toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-gray-900 font-mono">{totalActive.toLocaleString()}</td>
                <td className="px-6 py-3 text-center">
                  {coverageOk ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> {coveragePct}%
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Data Integrity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 font-heading">Data Integrity</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.integrityChecks.map((check) => (
            <div
              key={check.label}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                check.status === 'ok'
                  ? 'border-green-200 bg-green-50'
                  : check.status === 'warning'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {check.status === 'ok' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : check.status === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  check.status === 'ok' ? 'text-green-800' : check.status === 'warning' ? 'text-amber-800' : 'text-red-800'
                }`}>
                  {check.label}
                </p>
                <p className={`text-xs mt-0.5 ${
                  check.status === 'ok' ? 'text-green-600' : check.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {check.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Rebuild History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 font-heading">Rebuild History</h2>
          <p className="text-xs text-gray-500 mt-1">Last 20 route generation events</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Routes</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Skipped</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No rebuild history found
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50 ${log.error_message ? 'cursor-pointer' : ''}`}
                      onClick={() => log.error_message && setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-3 text-gray-700 whitespace-nowrap">
                        {log.error_message && (
                          expandedLog === log.id
                            ? <ChevronDown className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                            : <ChevronRight className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                        )}
                        {formatDate(log.start_time)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {log.trigger_source}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-gray-700">{log.routes_generated.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-mono text-gray-400">{log.routes_skipped}</td>
                      <td className="px-6 py-3 text-right font-mono text-gray-700">{formatDuration(log.duration_ms)}</td>
                      <td className="px-6 py-3 text-center">
                        {log.error_message ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                            <XCircle className="h-3 w-3" /> Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                    {expandedLog === log.id && log.error_message && (
                      <tr key={`${log.id}-error`}>
                        <td colSpan={6} className="px-6 py-3 bg-red-50">
                          <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">{log.error_message}</pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Trigger Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 font-heading">Trigger Status</h2>
          <p className="text-xs text-gray-500 mt-1">
            {data.triggers.length} triggers across {Object.keys(triggersByTable).length} tables
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.triggers.map((t) => (
                <tr key={`${t.table}-${t.name}`} className="hover:bg-gray-50">
                  <td className="px-6 py-2.5 font-mono text-xs text-gray-700">{t.name}</td>
                  <td className="px-6 py-2.5 text-gray-700">{t.table}</td>
                  <td className="px-6 py-2.5 text-center">
                    {t.enabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {t.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 6: Manual Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 font-heading">Manual Actions</h2>
          <p className="text-xs text-gray-500 mt-1">Trigger route generation functions manually</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const isRunning = runningAction === action.key;
            const isDanger = action.variant === 'danger';
            return (
              <button
                key={action.key}
                onClick={() => handleActionClick(action)}
                disabled={runningAction !== null}
                className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                  isDanger
                    ? 'border-red-200 hover:bg-red-50 hover:border-red-300'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${isDanger ? 'bg-red-100' : 'bg-primary-50'}`}>
                  {isRunning ? (
                    <Loader2 className={`h-5 w-5 animate-spin ${isDanger ? 'text-red-600' : 'text-primary-700'}`} />
                  ) : (
                    <Icon className={`h-5 w-5 ${isDanger ? 'text-red-600' : 'text-primary-700'}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDanger ? 'text-red-900' : 'text-gray-900'}`}>
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm dialog for dangerous actions */}
      <AdminConfirmDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && executeAction(confirmAction.key)}
        title={`Confirm: ${confirmAction?.label || ''}`}
        message="This will rebuild all routes from scratch. The operation takes ~15 seconds and triggers multiple database functions. Existing routes will be regenerated."
        confirmLabel="Run Full Rebuild"
        variant="danger"
        loading={runningAction !== null}
      />
    </>
  );
}
