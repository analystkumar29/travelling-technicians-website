/**
 * Test script to check if Supabase password reset functionality is working correctly
 * Run with: node test-password-reset.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test user credentials (REPLACE THESE WITH TEST ACCOUNT DETAILS)
const TEST_EMAIL = 'test@example.com'; // Replace with a real test account
const TEST_PASSWORD = 'OldPassword123!'; // Replace with current password
const NEW_PASSWORD = 'NewPassword123!'; // New password to set

// Function to test password update
async function testPasswordUpdate() {
  console.log('Testing Supabase password update functionality...');
  console.log('-------------------------------------------------');
  
  console.log(`1. Attempting to sign in with test account (${TEST_EMAIL})`);
  try {
    // Step 1: Sign in with test credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (signInError) {
      console.error('❌ Sign-in failed:', signInError.message);
      return;
    }
    
    if (!signInData.session) {
      console.error('❌ No session returned after sign-in');
      return;
    }
    
    console.log('✅ Successfully signed in');
    
    // Step 2: Update the password
    console.log('2. Attempting to update password');
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: NEW_PASSWORD
    });
    
    if (updateError) {
      console.error('❌ Password update failed:', updateError.message);
      return;
    }
    
    if (!updateData.user) {
      console.error('❌ No user data returned after update');
      return;
    }
    
    console.log('✅ Password updated successfully');
    
    // Step 3: Sign out
    console.log('3. Signing out');
    await supabase.auth.signOut();
    
    // Step 4: Try signing in with new password
    console.log('4. Attempting to sign in with new password');
    const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: NEW_PASSWORD,
    });
    
    if (newSignInError) {
      console.error('❌ Sign-in with new password failed:', newSignInError.message);
      return;
    }
    
    if (!newSignInData.session) {
      console.error('❌ No session returned after sign-in with new password');
      return;
    }
    
    console.log('✅ Successfully signed in with new password');
    console.log('-------------------------------------------------');
    console.log('✅ ALL TESTS PASSED: Password update functionality is working correctly');
    
    // Step 5: Reset to original password for future tests
    console.log('5. Resetting to original password for future tests');
    const { error: resetError } = await supabase.auth.updateUser({
      password: TEST_PASSWORD
    });
    
    if (resetError) {
      console.error('❌ Failed to reset password:', resetError.message);
      return;
    }
    
    console.log('✅ Password reset to original value');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    // Make sure to sign out
    await supabase.auth.signOut();
    console.log('Signed out');
  }
}

// Run the test
testPasswordUpdate(); 