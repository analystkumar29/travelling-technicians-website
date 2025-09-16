import React from 'react';
import Layout from '@/components/layout/Layout';
import StagingDashboard from '@/components/management/StagingDashboard';
import Head from 'next/head';

export default function StagingPipelinePage() {
  return (
    <Layout>
      <Head>
        <title>Staging Pipeline - Management | The Travelling Technicians</title>
        <meta name="description" content="Monitor and manage data import batches through the staging pipeline" />
      </Head>
      
      <StagingDashboard />
    </Layout>
  );
}
