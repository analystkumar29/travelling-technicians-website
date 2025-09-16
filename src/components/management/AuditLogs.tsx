import React, { useState, useEffect } from 'react';
import { 
  FaHistory, 
  FaUser, 
  FaCalendarAlt, 
  FaTable, 
  FaEdit, 
  FaPlus, 
  FaTrash,
  FaFilter,
  FaDownload,
  FaSyncAlt
} from 'react-icons/fa';

interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: any;
  new_values?: any;
  changed_fields: string[];
  user_email?: string;
  timestamp: string;
  record_name?: string;
}

interface AuditStats {
  total_changes: number;
  today_changes: number;
  users_active: number;
  tables_modified: number;
}

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    total_changes: 0,
    today_changes: 0,
    users_active: 0,
    tables_modified: 0
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    table: string;
    operation: string;
    user: string;
    dateFrom: string;
    dateTo: string;
  }>({
    table: 'all',
    operation: 'all',
    user: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadAuditLogs();
  }, [filter, currentPage]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filter.table !== 'all' && { table: filter.table }),
        ...(filter.operation !== 'all' && { operation: filter.operation }),
        ...(filter.user !== 'all' && { user: filter.user }),
        ...(filter.dateFrom && { dateFrom: filter.dateFrom }),
        ...(filter.dateTo && { dateTo: filter.dateTo })
      });

      const response = await fetch(`/api/management/audit-logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAuditLogs(data.logs || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        export: 'csv',
        ...(filter.table !== 'all' && { table: filter.table }),
        ...(filter.operation !== 'all' && { operation: filter.operation }),
        ...(filter.user !== 'all' && { user: filter.user }),
        ...(filter.dateFrom && { dateFrom: filter.dateFrom }),
        ...(filter.dateTo && { dateTo: filter.dateTo })
      });

      const response = await fetch(`/api/management/audit-logs?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      alert('Error exporting audit logs');
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'INSERT': return <FaPlus className="w-3 h-3" />;
      case 'UPDATE': return <FaEdit className="w-3 h-3" />;
      case 'DELETE': return <FaTrash className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatFieldChanges = (log: AuditLog) => {
    if (!log.changed_fields || log.changed_fields.length === 0) {
      return 'No specific fields tracked';
    }
    
    return log.changed_fields.join(', ');
  };

  const resetFilters = () => {
    setFilter({
      table: 'all',
      operation: 'all',
      user: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="p-6 text-center">
        <FaSyncAlt className="animate-spin mx-auto h-8 w-8 text-gray-500 mb-4" />
        <p>Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <FaHistory className="mr-3" />
          Audit Logs
        </h2>
        <p className="text-gray-600">
          Complete audit trail of all system changes and user actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Total Changes</div>
          <div className="text-2xl font-bold">{stats.total_changes}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-sm text-blue-600">Today's Changes</div>
          <div className="text-2xl font-bold text-blue-700">{stats.today_changes}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-600">Active Users</div>
          <div className="text-2xl font-bold text-green-700">{stats.users_active}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
          <div className="text-sm text-purple-600">Tables Modified</div>
          <div className="text-2xl font-bold text-purple-700">{stats.tables_modified}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter.table}
              onChange={(e) => setFilter({...filter, table: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Tables</option>
              <option value="device_models">Device Models</option>
              <option value="brands">Brands</option>
              <option value="dynamic_pricing">Pricing</option>
              <option value="services">Services</option>
            </select>
          </div>

          <select
            value={filter.operation}
            onChange={(e) => setFilter({...filter, operation: e.target.value})}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Operations</option>
            <option value="INSERT">Creates</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletes</option>
          </select>

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
              placeholder="From date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
              placeholder="To date"
            />
          </div>

          <button
            onClick={resetFilters}
            className="px-4 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {auditLogs.length} of {stats.total_changes} changes
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadAuditLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              disabled={loading}
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={exportAuditLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      {auditLogs.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Operation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Table
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Record
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Changes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOperationColor(log.operation)}`}>
                      {getOperationIcon(log.operation)}
                      <span className="ml-1">{log.operation}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaTable className="mr-2 text-gray-400" />
                      {log.table_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{log.record_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">ID: {log.record_id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.user_email ? (
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        {log.user_email}
                      </div>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={formatFieldChanges(log)}>
                      {formatFieldChanges(log)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(stats.total_changes / itemsPerPage)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(stats.total_changes / itemsPerPage)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No audit logs found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Operation:</strong> {selectedLog.operation}
              </div>
              <div>
                <strong>Table:</strong> {selectedLog.table_name}
              </div>
              <div>
                <strong>Record ID:</strong> {selectedLog.record_id}
              </div>
              <div>
                <strong>User:</strong> {selectedLog.user_email || 'System'}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
              <div>
                <strong>Changed Fields:</strong> {formatFieldChanges(selectedLog)}
              </div>
            </div>

            {selectedLog.old_values && (
              <div className="mb-4">
                <strong>Old Values:</strong>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.old_values, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_values && (
              <div className="mb-4">
                <strong>New Values:</strong>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.new_values, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
