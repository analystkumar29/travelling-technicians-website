import React from 'react';
import Layout from '@/components/layout/Layout';
import CustomerFeedback from '@/components/management/CustomerFeedback';
import Head from 'next/head';

export default function CustomerFeedbackPage() {
  return (
    <Layout>
      <Head>
        <title>Customer Feedback - Management | The Travelling Technicians</title>
        <meta name="description" content="Customer-reported issues and suggestions for quality improvement" />
      </Head>
      
      <CustomerFeedback />
    </Layout>
  );
}
