import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/audit-logs');

interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  operation: string;
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

interface ApiResponse {
  success: boolean;
  logs?: AuditLog[];
  stats?: AuditStats;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const supabase = getServiceSupabase();

  try {
    const {
      page = '1',
      limit = '50',
      table,
      operation,
      user,
      dateFrom,
      dateTo,
      export: exportFormat
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    apiLogger.info('Fetching audit logs', { page: pageNum, limit: limitNum });

    // If export requested, handle CSV export
    if (exportFormat === 'csv') {
      return await handleCSVExport(req, res, supabase);
    }

    // Build query for audit logs
    let logsQuery = supabase
      .from('recent_audit_activity')
      .select('*');

    // Apply filters
    if (table && table !== 'all') {
      logsQuery = logsQuery.eq('table_name', table);
    }
    if (operation && operation !== 'all') {
      logsQuery = logsQuery.eq('operation', operation);
    }
    if (user && user !== 'all') {
      logsQuery = logsQuery.eq('user_email', user);
    }
    if (dateFrom) {
      logsQuery = logsQuery.gte('timestamp', new Date(dateFrom as string).toISOString());
    }
    if (dateTo) {
      logsQuery = logsQuery.lte('timestamp', new Date(dateTo as string).toISOString());
    }

    // Apply pagination
    logsQuery = logsQuery
      .order('timestamp', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      apiLogger.error('Error fetching audit logs', { error: logsError });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs',
        error: logsError.message
      });
    }

    // Get statistics
    const stats = await getAuditStats(supabase);

    apiLogger.info('Successfully fetched audit logs', { count: logs?.length || 0 });

    return res.status(200).json({
      success: true,
      logs: logs || [],
      stats
    });

  } catch (error) {
    apiLogger.error('Unexpected error in audit logs API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch audit logs'
    });
  }
}

async function getAuditStats(supabase: any): Promise<AuditStats> {
  try {
    // Get total changes
    const { count: totalChanges } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    // Get today's changes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayChanges } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Get active users (users who made changes in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: activeUsers } = await supabase
      .from('audit_logs')
      .select('user_email')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .not('user_email', 'is', null);

    const uniqueUsers = new Set(activeUsers?.map((u: any) => u.user_email)).size;

    // Get tables modified (in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: tablesModified } = await supabase
      .from('audit_logs')
      .select('table_name')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const uniqueTables = new Set(tablesModified?.map((t: any) => t.table_name)).size;

    return {
      total_changes: totalChanges || 0,
      today_changes: todayChanges || 0,
      users_active: uniqueUsers,
      tables_modified: uniqueTables
    };
  } catch (error) {
    apiLogger.error('Error getting audit stats', { error });
    return {
      total_changes: 0,
      today_changes: 0,
      users_active: 0,
      tables_modified: 0
    };
  }
}

async function handleCSVExport(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { table, operation, user, dateFrom, dateTo } = req.query;

    apiLogger.info('Exporting audit logs to CSV');

    // Build query for export (no pagination limits)
    let exportQuery = supabase
      .from('recent_audit_activity')
      .select('*');

    // Apply same filters as regular query
    if (table && table !== 'all') {
      exportQuery = exportQuery.eq('table_name', table);
    }
    if (operation && operation !== 'all') {
      exportQuery = exportQuery.eq('operation', operation);
    }
    if (user && user !== 'all') {
      exportQuery = exportQuery.eq('user_email', user);
    }
    if (dateFrom) {
      exportQuery = exportQuery.gte('timestamp', new Date(dateFrom as string).toISOString());
    }
    if (dateTo) {
      exportQuery = exportQuery.lte('timestamp', new Date(dateTo as string).toISOString());
    }

    exportQuery = exportQuery.order('timestamp', { ascending: false });

    const { data: exportLogs, error: exportError } = await exportQuery;

    if (exportError) {
      apiLogger.error('Error exporting audit logs', { error: exportError });
      return res.status(500).json({
        success: false,
        message: 'Failed to export audit logs',
        error: exportError.message
      });
    }

    // Generate CSV
    const csvHeaders = [
      'Timestamp',
      'Operation',
      'Table',
      'Record ID',
      'Record Name',
      'User Email',
      'Changed Fields'
    ];

    const csvRows = (exportLogs || []).map((log: any) => [
      new Date(log.timestamp).toISOString(),
      log.operation,
      log.table_name,
      log.record_id,
      log.record_name || '',
      log.user_email || '',
      (log.changed_fields || []).join('; ')
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any[]) => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);

    return res.status(200).send(csvContent);

  } catch (error) {
    apiLogger.error('Error in CSV export', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to export audit logs'
    });
  }
}
