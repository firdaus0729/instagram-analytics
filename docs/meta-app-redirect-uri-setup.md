# How to Add Redirect URI in Meta Developer Console

## Quick Answer

**YES!** You must add `http://localhost:3000/api/auth/instagram/callback` to your Meta App's OAuth settings.

## Step-by-Step Instructions

### 1. Log into Meta Developer Console

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Log in with your credentials:
   - Username: `8260850795`
   - Password: `JustInfluence@123`

### 2. Select Your App

1. Click on your app (or create one if you haven't)
2. App ID: `682847584147123`

### 3. Navigate to Settings

1. In the left sidebar, click **"Settings"**
2. Click **"Basic"** (should be selected by default)

### 4. Add Redirect URI - Multiple Locations to Check

The redirect URI field location depends on which Instagram product you're using. Check these locations:

#### Option A: Settings → Basic (Most Common)

1. In **Settings → Basic**, scroll down
2. Look for **"Valid OAuth Redirect URIs"** or **"OAuth Redirect URIs"**
3. If you see it, click **"Add URI"** or **"+"**
4. Enter: `http://localhost:3000/api/auth/instagram/callback`
5. Click **"Save Changes"**

#### Option B: Products → Instagram Basic Display

1. In the left sidebar, click **"Products"**
2. Find **"Instagram Basic Display"** and click it
3. Click **"Basic Display"** in the submenu
4. Look for **"Valid OAuth Redirect URIs"** section
5. Add: `http://localhost:3000/api/auth/instagram/callback`
6. Click **"Save Changes"**

#### Option C: Products → Instagram Graph API

1. In the left sidebar, click **"Products"**
2. Find **"Instagram Graph API"** and click it
3. Look for **"Basic Display"** or **"Settings"** tab
4. Find **"Valid OAuth Redirect URIs"**
5. Add: `http://localhost:3000/api/auth/instagram/callback`
6. Click **"Save Changes"**

#### Option D: Add Platform → Website

1. In **Settings → Basic**, scroll to **"Add Platform"** section
2. Click **"Add Platform"** → Select **"Website"**
3. Enter Site URL: `http://localhost:3000`
4. After adding website platform, you should see OAuth redirect URI fields appear
5. Add: `http://localhost:3000/api/auth/instagram/callback`

### 5. Verify

After saving, you should see:
```
http://localhost:3000/api/auth/instagram/callback
```
in your list of Valid OAuth Redirect URIs.

## Important Notes

⚠️ **Critical Requirements:**

1. **Exact Match Required:**
   - Must be `http://localhost:3000` (not `https://`)
   - Must include `/api/auth/instagram/callback` exactly
   - No trailing slash
   - Case-sensitive

2. **For Production:**
   When deploying, also add your production URL:
   ```
   https://yourdomain.com/api/auth/instagram/callback
   ```

3. **Multiple URIs:**
   You can add multiple redirect URIs (one per line or separate entries)

4. **Save Changes:**
   Don't forget to click "Save Changes" at the bottom!

## Visual Guide

```
Meta Developer Console
└── Your App (682847584147123)
    └── Settings
        └── Basic
            └── Valid OAuth Redirect URIs
                └── [Add URI Button]
                    └── Enter: http://localhost:3000/api/auth/instagram/callback
                        └── Save Changes
```

## Troubleshooting

### "Invalid Redirect URI" Error

**Problem:** You get an error saying the redirect URI doesn't match.

**Solutions:**
1. Check for typos (especially `localhost` vs `local-host`)
2. Make sure it's `http://` not `https://` for localhost
3. No trailing slash at the end
4. Check if you saved the changes
5. Wait a few minutes for changes to propagate

### "Redirect URI Mismatch" Error

**Problem:** OAuth works but redirect fails.

**Solutions:**
1. Verify the URI in Meta Console matches exactly what's in your `.env.local`
2. Check both places:
   - Meta Console: `http://localhost:3000/api/auth/instagram/callback`
   - `.env.local`: `INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback`
3. They must match EXACTLY

### Can't Find "Valid OAuth Redirect URIs"

**Problem:** You don't see the field in Settings.

**Solutions:**
1. Make sure you're in **Settings → Basic** (not Advanced)
2. Scroll down - it's usually near the bottom
3. If using Instagram Graph API, it might be under **Products → Instagram Graph API → Basic Display**
4. Try refreshing the page

## Quick Checklist

Before testing Instagram login:
- [ ] Logged into Meta Developer Console
- [ ] Selected correct app (682847584147123)
- [ ] Went to Settings → Basic
- [ ] Added `http://localhost:3000/api/auth/instagram/callback` to Valid OAuth Redirect URIs
- [ ] Clicked "Save Changes"
- [ ] Verified URI appears in the list
- [ ] URI in `.env.local` matches exactly
- [ ] Restarted dev server after changes

## Still Having Issues?

1. **Double-check the URI** - Copy and paste to avoid typos
2. **Wait 2-3 minutes** - Changes can take time to propagate
3. **Clear browser cache** - Sometimes helps
4. **Check app permissions** - Make sure Instagram products are enabled

