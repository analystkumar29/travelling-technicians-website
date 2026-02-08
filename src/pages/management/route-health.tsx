import AdminLayout from '@/components/admin/AdminLayout';
import RouteHealthDashboard from '@/components/management/RouteHealthDashboard';

export default function RouteHealthPage() {
  return (
    <AdminLayout title="Route Health">
      <RouteHealthDashboard />
    </AdminLayout>
  );
}
