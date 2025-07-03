# Netlify Environment Variables Setup Guide

## 🔐 Setting Up Environment Variables in Netlify

Your portfolio uses several environment variables that need to be configured in Netlify for the deployed site to work properly.

## 📋 Required Environment Variables

Based on your `.env.example` file, you need to set up these variables:

### 1. Supabase Configuration
```
VITE_SUPABASE_URL=https://vuxogsmzlgxqbbeilqzm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eG9nc216bGd4cWJiZWlscXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTA4NjIsImV4cCI6MjA2Njg4Njg2Mn0.CdOYKWyOW3wDxxoP3m_KgUEYhzmeN3YR6wiZgeI4B7U
```

### 2. ElevenLabs Configuration (Optional - for voice features)
```
VITE_ELEVENLABS_API_KEY=sk_your_actual_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_actual_voice_id_here
```

## 🚀 How to Set Environment Variables in Netlify

### Method 1: Through Netlify Dashboard (Recommended)

1. **Log in to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in to your account

2. **Navigate to Your Site**
   - Click on your deployed site from the dashboard
   - Or deploy your site first if you haven't already

3. **Access Site Settings**
   - Click on "Site settings" in the top navigation
   - Or go to `https://app.netlify.com/sites/YOUR_SITE_NAME/settings`

4. **Go to Environment Variables**
   - In the left sidebar, click "Environment variables"
   - Or scroll down to find "Environment variables" section

5. **Add Variables**
   - Click "Add variable" or "New variable"
   - Enter the variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter the variable value
   - Click "Create variable"

6. **Add All Required Variables**
   ```
   Variable Name: VITE_SUPABASE_URL
   Value: https://vuxogsmzlgxqbbeilqzm.supabase.co
   
   Variable Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eG9nc216bGd4cWJiZWlscXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTA4NjIsImV4cCI6MjA2Njg4Njg2Mn0.CdOYKWyOW3wDxxoP3m_KgUEYhzmeN3YR6wiZgeI4B7U
   
   Variable Name: VITE_ELEVENLABS_API_KEY
   Value: sk_your_actual_api_key_here
   
   Variable Name: VITE_ELEVENLABS_VOICE_ID
   Value: your_actual_voice_id_here
   ```

7. **Redeploy Your Site**
   - After adding variables, go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Or push a new commit to trigger automatic deployment

### Method 2: Through Netlify CLI (Advanced)

If you have Netlify CLI installed locally:

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://vuxogsmzlgxqbbeilqzm.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_supabase_anon_key"
netlify env:set VITE_ELEVENLABS_API_KEY "sk_your_api_key"
netlify env:set VITE_ELEVENLABS_VOICE_ID "your_voice_id"

# List all environment variables to verify
netlify env:list
```

### Method 3: Through netlify.toml File

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_SUPABASE_URL = "https://vuxogsmzlgxqbbeilqzm.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your_supabase_anon_key"
  VITE_ELEVENLABS_API_KEY = "sk_your_api_key"
  VITE_ELEVENLABS_VOICE_ID = "your_voice_id"
```

**⚠️ Warning:** Don't commit sensitive API keys to your repository. Use this method only for non-sensitive variables.

## 🔍 How to Get Your API Keys

### ElevenLabs API Key
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up/login to your account
3. Navigate to Settings → API Keys
4. Copy your API key (starts with `sk_`)

### ElevenLabs Voice ID
1. In ElevenLabs dashboard, go to Voice Library
2. Select a voice you want to use
3. Copy the Voice ID (usually a UUID format)

### Supabase Keys
Your Supabase keys are already provided in the `.env.example` file, but if you need to get them:
1. Go to [supabase.com](https://supabase.com)
2. Open your project dashboard
3. Go to Settings → API
4. Copy the Project URL and anon/public key

## ✅ Verification Steps

After setting up environment variables:

1. **Check Build Logs**
   - Go to Netlify dashboard → Deploys
   - Click on the latest deploy
   - Check build logs for any environment variable errors

2. **Test Your Site**
   - Visit your deployed site
   - Check browser console for any API connection errors
   - Test features that depend on environment variables

3. **Debug Common Issues**
   - Variables not loading: Ensure they start with `VITE_`
   - API errors: Verify API keys are correct and active
   - Build failures: Check for typos in variable names

## 🔒 Security Best Practices

1. **Never commit `.env` files** to your repository
2. **Use different API keys** for development and production
3. **Regularly rotate API keys** for security
4. **Monitor API usage** to detect unauthorized access
5. **Use environment-specific configurations** when possible

## 🚨 Troubleshooting

### Common Issues:

**Environment variables not working:**
- Ensure variable names start with `VITE_` for Vite projects
- Check for typos in variable names
- Redeploy after adding variables

**API connection errors:**
- Verify API keys are active and have proper permissions
- Check API rate limits and quotas
- Ensure URLs are correct and accessible

**Build failures:**
- Check build logs for specific error messages
- Verify all required variables are set
- Test build locally with same environment variables

## 📞 Need Help?

If you encounter issues:
1. Check Netlify's [environment variables documentation](https://docs.netlify.com/environment-variables/overview/)
2. Review build logs for specific error messages
3. Test locally with the same environment variables
4. Contact support if issues persist

---

**Next Steps:**
1. Set up your environment variables in Netlify
2. Redeploy your site
3. Test all features to ensure they work correctly
4. Monitor your site for any issues

Your portfolio should now work perfectly with all features enabled! 🎉