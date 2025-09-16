import React from 'react';
import Layout from '@/components/layout/Layout';
import AuditLogs from '@/components/management/AuditLogs';
import Head from 'next/head';

export default function AuditLogsPage() {
  return (
    <Layout>
      <Head>
        <title>Audit Logs - Management | The Travelling Technicians</title>
        <meta name="description" content="Complete audit trail of all system changes and user actions" />
      </Head>
      
      <AuditLogs />
    </Layout>
  );
}
