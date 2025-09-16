import React from 'react';
import Layout from '@/components/layout/Layout';
import ReviewQueue from '@/components/management/ReviewQueue';
import Head from 'next/head';

export default function ReviewQueuePage() {
  return (
    <Layout>
      <Head>
        <title>Review Queue - Management | The Travelling Technicians</title>
        <meta name="description" content="Manage items requiring manual review and approval" />
      </Head>
      
      <ReviewQueue />
    </Layout>
  );
}
