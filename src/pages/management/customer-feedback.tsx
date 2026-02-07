import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CustomerFeedback from '@/components/management/CustomerFeedback';

export default function CustomerFeedbackPage() {
  return (
    <AdminLayout title="Customer Feedback">
      <CustomerFeedback />
    </AdminLayout>
  );
}
