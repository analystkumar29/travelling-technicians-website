import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function MinimalPage() {
  return (
    <div style={{ 
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Head>
        <title>Minimal Test Page</title>
      </Head>
      
      <h1 style={{ color: '#0d9488', marginBottom: '20px' }}>The Travelling Technicians</h1>
      <h2>Minimal Test Page</h2>
      
      <p style={{ marginTop: '20px', fontSize: '18px', lineHeight: '1.6' }}>
        This is a minimal page to test if basic rendering is working. 
        If you can see this content, the problem is likely in one of the components 
        used in the main pages.
      </p>
      
      <div style={{ marginTop: '30px' }}>
        <Link href="/" style={{ 
          color: '#0d9488', 
          marginRight: '20px',
          textDecoration: 'underline'
        }}>
          Try Main Page
        </Link>
        
        <Link href="/debug" style={{ 
          color: '#0d9488',
          textDecoration: 'underline'
        }}>
          Go to Debug Page
        </Link>
      </div>
      
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '10px' }}>Page Structure Test:</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ 
            flex: 1, 
            minWidth: '200px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            Box 1
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: '200px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            Box 2
          </div>
        </div>
      </div>
    </div>
  );
} 