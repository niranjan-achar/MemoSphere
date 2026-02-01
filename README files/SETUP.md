# 📘 Memorie - Complete Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages including:
- Next.js 14 with App Router
- Supabase client libraries
- Groq SDK for AI/NLP
- CryptoJS for encryption
- All TypeScript types and dev dependencies

### Step 2: Set Up Supabase Project

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**
   - In your Supabase dashboard, go to **Settings > API**
   - Copy your `Project URL` and `anon public` key
   - Copy your `service_role` key (keep this secret!)

3. **Run Database Migrations**
   - In Supabase dashboard, go to **SQL Editor**
   - Click **New Query**
   - Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
   - Click **Run** to execute
   - Repeat for `supabase/migrations/002_rls_policies.sql`

4. **Create Storage Bucket**
   - Go to **Storage** in Supabase dashboard
   - Click **New bucket**
   - Name: `documents`
   - Set to **Public** or **Private** (your choice)
   - Click **Create bucket**

5. **Enable Google OAuth**
   - Go to **Authentication > Providers**
   - Find **Google** and toggle it on
   - Add your Google OAuth credentials (see below)
   - Add authorized redirect URLs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production - change later)
   - Save changes

### Step 3: Configure Google OAuth

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable **Google+ API**

2. **Create OAuth Credentials**
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URIs:
     - From your Supabase Auth settings (copy the callback URL shown)
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

3. **Add to Supabase**
   - Go back to Supabase dashboard
   - In **Authentication > Providers > Google**
   - Paste your Client ID and Client Secret
   - Save

### Step 4: Get Groq API Key

1. **Sign Up for Groq**
   - Go to [https://groq.com](https://console.groq.com)
   - Create a free account
   - Navigate to API Keys section

2. **Generate API Key**
   - Click **Create API Key**
   - Give it a name (e.g., "Memorie Development")
   - Copy the generated key immediately (you won't see it again!)

### Step 5: Generate VAPID Keys for Push Notifications

In PowerShell, run:

```powershell
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BHJ...
Private Key: dGh...
```

Copy both keys for the next step.

### Step 6: Configure Environment Variables

1. **Copy the example file:**
   ```powershell
   Copy-Item .env.local.example .env.local
   ```

2. **Edit `.env.local` with your credentials:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Web Push Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption Secret (must be at least 32 characters)
ENCRYPTION_SECRET=your_very_long_random_string_here_min_32_chars
```

3. **Generate Encryption Secret:**
   ```powershell
   # Generate a random 32-character string
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```
   Use this output as your `ENCRYPTION_SECRET`.

### Step 7: Run the Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Creating PWA Icons

You need to create actual PNG icons from the SVG placeholder:

### Option 1: Use Online Tool

1. Open `public/icon-512x512.svg` in a browser
2. Use a tool like [Real Favicon Generator](https://realfavicongenerator.net/)
3. Upload your icon design
4. Download the generated icon pack
5. Replace the placeholder icons in `public/`

### Option 2: Manual Creation

Create icons in these sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Use tools like:
- **Figma** (free)
- **Canva** (free)
- **Photoshop** (paid)

Save as PNG with transparent background.

---

## 🧪 Testing the Setup

### 1. Test Authentication

1. Go to `http://localhost:3000`
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to `/dashboard`

### 2. Test Database Connection

After logging in, check your Supabase dashboard:
- **Authentication > Users** - You should see your user
- **Table Editor > users** - Your user profile should be created

### 3. Test Encryption

The vault feature will test encryption automatically when you store a password.

---

## 📋 Next Steps

After completing the setup, you can:

1. **Test the Chat Interface** (being built)
2. **Create Reminders and Todos** (being built)
3. **Upload Documents** (being built)
4. **View Analytics Dashboard** (being built)

---

## 🔧 Troubleshooting

### "Cannot find module" errors

**Solution:** Make sure you've run `npm install`

```powershell
npm install
```

### Supabase connection errors

**Solution:** Check your environment variables

1. Verify `.env.local` has correct Supabase URL and keys
2. Make sure there are no extra spaces or quotes
3. Restart the dev server after changing `.env.local`

### Google OAuth not working

**Solution:** Check redirect URIs

1. In Google Cloud Console, verify redirect URIs match Supabase
2. In Supabase, make sure Google provider is enabled
3. Clear browser cache and try again

### Database queries failing

**Solution:** Run migrations

1. Make sure you've run both SQL migration files in Supabase
2. Check that RLS policies are enabled
3. Verify your user is authenticated

### Push notifications not working

**Solution:** Check VAPID keys

1. Make sure you've generated VAPID keys
2. Verify they're correctly added to `.env.local`
3. Check browser console for errors
4. Try in a different browser (some browsers block notifications)

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `ENCRYPTION_SECRET` to a strong, random value
- [ ] Never commit `.env.local` to version control
- [ ] Use different Supabase projects for dev/prod
- [ ] Regenerate all API keys for production
- [ ] Enable HTTPS (required for PWA and notifications)
- [ ] Review and test all RLS policies
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Add monitoring and error tracking

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors (F12)
2. Check the terminal for server errors
3. Review the Supabase logs in your dashboard
4. Search GitHub issues
5. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, browser)

---

## ✅ Setup Complete!

Once everything is working:

1. Your Next.js app is running on `localhost:3000`
2. Database is configured with proper schema and security
3. Authentication works with Google OAuth
4. Encryption is set up for sensitive data
5. PWA is configured for offline support

**You're ready to start building features!**

The development process will continue with:
- Chat interface implementation
- Feature modules (reminders, todos, vault, notes)
- Dashboard and analytics
- Testing and optimization
