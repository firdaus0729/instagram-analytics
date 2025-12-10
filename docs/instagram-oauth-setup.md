# Instagram OAuth Setup Guide

This guide explains how to configure Instagram OAuth using your Facebook Developer account.

## Facebook Developer Account Credentials

**Username:** `8260850795`  
**Password:** `JustInfluence@123`

## Step-by-Step Setup

### 1. Log into Meta Developer Console

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Log in using the credentials above:
   - Username: `8260850795`
   - Password: `JustInfluence@123`

### 2. Create or Select Your App

1. If you don't have an app yet, click **"Create App"**
2. Select **"Business"** as the app type
3. Fill in the app details:
   - App Name: `JustInfluence` (or your preferred name)
   - App Contact Email: Your email
   - Business Account: Select your business account

### 3. Add Required Products ⚠️ **CRITICAL**

**Important:** You must add the correct products for Instagram Graph API (NOT Instagram Basic Display).

1. In your app dashboard, go to **"Add Products"**
2. Add the following products:
   - **Facebook Login** - Click "Set Up" (required for OAuth)
   - **Instagram Graph API** - Click "Set Up" (required for Instagram Business accounts)
   - **Pages API** - Usually added automatically with Instagram Graph API
3. **DO NOT** add "Instagram Basic Display" - it's deprecated and won't work with this app

### 4. Configure OAuth Settings

1. Go to **Settings** → **Basic** in your app dashboard
2. Note down your **App ID** and **App Secret**
3. Add these to your `.env.local`:
   ```
   META_APP_ID=your_app_id_here
   META_APP_SECRET=your_app_secret_here
   ```

### 5. Add Valid OAuth Redirect URIs ⚠️ **REQUIRED STEP**

**This is critical!** You MUST add the redirect URI to your Meta App settings, otherwise OAuth will fail.

1. Go to **Settings** → **Basic** in your app dashboard
2. Scroll down to **"Valid OAuth Redirect URIs"** section
3. Click **"Add URI"** or the **"+"** button
4. Add this exact URI:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```
   ⚠️ **Important:** 
   - The URI must match EXACTLY (including `http://` not `https://` for localhost)
   - No trailing slash
   - Case-sensitive
5. Click **"Save Changes"**
6. For production, also add your production URL:
   ```
   https://yourdomain.com/api/auth/instagram/callback
   ```

**Where to find it:**
- Meta Developer Console → Your App → Settings → Basic
- Look for "Valid OAuth Redirect URIs" (scroll down if needed)
- It's in the same section as "App Domains" and "Website"

### 6. Configure Instagram App Settings

**Note:** If you're using Instagram Graph API (not Basic Display), the redirect URI is configured in Step 5 above. The steps below are for Instagram Basic Display API only.

1. Go to **Products** → **Instagram Basic Display** → **Basic Display**
2. Under **"Valid OAuth Redirect URIs"**, ensure you have:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```
3. Add **"Deauthorize Callback URL"** (optional):
   ```
   http://localhost:3000/api/auth/instagram/deauthorize
   ```
4. Add **"Data Deletion Request URL"** (optional):
   ```
   http://localhost:3000/api/auth/instagram/data-deletion
   ```

### 7. Add Test Users (For Development)

1. Go to **Roles** → **Roles** in your app dashboard
2. Click **"Add People"** to add test users
3. Or go to **Users** → **Test Users** and create test Instagram accounts

### 8. Request Permissions in App Review ⚠️ **REQUIRED**

**Critical:** The permissions must be requested in App Review before they can be used, even in development mode.

1. Go to **App Review** → **Permissions and Features** in your app dashboard
2. Find and request the following permissions:
   - **`pages_show_list`** - Required to list Facebook Pages and access Instagram Business accounts
     - Click "Request" or "Add" next to this permission
     - Provide a use case description explaining why you need this permission
   - **`pages_read_user_content`** (optional, if you need to read posts/media)
   - **`pages_read_engagement`** (optional, if you need insights/analytics)

3. For each permission:
   - Click "Request" or "Add"
   - Fill in the required information about how your app will use the permission
   - For development/testing, you can add test users who can grant these permissions

**Note:** 
- In **Development Mode**, only users added as Admins, Developers, or Testers can grant permissions
- For production, you'll need to submit your app for review
- Instagram-specific scopes like `instagram_basic`, `instagram_manage_insights` are deprecated - use Page permissions instead

### 9. Submit for Review (Production Only)

For production use, you'll need to:
1. Complete the **App Review** process
2. Submit your app for review with required permissions
3. Provide use case descriptions and screencasts

## Environment Variables

Make sure your `.env.local` file contains:

```env
META_APP_ID=your_app_id_from_meta_console
META_APP_SECRET=your_app_secret_from_meta_console
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
MONGODB_URI=your_mongodb_connection_string
LONG_LIVED_TOKEN_SECRET=your_random_secret_for_token_encryption
NEXTAUTH_SECRET=your_random_secret_for_nextauth
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing the OAuth Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/auth/login`

3. Click **"Continue with Instagram"** or visit:
   ```
   http://localhost:3000/api/auth/instagram/login
   ```

4. You'll be redirected to Facebook to authorize the app

5. After authorization, you'll be redirected back to:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```

6. The app will:
   - Exchange the authorization code for tokens
   - Fetch Instagram account information
   - Create or update user account
   - Create or update Instagram account record
   - Redirect to `/dashboard/influencer`

## Troubleshooting

### Error: "Invalid OAuth Redirect URI"

- Make sure the redirect URI in your `.env.local` matches exactly what's configured in Meta Developer Console
- Check for trailing slashes or protocol mismatches (http vs https)

### Error: "Instagram Business or Creator Account Required"

- The Instagram account must be a **Business** or **Creator** account
- Personal accounts won't work
- Convert the account in Instagram settings: Settings → Account → Switch to Professional Account

### Error: "Invalid Scopes" or "App Not Approved"

- **Check App Type**: Ensure your app is a **"Business"** type app (not "Consumer" or "None")
- **Check Products**: Verify you've added **"Instagram Graph API"** (NOT "Instagram Basic Display")
- **Request Permissions**: Go to **App Review** → **Permissions and Features** and request `pages_show_list` permission
- **Add Test Users**: In **Roles** → **Roles**, add yourself and test users as Admins/Developers/Testers
- **Check App Mode**: In Development Mode, only test users can grant permissions
- For production, submit your app for review with all required permissions

### Error: "Invalid Client ID or Secret"

- Double-check your `META_APP_ID` and `META_APP_SECRET` in `.env.local`
- Make sure there are no extra spaces or quotes
- Regenerate App Secret in Meta Developer Console if needed

## Security Notes

⚠️ **Never commit credentials to version control!**

- Keep `.env.local` in `.gitignore`
- Use environment variables for all sensitive data
- Rotate secrets regularly
- Use different credentials for development and production

## Additional Resources

- [Meta for Developers Documentation](https://developers.facebook.com/docs/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

