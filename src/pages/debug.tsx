import React from 'react';
import Head from 'next/head';

export default function DebugPage() {
  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Head>
        <title>Debug Page</title>
      </Head>
      
      <h1 style={{ color: '#0d9488' }}>Debug Page</h1>
      <p>If you can see this page, Next.js is rendering correctly.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Common White Screen Causes:</h2>
        <ul>
          <li>React rendering errors in components</li>
          <li>CSS issues making content invisible</li>
          <li>JavaScript errors in critical components</li>
          <li>Next.js or React configuration problems</li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        border: '1px solid #e2e8f0',
        borderRadius: '5px',
        backgroundColor: '#f8fafc'
      }}>
        <h3>Next Steps:</h3>
        <p>
          1. Try accessing other pages directly: <a href="/about" style={{ color: '#0d9488' }}>/about</a> or <a href="/contact" style={{ color: '#0d9488' }}>/contact</a>
        </p>
        <p>
          2. Check browser console for specific JavaScript errors
        </p>
        <p>
          3. Try disabling components in the main pages to find which one is causing the issue
        </p>
      </div>

      <button 
        onClick={() => console.log('Browser JavaScript is working')}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          backgroundColor: '#0d9488',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test JavaScript
      </button>
    </div>
  );
} 