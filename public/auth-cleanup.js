
// Auth Storage Cleanup Script
// 
// This script can be executed in the browser console to clean up
// potentially corrupted authentication data in local storage
// and session storage.

function cleanAuthStorage() {
  console.log('Cleaning up authentication storage...');
  
  // Clear specific auth-related items from localStorage
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('authUser');
  localStorage.removeItem('sb-xxxxxxxxxxxxx-auth-token'); // Adjust the ID based on your actual Supabase project ID
  
  // Clear session storage flags
  sessionStorage.removeItem('homepageLoopPrevented');
  sessionStorage.removeItem('homepageReloadCount');
  sessionStorage.removeItem('skipHomepageChecks');
  sessionStorage.removeItem('authRedirectPath');
  sessionStorage.removeItem('navigationInProgress');
  sessionStorage.removeItem('previousPath');
  sessionStorage.removeItem('shouldReturnToProtectedRoute');
  
  // Remove any navigation-related classes from body
  document.body.classList.remove('loading-navigation');
  document.body.classList.remove('navigation-stuck');
  document.body.classList.remove('auth-corrupted');
  
  console.log('Authentication storage cleaned');
  console.log('Please reload the page and try signing in again.');
  
  return "Auth storage cleaned successfully. Please reload the page.";
}

// Execute the cleanup
cleanAuthStorage();
