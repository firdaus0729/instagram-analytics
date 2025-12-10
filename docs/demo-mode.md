# Mock Instagram Data Mode

When `ENABLE_DEMO_MODE=true`, the Instagram signup flow uses mock data instead of connecting to a real Instagram account. All mock data is stored in MongoDB just like real data, so you can demonstrate exactly what gets saved.

## How It Works

### When ENABLE_DEMO_MODE=true

1. User clicks **"Continue with Instagram"** on login page
2. User is shown a signup form (email and password)
3. User submits the form
4. System creates user account with mock Instagram data
5. All mock data is saved to MongoDB
6. User is redirected to dashboard with full analytics

### When ENABLE_DEMO_MODE=false

1. User clicks **"Continue with Instagram"** on login page
2. User is shown a signup form (email and password)
3. User submits the form
4. System redirects to Facebook OAuth flow
5. User authorizes the app
6. System fetches real Instagram data
7. All data is saved to MongoDB
8. User is redirected to dashboard with real analytics

## Configuration

Set `ENABLE_DEMO_MODE=true` in your `.env.local`:

```bash
ENABLE_DEMO_MODE=true
```

## What Gets Created in Demo Mode

### User Account
- Email: `{username}@instagram.local`
- Name: Random influencer name
- Role: `influencer`
- Status: `isApproved: false` (needs admin approval)

### Instagram Account Data
- Instagram User ID (mock)
- Username (random from predefined list)
- Biography (random from predefined list)
- Profile Picture (from pravatar.cc)
- Follower Count: 10,000 - 500,000 (random)
- Following Count: ~10% of followers

### Instagram Media (30 posts)
- Mix of IMAGE, VIDEO, and CAROUSEL_ALBUM
- Realistic engagement metrics (likes, comments, shares, saves)
- Posts from last 90 days
- Media URLs from picsum.photos

### Instagram Insights (30 days)
- Daily reach data
- Daily impressions data
- Profile views
- Website clicks
- Audience demographics (age, gender, location)

## MongoDB Collections Populated

All data is stored in the same collections as real Instagram data:

- ✅ `users` - User account
- ✅ `influencerprofiles` - Profile information
- ✅ `instagramaccounts` - Instagram account data
- ✅ `instagrammedia` - Posts, reels, stories
- ✅ `instagraminsights` - Analytics and demographics

## Demo Mode vs Real Mode

| Feature | Demo Mode | Real Mode |
|---------|-----------|-----------|
| Instagram API Calls | ❌ Skipped | ✅ Real API calls |
| Data Source | 🎭 Mock data generator | 📡 Instagram Graph API |
| Data Storage | ✅ MongoDB (same as real) | ✅ MongoDB |
| Token Storage | `demo_token` / `demo_long_token` | Real OAuth tokens |
| Token Expiration | 60 days | Real expiration from API |
| Media URLs | picsum.photos | Real Instagram URLs |
| Profile Pictures | pravatar.cc | Real Instagram photos |

## Use Cases

### 1. Client Demonstrations
Show clients the complete flow without requiring them to:
- Have a Business/Creator Instagram account
- Grant OAuth permissions
- Wait for API rate limits

### 2. Development & Testing
- Test dashboard features
- Verify data storage
- Check analytics calculations
- Test search and filtering

### 3. Training & Onboarding
- Train team members
- Show what data gets stored
- Demonstrate features

## Comparison Page

Visit `/demo/comparison` to see a detailed comparison of:
- What data is stored for normal signup vs Instagram signup
- What features are available for each method
- MongoDB collections used
- Advantages and limitations

## Important Notes

⚠️ **Demo Mode is for Development/Demo Only**
- Don't use in production
- Mock tokens won't work for real API calls
- Data is randomly generated

✅ **Data is Real (in MongoDB)**
- All mock data is stored in MongoDB
- You can query it like real data
- Perfect for showing clients what gets saved

## Environment Variables

Add to `.env.local`:

```bash
# Enable demo mode by default (optional)
ENABLE_DEMO_MODE=true

# Other required variables
MONGODB_URI=mongodb://localhost:27017/instagram_analytics
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Troubleshooting

### Demo Mode Not Working

1. **Check URL**: Make sure `?demo=true` is in the URL
2. **Check Environment**: Verify `ENABLE_DEMO_MODE=true` if using env var
3. **Check Console**: Look for `🎭 DEMO MODE` logs in server console
4. **Check MongoDB**: Verify data is being saved

### Mock Data Not Appearing

1. **Wait a moment**: Data population happens asynchronously
2. **Check MongoDB**: Verify collections are populated
3. **Refresh Dashboard**: Reload the influencer dashboard
4. **Check Logs**: Look for `✅ DEMO MODE: Mock data saved` in console

## Example Flow

1. User clicks "🎭 Try Demo Mode" on login page
2. Redirects to `/api/auth/instagram/login?demo=true`
3. Callback route detects `demo=true` parameter
4. Generates mock Instagram account data
5. Creates user account in MongoDB
6. Creates Instagram account in MongoDB
7. Populates 30 mock media posts
8. Populates 30 days of insights
9. Populates audience demographics
10. Redirects to dashboard with `?demo=true`
11. Dashboard shows all mock data

## Code Location

- Mock data generator: `lib/mock-instagram-data.ts`
- Demo mode handler: `app/api/auth/instagram/callback/route.ts`
- Login route: `app/api/auth/instagram/login/route.ts`
- Comparison page: `app/demo/comparison/page.tsx`


