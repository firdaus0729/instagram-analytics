# Can't Find "Valid OAuth Redirect URIs"? Here's Where to Look

If you can't find the "Valid OAuth Redirect URIs" field, try these locations:

## Method 1: Check Settings → Basic

1. Go to **Settings** → **Basic**
2. Scroll ALL the way down (it's often at the very bottom)
3. Look for sections like:
   - "Valid OAuth Redirect URIs"
   - "OAuth Redirect URIs"
   - "Redirect URIs"
   - "Authorized Redirect URIs"

## Method 2: Check Instagram Products

### For Instagram Basic Display:

1. Left sidebar → **Products**
2. Click **"Instagram Basic Display"**
3. Click **"Basic Display"** (submenu)
4. Look for **"Valid OAuth Redirect URIs"** or **"OAuth Redirect URIs"**

### For Instagram Graph API:

1. Left sidebar → **Products**
2. Click **"Instagram Graph API"**
3. Look for **"Basic Display"** tab or **"Settings"** tab
4. Find the redirect URI field

## Method 3: Add Website Platform First

Sometimes the field only appears after adding a website platform:

1. **Settings** → **Basic**
2. Scroll to **"Add Platform"** section
3. Click **"Add Platform"**
4. Select **"Website"**
5. Enter: `http://localhost:3000`
6. Click **"Save Changes"**
7. Now scroll down - the OAuth redirect URI fields should appear

## Method 4: Check App Review Section

1. **Settings** → **Basic**
2. Look for **"App Review"** or **"Permissions and Features"** section
3. Sometimes redirect URIs are configured there

## Method 5: Use Facebook Login Product

If you're using Facebook Login:

1. **Products** → **Facebook Login**
2. Click **"Settings"**
3. Look for **"Valid OAuth Redirect URIs"**
4. Add your URI there

## Still Can't Find It?

### Check Your App Type

The field location depends on your app type:
- **Business App**: Usually in Settings → Basic
- **Consumer App**: Might be in Products → specific product
- **Test App**: May have limited settings

### Alternative: Use Instagram Graph API Setup

1. Go to **Products** → **Instagram Graph API**
2. Click **"Get Started"** or **"Set Up"**
3. Follow the setup wizard - it will ask for redirect URIs
4. Add: `http://localhost:3000/api/auth/instagram/callback`

### Check App Status

If your app is in **Development Mode**:
- Some settings might be hidden
- Make sure you're an admin/developer of the app
- Check if you have the right permissions

## Visual Guide - Where to Look

```
Meta Developer Console
├── Settings
│   └── Basic
│       ├── App ID
│       ├── App Secret
│       ├── App Domains
│       ├── Website (Add Platform)
│       └── [Scroll Down] ← Valid OAuth Redirect URIs (often at bottom)
│
├── Products
│   ├── Instagram Basic Display
│   │   └── Basic Display
│   │       └── Valid OAuth Redirect URIs ← Check here
│   │
│   ├── Instagram Graph API
│   │   └── Basic Display / Settings
│   │       └── Valid OAuth Redirect URIs ← Or here
│   │
│   └── Facebook Login
│       └── Settings
│           └── Valid OAuth Redirect URIs ← Or here
```

## Quick Checklist

- [ ] Checked Settings → Basic (scrolled all the way down)
- [ ] Checked Products → Instagram Basic Display → Basic Display
- [ ] Checked Products → Instagram Graph API
- [ ] Added Website platform first
- [ ] Checked if app is in Development Mode
- [ ] Verified I'm an admin/developer of the app

## If Nothing Works

1. **Take a screenshot** of your Settings → Basic page
2. **Check the URL** - make sure you're in the right app
3. **Try a different browser** - sometimes UI elements don't load properly
4. **Clear browser cache** and refresh
5. **Contact Meta Support** or check their documentation

## Pro Tip

If you still can't find it, you can also configure it via the **Graph API Explorer**:
1. Go to **Tools** → **Graph API Explorer**
2. Select your app
3. Look for OAuth settings there

