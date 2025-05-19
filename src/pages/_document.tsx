import { Html, Head, Main, NextScript } from 'next/document';
import Document, { DocumentContext } from 'next/document';

/**
 * Custom Document for The Travelling Technicians website
 * Added error handling and fallback content mechanisms to prevent white screens
 */
class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    let initialProps;
    try {
      initialProps = await Document.getInitialProps(ctx);
    } catch (error) {
      console.error('Error in _document.getInitialProps:', error);
      initialProps = { html: '', head: [], styles: [] };
    }
    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Add noindex tag for development environments */}
          {process.env.NODE_ENV !== 'production' && (
            <meta name="robots" content="noindex" />
          )}
          
          {/* Web App Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Theme Color */}
          <meta name="theme-color" content="#0d9488" />
          
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png" />
          <link rel="apple-touch-icon" sizes="192x192" href="/favicons/apple-touch-icon.png" />
          
          {/* Add the cache cleaning script */}
          <script src="/clean-cache.js" async></script>
          
          {/* Add a fallback inline script that will ensure content is visible */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Ensure document has visible content
                document.addEventListener('DOMContentLoaded', function() {
                  // Check for white screen after 4 seconds
                  setTimeout(function() {
                    if (!document.getElementById('__next') || !document.getElementById('__next').children.length) {
                      console.log('White screen detected, reloading...');
                      window.location.reload();
                    }
                  }, 4000);
                });
              `,
            }}
          />
          {/* Preconnect to origin to speed up loading */}
          <link rel="preconnect" href={`https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}`} />
        </Head>
        <body>
          {/* Add fallback text that will be shown if JS fails to load */}
          <noscript>
            <div style={{
              padding: '20px',
              textAlign: 'center',
              fontFamily: 'sans-serif'
            }}>
              <h1>The Travelling Technicians</h1>
              <p>Please enable JavaScript to view this website. We provide doorstep mobile and laptop repair services across the Lower Mainland.</p>
              <p>Contact us: (604) 555-1234 | contact@travellingtechnicians.ca</p>
            </div>
          </noscript>
          
          <Main />
          
          {/* Add hidden fallback content that is shown via CSS if main content fails */}
          <div id="fallback-content" style={{
            display: 'none',
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'white',
            zIndex: 9999,
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'sans-serif',
            animation: 'show-fallback 5s forwards'
          }}>
            <div style={{ maxWidth: '500px', margin: '100px auto' }}>
              <h1>The Travelling Technicians</h1>
              <p>Expert mobile and laptop repair at your doorstep in the Lower Mainland, BC</p>
              <p>Our website is taking longer than expected to load.</p>
              <button onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}>
                Refresh the page
              </button>
            </div>
          </div>
          
          <NextScript />
          
          {/* Inline styles for fallback animation */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes show-fallback {
              0%, 95% {
                opacity: 0;
                visibility: hidden;
              }
              100% {
                opacity: 1;
                visibility: visible;
              }
            }
          `}} />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 