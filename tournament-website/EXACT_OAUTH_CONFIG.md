# 🎯 EXACT GOOGLE OAUTH CONFIGURATION

## Your Details:
- **Client ID**: `497182117823-2tnrksds8hg0fhvfidrs59hka74r5ni8.apps.googleusercontent.com`
- **Supabase Project**: `bdcwmkeluowefvcekwqq`
- **Supabase Callback**: `https://bdcwmkeluowefvcekwqq.supabase.co/auth/v1/callback`
- **Local Dev URL**: `http://localhost:3002`

## 🔧 Step 1: Fix Google Cloud Console

### Go to Google Cloud Console → Your Project → APIs & Services → Credentials

**Edit your OAuth 2.0 Client ID and add these EXACT URIs:**

### Authorized JavaScript origins:
```
http://localhost:3002
http://localhost:3000
http://localhost:3001
https://bdcwmkeluowefvcekwqq.supabase.co
```

### Authorized redirect URIs:
```
https://bdcwmkeluowefvcekwqq.supabase.co/auth/v1/callback
http://localhost:3002/auth/callback
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

## 🔧 Step 2: Configure Supabase

### Go to Supabase Dashboard → Your Project → Authentication → Providers

1. **Enable Google Provider**
2. **Client ID**: `497182117823-2tnrksds8hg0fhvfidrs59hka74r5ni8.apps.googleusercontent.com`
3. **Client Secret**: (Get this from Google Cloud Console → Credentials → Your OAuth Client)
4. **Redirect URL**: Should automatically show `https://bdcwmkeluowefvcekwqq.supabase.co/auth/v1/callback`

## 🔧 Step 3: Get Your Client Secret

1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID
4. Copy the **Client Secret** (looks like `GOCSPX-...`)
5. Add this to Supabase Google provider configuration

## ✅ After Configuration:

1. Save all changes in Google Cloud Console
2. Save Google provider settings in Supabase
3. Wait 2-3 minutes for changes to propagate
4. Test your Google login at `http://localhost:3002`

## 🚀 How the Flow Works:

1. User clicks "Continue with Google" on your app
2. App redirects to Google OAuth with your Client ID
3. Google shows consent screen
4. User authorizes your app
5. Google redirects to Supabase: `https://bdcwmkeluowefvcekwqq.supabase.co/auth/v1/callback`
6. Supabase processes the OAuth response
7. Supabase redirects back to your app: `http://localhost:3002/auth/callback`
8. Your app receives the user session and shows the dashboard

The key is that both the Supabase callback AND your local callback need to be authorized in Google Cloud Console!
