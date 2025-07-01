/**
 * UI Enhancements for The Travelling Technicians Website
 * 
 * This file contains JavaScript functions to enhance the UI and UX
 * without modifying the core functionality of the website.
 */

/**
 * Animates counting up for statistic numbers
 * @param {string} elementSelector - CSS selector for elements to animate
 */
export function animateCounters(elementSelector = '.stat-counter') {
  const counters = document.querySelectorAll(elementSelector);
  
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const originalValue = target.getAttribute('data-target');
        
        // Handle different value types
        let targetNumber;
        let suffix = '';
        let isDecimal = false;
        
        if (originalValue.includes('%')) {
          targetNumber = parseFloat(originalValue.replace('%', ''));
          suffix = '%';
          isDecimal = originalValue.includes('.');
        } else if (originalValue.includes('+')) {
          targetNumber = parseFloat(originalValue.replace('+', ''));
          suffix = '+';
          isDecimal = originalValue.includes('.');
        } else {
          targetNumber = parseFloat(originalValue);
          isDecimal = originalValue.includes('.');
        }
        
        let current = 0;
        const increment = targetNumber / 50; // Divide animation into 50 steps
        const timer = setInterval(() => {
          current += increment;
          let displayValue = isDecimal ? current.toFixed(1) : Math.round(current);
          target.textContent = displayValue + suffix;
          
          if (current >= targetNumber) {
            target.textContent = originalValue;
            clearInterval(timer);
          }
        }, 20);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => {
    const value = counter.textContent.trim();
    counter.setAttribute('data-target', value);
    counter.textContent = '0';
    counter.classList.add('animate-count-up');
    observer.observe(counter);
  });
}

/**
 * Creates a sticky "Book Now" button that appears when scrolling
 */
export function createStickyBookButton() {
  // Only create if it doesn't already exist
  if (document.querySelector('.sticky-book-button')) return;
  
  const button = document.createElement('a');
  button.href = '/book-online';
  button.className = 'sticky-book-button';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
    </svg>
    Book Repair
  `;
  
  document.body.appendChild(button);
  
  // Show button after scrolling down
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  });
}

/**
 * Enhances testimonial quotes by highlighting key phrases
 */
export function enhanceTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial-text');
  
  if (!testimonials.length) return;
  
  const keyPhrases = [
    'saved me', 'quick', 'convenient', 'fast', 'professional', 
    'on time', 'same day', 'fixed', 'repaired', 'excellent',
    'service', 'doorstep', 'amazing', 'great experience'
  ];
  
  testimonials.forEach(testimonial => {
    let content = testimonial.innerHTML;
    
    keyPhrases.forEach(phrase => {
      // Case insensitive replacement with word boundaries
      const regex = new RegExp(`\\b(${phrase})\\b`, 'gi');
      content = content.replace(regex, '<span class="testimonial-highlight">$1</span>');
    });
    
    testimonial.innerHTML = content;
  });
}

/**
 * Adds connection lines between process steps
 */
export function enhanceProcessSteps() {
  const steps = document.querySelectorAll('.process-step');
  
  if (!steps.length) return;
  
  steps.forEach((step, index) => {
    if (index < steps.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'process-connector';
      step.appendChild(connector);
    }
  });
}

/**
 * Add subtle hover effects to brand buttons
 */
export function enhanceBrandButtons() {
  const brandButtons = document.querySelectorAll('.brand-selection button');
  
  if (!brandButtons.length) return;
  
  brandButtons.forEach(button => {
    button.classList.add('brand-btn');
  });
}

/**
 * Creates a confetti effect for the postal code success message
 */
export function createSuccessConfetti() {
  // Only create if browser environment
  if (typeof window === 'undefined') return;
  
  // Create and append canvas element
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '100';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Confetti particles
  const particles = [];
  const particleCount = 100;
  const colors = ['#10b981', '#059669', '#34d399', '#a7f3d0', '#0ea5e9'];
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      radius: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 2 * Math.PI,
      spin: Math.random() * 0.2 - 0.1,
      fall: Math.random() * 2 + 1
    });
  }
  
  // Animation
  let animationId;
  let elapsed = 0;
  
  function animate() {
    elapsed++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.angle += p.spin;
      p.y += p.fall;
      p.x += Math.sin(p.angle) * p.speed;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    
    // Stop animation after 3 seconds
    if (elapsed < 180) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Remove canvas after animation completes
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }
  
  // Start animation
  animate();
  
  // Clean up on page navigation
  return () => {
    cancelAnimationFrame(animationId);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
}

/**
 * Initializes all UI enhancements
 */
export function initUIEnhancements() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure all elements are rendered
      setTimeout(runEnhancements, 100);
    });
  } else {
    // Small delay to ensure all elements are rendered
    setTimeout(runEnhancements, 100);
  }
  
  function runEnhancements() {
    // Add appropriate class to stats
    document.querySelectorAll('[data-stat]').forEach(el => {
      el.classList.add('stat-item');
      const statNumber = el.querySelector('div[class*="text-4xl"], div[class*="text-5xl"]');
      if (statNumber) {
        statNumber.classList.add('stat-counter');
      }
    });
    
    // Add process step classes
    document.querySelectorAll('[data-step]').forEach(el => {
      el.classList.add('process-step');
      el.querySelector('.rounded-full')?.classList.add('process-icon');
    });
    
    // Add hero section class
    document.querySelector('.hero-container')?.classList.add('hero-section');
    document.querySelector('.hero-container .bg-primary-600 + div')?.classList.add('hero-image');
    document.querySelector('.inline-block.bg-accent-500')?.classList.add('hero-badge');
    
    // Add testimonial classes
    document.querySelectorAll('.testimonial-container .p-6').forEach(el => {
      el.classList.add('testimonial-card');
      el.querySelector('p')?.classList.add('testimonial-text');
    });
    
    // Add service area classes
    document.querySelectorAll('[data-area]').forEach(el => {
      el.classList.add('service-area-item');
    });
    
    // Add benefit card classes
    document.querySelectorAll('.benefits-container > div').forEach(el => {
      el.classList.add('benefit-card');
      el.querySelector('svg')?.classList.add('benefit-icon');
    });
    
    // Add section title classes
    document.querySelectorAll('h2').forEach(el => {
      el.classList.add('section-title');
    });
    
    document.querySelectorAll('h2 + p').forEach(el => {
      el.classList.add('section-subtitle');
    });
    
    // Add CTA button class
    document.querySelectorAll('a[href="/book-online"]').forEach(el => {
      el.classList.add('cta-button');
    });
    
    // Run specific enhancements (temporarily disabled counter animation)
    // animateCounters();
    createStickyBookButton();
    enhanceTestimonials();
    enhanceProcessSteps();
    enhanceBrandButtons();
  }
} 