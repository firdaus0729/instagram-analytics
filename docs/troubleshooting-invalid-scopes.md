# Troubleshooting "Invalid Scopes" Error

If you're seeing the error "Invalid Scopes: pages_show_list" when trying to connect Instagram, this means your Facebook app is not properly configured. Follow these steps to fix it.

## The Problem

Facebook is rejecting the `pages_show_list` permission because:
1. The permission hasn't been requested in App Review
2. The app type is incorrect
3. Required products are missing
4. The app is in development mode without proper test user setup

## Step-by-Step Fix

### Step 1: Verify App Type

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Select your app
3. Go to **Settings** → **Basic**
4. Check **"App Type"** - it MUST be **"Business"**
   - If it's "Consumer" or "None", you need to create a new Business app
   - Business apps are required for Instagram Graph API access

### Step 2: Add Required Products

Your app MUST have these products added:

1. Go to **"Add Products"** (or **"Products"** in left sidebar)
2. Verify/Add these products:
   - ✅ **Facebook Login** - Click "Set Up" if not already added
   - ✅ **Instagram Graph API** - Click "Set Up" (NOT "Instagram Basic Display")
   - ✅ **Pages API** - Usually added automatically

**Critical:** Do NOT add "Instagram Basic Display" - it's deprecated and causes conflicts.

### Step 3: Request Permissions in App Review

Even in development mode, permissions need to be requested:

1. Go to **App Review** → **Permissions and Features**
2. Search for **`pages_show_list`**
3. Click **"Request"** or **"Add"** next to it
4. Fill in the required information:
   - **Use Case**: "To access Instagram Business accounts linked to user's Facebook Pages"
   - **Why is this needed**: "Users need to connect their Instagram Business accounts to access analytics and insights"
   - Upload screenshots if required
5. Click **"Save Changes"**

**Note:** In development mode, you don't need full approval, but the permission must be "Requested" status.

### Step 4: Add Test Users

In development mode, only test users can grant permissions:

1. Go to **Roles** → **Roles**
2. Click **"Add People"**
3. Add yourself and any test users as:
   - **Admin** (full access)
   - **Developer** (can test permissions)
   - **Tester** (can grant permissions)

### Step 5: Verify Redirect URI

1. Go to **Settings** → **Basic**
2. Scroll down to **"Valid OAuth Redirect URIs"**
3. Ensure this URI is added:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```
4. Click **"Save Changes"**

### Step 6: Check App Status

1. Go to **Settings** → **Basic**
2. Check **"App Mode"**:
   - **Development Mode**: Only test users can use the app
   - **Live Mode**: Available to all users (requires App Review approval)

For testing, Development Mode is fine, but make sure test users are added (Step 4).

## Alternative: Try Without Scopes (Temporary Test)

If you want to test the OAuth flow without scopes first:

1. The code will attempt to authenticate without requesting scopes
2. This will let you see if the basic OAuth flow works
3. However, you won't be able to access Instagram data without proper permissions

**This is just for testing - you still need to fix the permissions for full functionality.**

## Common Issues

### Issue: "Permission not found in App Review"

**Solution:** 
- The permission name must be exactly `pages_show_list`
- Make sure you're in **App Review** → **Permissions and Features**
- Search for it - it should appear in the list

### Issue: "App is in Development Mode"

**Solution:**
- This is normal for testing
- Add test users in **Roles** → **Roles**
- Test users can grant permissions even in Development Mode

### Issue: "Instagram Graph API product not found"

**Solution:**
- Go to **Add Products**
- Search for "Instagram Graph API" (not "Instagram Basic Display")
- Click "Set Up"
- Complete the setup wizard

### Issue: "App Type is Consumer, not Business"

**Solution:**
- You need to create a new Business app
- Consumer apps cannot access Instagram Graph API
- Business apps are required for Pages and Instagram access

## Verification Checklist

Before trying to connect Instagram again, verify:

- [ ] App Type is "Business"
- [ ] Facebook Login product is added
- [ ] Instagram Graph API product is added (NOT Basic Display)
- [ ] `pages_show_list` permission is requested in App Review
- [ ] Test users are added in Roles
- [ ] Redirect URI is added in Settings → Basic
- [ ] App ID and App Secret are correct in `.env.local`

## Still Not Working?

If you've completed all steps and still see "Invalid Scopes":

1. **Wait a few minutes** - permission changes can take time to propagate
2. **Clear browser cache** and try again
3. **Check App ID** - make sure you're using the correct App ID in `.env.local`
4. **Review App Review status** - go to App Review → Permissions and Features and check if `pages_show_list` shows as "Requested" or "Approved"
5. **Try in incognito/private browser** to rule out cache issues
6. **Check Facebook Developer Console for error messages** - sometimes there are additional error details there

## Contact Information

- Facebook Developer Documentation: https://developers.facebook.com/docs/
- Facebook Login Permissions: https://developers.facebook.com/docs/facebook-login/permissions
- Instagram Graph API Documentation: https://developers.facebook.com/docs/instagram-api

## Next Steps After Fixing

Once permissions are properly configured:

1. Try the Instagram login again
2. You should see a permission request dialog (not an error)
3. Grant the permissions
4. The OAuth flow should complete successfully










