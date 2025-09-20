# Google OAuth Setup Guide

## Step 1: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing one):
   - Click "Select a project" → "New Project"
   - Name: "Esports Tournament Website"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Tournament Website"
   
5. **Configure Authorized URLs**:
   ```
   Authorized JavaScript origins:
   - http://localhost:3002
   - http://localhost:3000
   - https://yourdomain.com (for production)
   
   Authorized redirect URIs:
   - http://localhost:3002/auth/callback
   - http://localhost:3000/auth/callback
   - https://yourdomain.com/auth/callback (for production)
   ```

6. **Copy your credentials**:
   - Client ID: `your-google-client-id.apps.googleusercontent.com`
   - Client Secret: `your-google-client-secret`

## Step 2: Supabase Configuration

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Navigate to your project**: `bdcwmkeluowefvcekwqq`
3. **Go to Authentication** → **Providers**
4. **Enable Google Provider**:
   - Toggle "Enable sign in with Google"
   - Add your Google Client ID
   - Add your Google Client Secret
   - Site URL: `http://localhost:3002` (for development)
   - Redirect URLs: `http://localhost:3002/auth/callback`

## Step 3: Environment Variables (Optional)

If you want to store Google credentials locally, create `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 4: Test the Integration

1. Start your development server: `pnpm dev`
2. Go to `http://localhost:3002`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Troubleshooting

- **Error: "redirect_uri_mismatch"**: Check your authorized redirect URIs in Google Cloud Console
- **Error: "unauthorized_client"**: Verify your client ID in Supabase settings
- **Error: "access_denied"**: User cancelled the OAuth flow

## Production Deployment

For production, make sure to:
1. Add your production domain to Google Cloud Console
2. Update Supabase site URL to your production URL
3. Use HTTPS for all redirect URIs
