// Test Google OAuth Configuration
// Run this in browser console to debug OAuth issues

console.log("🔍 Testing Google OAuth Configuration...");

// Check current URL and port
console.log("Current URL:", window.location.origin);
console.log("Expected redirect:", `${window.location.origin}/auth/callback`);

// Test if Supabase is configured
import { supabase } from './lib/supabase';

async function testOAuth() {
  try {
    console.log("📊 Supabase URL:", supabase.supabaseUrl);
    
    // Check auth config
    const { data, error } = await supabase.auth.getSession();
    console.log("Auth session:", data);
    
    if (error) {
      console.error("❌ Auth error:", error);
    }
    
    // Test OAuth URL generation (doesn't actually redirect)
    console.log("🔗 OAuth redirect would be:", `${window.location.origin}/auth/callback`);
    
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

// Run test
testOAuth();

console.log(`
✅ To fix the 403 error:

1. Go to Google Cloud Console
2. Add this redirect URI: ${window.location.origin}/auth/callback
3. Add this origin: ${window.location.origin}
4. Enable Google provider in Supabase
5. Add your Google Client ID/Secret to Supabase

Current redirect that needs to be authorized: ${window.location.origin}/auth/callback
`);
