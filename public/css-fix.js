// This script ensures basic styles are applied even if Tailwind CSS fails to load
(function() {
  try {
    // Add a class to the body to indicate Tailwind hasn't loaded yet
    if (document && document.body) {
      document.body.classList.add('tailwind-not-loaded');
    
      // Function to check if Tailwind CSS has loaded
      function checkTailwindLoaded() {
        try {
          // Check if a Tailwind-generated class exists and has styles
          const testEl = document.createElement('div');
          testEl.classList.add('bg-primary-500');
          testEl.style.display = 'none';
          document.body.appendChild(testEl);
          
          const styles = window.getComputedStyle(testEl);
          const hasTailwind = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                              styles.backgroundColor !== 'transparent' &&
                              styles.backgroundColor !== '';
          
          document.body.removeChild(testEl);
          return hasTailwind;
        } catch (err) {
          console.warn('Error checking Tailwind loaded state:', err);
          return false;
        }
      }
      
      // Check if Tailwind loaded and apply fallback if needed
      function applyFallbackStyles() {
        try {
          if (checkTailwindLoaded()) {
            document.body.classList.remove('tailwind-not-loaded');
            document.body.classList.add('tailwind-loaded');
            console.log('Tailwind CSS loaded successfully');
          } else {
            console.warn('Tailwind CSS not detected, applying fallback styles');
            
            // Apply basic styles if Tailwind isn't loaded
            const fallbackCSS = `
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1e293b;
                background-color: #f8fafc;
                line-height: 1.5;
                margin: 0;
                padding: 0;
              }
              
              a {
                color: #0284c7;
                text-decoration: none;
              }
              
              .btn-primary {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                background-color: #0284c7;
                color: white;
                font-weight: 500;
                cursor: pointer;
              }
              
              .container-custom {
                width: 100%;
                max-width: 1280px;
                margin-left: auto;
                margin-right: auto;
                padding-left: 1rem;
                padding-right: 1rem;
              }
            `;
            
            const styleElement = document.createElement('style');
            styleElement.innerHTML = fallbackCSS;
            document.head.appendChild(styleElement);
          }
        } catch (err) {
          console.warn('Error applying fallback styles:', err);
        }
      }
      
      // Run immediately and then check again after full page load
      setTimeout(applyFallbackStyles, 100);
      window.addEventListener('load', applyFallbackStyles);
    }
  } catch (err) {
    console.warn('Error in CSS fix script:', err);
  }
})(); 