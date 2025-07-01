import { Html, Head, Main, NextScript } from 'next/document';
import Document, { DocumentContext } from 'next/document';
import Script from 'next/script';

// Define routerFixScript (copied from _app.tsx originally)
const routerFixScript = `
  (function() {
    if (!window.__NEXT_DATA__) {
      window.__NEXT_DATA__ = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development' // Or a proper build ID if available
      };
    }
    
    function ensureValidHistoryState(state) {
      if (!state || typeof state !== 'object') {
        return {
          data: {
            props: {},
            page: window.location.pathname || '/',
            query: {},
            buildId: 'development'
          }
        };
      }
      
      if (!state.data) {
        return {
          ...state,
          data: {
            props: {},
            page: window.location.pathname || '/',
            query: {},
            buildId: 'development'
          }
        };
      }
      
      return state;
    }
    
    if (window.history && window.history.state) {
      try {
        const currentState = window.history.state;
        const newState = ensureValidHistoryState(currentState);
        if (currentState !== newState) { // Avoid unnecessary replaceState if object is the same
            window.history.replaceState(newState, document.title, window.location.href);
        }
      } catch (e) {
        console.warn('Error ensuring valid history state:', e);
      }
    }
    
    window.addEventListener('error', function(event) {
      if (event.message && 
         (event.message.includes('Cannot read properties of undefined') ||
          event.message.includes('Cannot read property ') || // Added space to be more specific
          event.message.includes('data of undefined'))) {
        console.warn('Suppressed potential router error:', event.message);
        event.preventDefault();
      }
    });

    // Attempt to fix missing __NEXT_DATA__.page issue on initial load for some edge cases
    if (typeof window !== 'undefined' && window.__NEXT_DATA__ && !window.__NEXT_DATA__.page) {
      window.__NEXT_DATA__.page = window.location.pathname || '/';
    }
  })();
`;

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
          
          {/* Web App Manifest - include both formats for maximum compatibility */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="manifest" href="/site.webmanifest" />
          
          {/* Theme Color */}
                  <meta name="theme-color" content="#075985" />
        <meta name="msapplication-TileColor" content="#075985" />
        <meta name="msapplication-navbutton-color" content="#075985" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content="TT Repair" />
          
          {/* PWA Splash Screens for iOS */}
          <link rel="apple-touch-startup-image" href="/favicons/android-chrome-512x512.png?v=2024.2&orange=true" />
          <meta name="mobile-web-app-capable" content="yes" />
          
          {/* Favicon - Orange logo with strong cache busting */}
          <link rel="icon" href="/favicon.ico?v=2024.2&orange=true" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png?v=2024.2&orange=true" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png?v=2024.2&orange=true" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png?v=2024.2&orange=true" />
          <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png?v=2024.2&orange=true" />
          <link rel="shortcut icon" href="/favicon.ico?v=2024.2&orange=true" />
          
          {/* Add the cache cleaning script */}
          <script src="/clean-cache.js" async></script>
          
          {/* Inline fallback for manifest.json */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Provide a fallback for manifest.json if it fails to load
                window.addEventListener('error', function(e) {
                  if (e.target && e.target.tagName === 'LINK' && e.target.rel === 'manifest') {
                    console.log('Manifest failed to load, creating inline fallback');
                    var manifestData = {
                      "name": "The Travelling Technicians",
                      "short_name": "TT Repair",
                      "description": "Mobile phone and laptop repair with doorstep service in Lower Mainland, BC",
                      "start_url": "/",
                      "display": "standalone",
                      "background_color": "#ffffff",
                      "theme_color": "#075985",
                      "icons": [
                        {
                          "src": "/favicons/favicon-192x192.png",
                          "sizes": "192x192",
                          "type": "image/png"
                        }
                      ]
                    };
                    
                    // Create a blob URL for the manifest
                    var manifestBlob = new Blob(
                      [JSON.stringify(manifestData)], 
                      {type: 'application/json'}
                    );
                    var manifestURL = URL.createObjectURL(manifestBlob);
                    
                    // Replace the failing link
                    var newLink = document.createElement('link');
                    newLink.rel = 'manifest';
                    newLink.href = manifestURL;
                    document.head.appendChild(newLink);
                  }
                }, true);
              `,
            }}
          />
          
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
          
          {/* Preload critical logo */}
          <link rel="preload" href="/images/logo/logo-orange.png" as="image" type="image/png" />
          
          {/* Force search engines to update favicon */}
          <meta property="og:image" content="/favicons/android-chrome-512x512.png?v=2024.2&orange=true" />
          <meta name="msapplication-config" content="none" />

          {/* Moved Scripts from _app.tsx */}
          <Script id="next-router-fix" strategy="beforeInteractive">
            {routerFixScript}
          </Script>
          <Script id="error-handler" src="/error-handler.js" strategy="beforeInteractive" />

          {/* Local Business Schema for Better Local SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "@id": "https://www.travelling-technicians.ca/#business",
                "name": "The Travelling Technicians",
                "description": "Professional mobile phone and laptop repair services with same-day doorstep service across Vancouver, Burnaby, Richmond, and surrounding Lower Mainland areas.",
                "url": "https://www.travelling-technicians.ca",
                "telephone": "+1-778-389-9251",
                "email": "info@travelling-technicians.ca",
                "priceRange": "$79-$249",
                "openingHours": "Mo-Fr 08:00-20:00, Sa 09:00-18:00, Su 10:00-17:00",
                "areaServed": [
                  {
                    "@type": "City",
                    "name": "Vancouver",
                    "addressRegion": "BC",
                    "addressCountry": "CA"
                  },
                  {
                    "@type": "City", 
                    "name": "Burnaby",
                    "addressRegion": "BC",
                    "addressCountry": "CA"
                  },
                  {
                    "@type": "City",
                    "name": "Richmond",
                    "addressRegion": "BC", 
                    "addressCountry": "CA"
                  },
                  {
                    "@type": "City",
                    "name": "North Vancouver",
                    "addressRegion": "BC",
                    "addressCountry": "CA"
                  },
                  {
                    "@type": "City",
                    "name": "New Westminster",
                    "addressRegion": "BC",
                    "addressCountry": "CA"
                  },
                  {
                    "@type": "City",
                    "name": "Coquitlam",
                    "addressRegion": "BC",
                    "addressCountry": "CA"
                  },
                  {
                    "@type": "City",
                    "name": "West Vancouver", 
                    "addressRegion": "BC",
                    "addressCountry": "CA"
                  }
                ],
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Vancouver",
                  "addressRegion": "BC",
                  "addressCountry": "CA",
                  "postalCode": "V6B 1A1"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": "49.2827",
                  "longitude": "-123.1207"
                },
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Mobile and Laptop Repair Services",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Mobile Phone Screen Repair",
                        "description": "Professional iPhone and Android screen replacement service"
                      }
                    },
                    {
                      "@type": "Offer", 
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Mobile Phone Battery Replacement",
                        "description": "Battery replacement for all major smartphone brands"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service", 
                        "name": "Laptop Screen Repair",
                        "description": "Laptop and MacBook screen replacement service"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Laptop Battery Replacement", 
                        "description": "Professional laptop battery replacement and upgrade"
                      }
                    }
                  ]
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "reviewCount": "127",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "review": [
                  {
                    "@type": "Review",
                    "reviewRating": {
                      "@type": "Rating", 
                      "ratingValue": "5",
                      "bestRating": "5"
                    },
                    "author": {
                      "@type": "Person",
                      "name": "Sarah J."
                    },
                    "reviewBody": "Excellent service! The technician came to my home and fixed my iPhone screen quickly. Very professional and convenient.",
                    "datePublished": "2024-12-15"
                  },
                  {
                    "@type": "Review",
                    "reviewRating": {
                      "@type": "Rating",
                      "ratingValue": "5", 
                      "bestRating": "5"
                    },
                    "author": {
                      "@type": "Person",
                      "name": "Michael C."
                    },
                    "reviewBody": "Had my MacBook battery replaced at home. Professional service and saved me a trip to the mall. Highly recommend!",
                    "datePublished": "2024-12-10"
                  }
                ],
                "sameAs": [
                  "https://www.facebook.com/travellingtechnicians",
                  "https://www.instagram.com/travellingtechnicians", 
                  "https://www.linkedin.com/company/travelling-technicians"
                ]
              })
            }}
          />

          {/* Service Schema for Mobile Repair */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                "name": "Mobile Phone Repair Vancouver",
                "description": "Professional mobile phone repair services including screen replacement, battery replacement, and more across Vancouver and Lower Mainland.",
                "provider": {
                  "@type": "LocalBusiness",
                  "name": "The Travelling Technicians"
                },
                "areaServed": "Vancouver, BC",
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Mobile Repair Services",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "iPhone Screen Repair",
                        "description": "Professional iPhone screen replacement with same-day service"
                      },
                      "priceSpecification": {
                        "@type": "PriceSpecification",
                        "priceCurrency": "CAD", 
                        "price": "129-189"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Samsung Screen Repair",
                        "description": "Samsung Galaxy screen replacement service"
                      },
                      "priceSpecification": {
                        "@type": "PriceSpecification",
                        "priceCurrency": "CAD",
                        "price": "99-169"
                      }
                    }
                  ]
                }
              })
            }}
          />

          {/* FAQ Schema for Better SERP Features */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How much does mobile screen repair cost?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Mobile screen repair costs range from $79-$189 depending on the device model. iPhone screen repairs typically cost $129-$189, while Android screen repairs range from $79-$149."
                    }
                  },
                  {
                    "@type": "Question", 
                    "name": "Do you offer same-day mobile repair service?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, we offer same-day mobile repair service across Vancouver, Burnaby, Richmond, and surrounding areas. Most repairs are completed within 30-90 minutes at your location."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What areas do you serve for mobile repair?",
                    "acceptedAnswer": {
                      "@type": "Answer", 
                      "text": "We provide mobile repair services across Vancouver, Burnaby, Richmond, North Vancouver, New Westminster, Coquitlam, West Vancouver, and surrounding Lower Mainland areas."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What warranty do you offer on mobile repairs?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We offer a 90-day warranty on all mobile phone repairs, covering both parts and labor. This ensures your peace of mind with our professional repair services."
                    }
                  }
                ]
              })
            }}
          />
          {/* Service Schema for Mobile Repair */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                "name": "Mobile Phone Repair Vancouver",
                "description": "Professional mobile phone repair services including screen replacement, battery replacement, and more across Vancouver and Lower Mainland.",
                "provider": {
                  "@type": "LocalBusiness",
                  "name": "The Travelling Technicians"
                },
                "areaServed": "Vancouver, BC",
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Mobile Repair Services",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "iPhone Screen Repair",
                        "description": "Professional iPhone screen replacement with same-day service"
                      },
                      "priceSpecification": {
                        "@type": "PriceSpecification",
                        "priceCurrency": "CAD", 
                        "price": "129-189"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Samsung Screen Repair",
                        "description": "Samsung Galaxy screen replacement service"
                      },
                      "priceSpecification": {
                        "@type": "PriceSpecification",
                        "priceCurrency": "CAD",
                        "price": "99-169"
                      }
                    }
                  ]
                }
              })
            }}
          />

          {/* FAQ Schema for Better SERP Features */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How much does mobile screen repair cost?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Mobile screen repair costs range from $79-$189 depending on the device model. iPhone screen repairs typically cost $129-$189, while Android screen repairs range from $79-$149."
                    }
                  },
                  {
                    "@type": "Question", 
                    "name": "Do you offer same-day mobile repair service?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, we offer same-day mobile repair service across Vancouver, Burnaby, Richmond, and surrounding areas. Most repairs are completed within 30-90 minutes at your location."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What areas do you serve for mobile repair?",
                    "acceptedAnswer": {
                      "@type": "Answer", 
                      "text": "We provide mobile repair services across Vancouver, Burnaby, Richmond, North Vancouver, New Westminster, Coquitlam, West Vancouver, and surrounding Lower Mainland areas."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What warranty do you offer on mobile repairs?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We offer a 90-day warranty on all mobile phone repairs, covering both parts and labor. This ensures your peace of mind with our professional repair services."
                    }
                  }
                ]
              })
            }}
          />

          {/* Google Analytics 4 - GA4 Tracking */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-80YKX5JXKG"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-80YKX5JXKG', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true
              });
            `}
          </Script>
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