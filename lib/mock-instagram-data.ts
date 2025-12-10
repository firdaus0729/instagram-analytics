/**
 * Mock Instagram Data Generator
 * 
 * Generates realistic mock Instagram data for demo purposes.
 * This allows clients to see the platform without requiring actual Instagram accounts.
 */

export interface MockInstagramAccount {
  id: string;
  username: string;
  name: string;
  biography: string;
  profilePictureUrl: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
}

export interface MockInstagramMedia {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  caption: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
}

export interface MockInstagramInsight {
  metric: string;
  value: number;
  endTime: string;
}

/**
 * Generate a realistic mock Instagram account
 */
export function generateMockInstagramAccount(username?: string): MockInstagramAccount {
  const usernames = [
    "fashionista_life",
    "travel_diaries",
    "foodie_adventures",
    "fitness_motivation",
    "beauty_guru",
    "tech_reviews",
    "lifestyle_blogger",
    "photography_art",
    "wellness_coach",
    "fashion_stylist"
  ];

  const names = [
    "Sarah Johnson",
    "Emma Williams",
    "Olivia Brown",
    "Sophia Davis",
    "Isabella Miller",
    "Mia Wilson",
    "Charlotte Moore",
    "Amelia Taylor",
    "Harper Anderson",
    "Evelyn Thomas"
  ];

  const bios = [
    "✨ Fashion & Lifestyle Content Creator | DM for collaborations 📧",
    "🌍 Travel enthusiast | Sharing my adventures around the world ✈️",
    "🍕 Food lover | Recipes & restaurant reviews | NYC based",
    "💪 Fitness coach | Helping you reach your goals | Online training available",
    "💄 Beauty & Makeup | Product reviews & tutorials | PR friendly",
    "📱 Tech reviews & unboxings | Latest gadgets & tech news",
    "🌟 Lifestyle blogger | Fashion, travel, food & more",
    "📸 Professional photographer | Available for bookings",
    "🧘 Wellness & mindfulness | Yoga instructor | Online classes",
    "👗 Fashion stylist | Personal shopping & wardrobe consulting"
  ];

  const randomIndex = Math.floor(Math.random() * usernames.length);
  const selectedUsername = username || usernames[randomIndex];
  const selectedName = names[randomIndex];
  const selectedBio = bios[randomIndex];

  // Generate realistic follower counts (10K - 500K)
  const followersCount = Math.floor(Math.random() * 490000) + 10000;
  const followsCount = Math.floor(followersCount * 0.1); // Usually follows ~10% of followers
  const mediaCount = Math.floor(Math.random() * 500) + 50; // 50-550 posts

  return {
    id: `1784140${Math.floor(Math.random() * 100000000)}`, // Realistic Instagram ID format
    username: selectedUsername,
    name: selectedName,
    biography: selectedBio,
    profilePictureUrl: `https://i.pravatar.cc/150?img=${randomIndex + 1}`,
    followersCount,
    followsCount,
    mediaCount
  };
}

/**
 * Generate mock Instagram media posts
 */
export function generateMockInstagramMedia(accountId: string, count: number = 20): MockInstagramMedia[] {
  const mediaTypes: Array<"IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"> = ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"];
  const captions = [
    "Just launched my new collection! What do you think? ✨",
    "Sunset vibes 🌅 #photography #sunset",
    "New recipe alert! Check out my latest post 🍰",
    "Behind the scenes of today's shoot 📸",
    "Weekend adventures! Where should I go next? 🗺️",
    "Product review coming soon! Stay tuned 👀",
    "Thank you for 100K followers! 🎉",
    "Quick outfit of the day 🎀",
    "Coffee and productivity ☕",
    "Travel diary: Day 3 in Paris 🇫🇷"
  ];

  const media: MockInstagramMedia[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
    const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    // Generate realistic engagement based on post age (newer posts have more engagement)
    const engagementMultiplier = 1 - (daysAgo / 90) * 0.5; // 50% less engagement for older posts
    const baseLikes = Math.floor(Math.random() * 5000) + 500;
    const likeCount = Math.floor(baseLikes * engagementMultiplier);
    const commentsCount = Math.floor(likeCount * 0.1); // ~10% comment rate
    const sharesCount = Math.floor(likeCount * 0.05); // ~5% share rate
    const savesCount = Math.floor(likeCount * 0.15); // ~15% save rate

    media.push({
      id: `${accountId}_${i + 1}`,
      mediaType,
      mediaUrl: `https://picsum.photos/1080/1080?random=${i}`,
      thumbnailUrl: mediaType === "VIDEO" ? `https://picsum.photos/640/640?random=${i}` : undefined,
      permalink: `https://www.instagram.com/p/ABC${i}123/`,
      caption: captions[Math.floor(Math.random() * captions.length)],
      timestamp,
      likeCount,
      commentsCount,
      sharesCount,
      savesCount
    });
  }

  // Sort by timestamp (newest first)
  return media.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generate mock Instagram insights
 */
export function generateMockInstagramInsights(accountId: string, days: number = 30): {
  reach: MockInstagramInsight[];
  impressions: MockInstagramInsight[];
  profileViews: MockInstagramInsight[];
  websiteClicks: MockInstagramInsight[];
} {
  const insights = {
    reach: [] as MockInstagramInsight[],
    impressions: [] as MockInstagramInsight[],
    profileViews: [] as MockInstagramInsight[],
    websiteClicks: [] as MockInstagramInsight[]
  };

  const now = Date.now();
  const baseReach = Math.floor(Math.random() * 20000) + 10000;
  const baseImpressions = Math.floor(baseReach * 1.5); // Impressions are usually higher
  const baseProfileViews = Math.floor(baseReach * 0.3);
  const baseWebsiteClicks = Math.floor(baseReach * 0.05);

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const endTime = date.toISOString();
    
    // Add some variance to make it realistic
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120% of base

    insights.reach.push({
      metric: "reach",
      value: Math.floor(baseReach * variance),
      endTime
    });

    insights.impressions.push({
      metric: "impressions",
      value: Math.floor(baseImpressions * variance),
      endTime
    });

    insights.profileViews.push({
      metric: "profile_views",
      value: Math.floor(baseProfileViews * variance),
      endTime
    });

    insights.websiteClicks.push({
      metric: "website_clicks",
      value: Math.floor(baseWebsiteClicks * variance),
      endTime
    });
  }

  return insights;
}

/**
 * Generate mock audience demographics
 */
export function generateMockAudienceDemographics() {
  return {
    ageGender: [
      { ageRange: "13-17", male: 5, female: 8 },
      { ageRange: "18-24", male: 15, female: 25 },
      { ageRange: "25-34", male: 20, female: 18 },
      { ageRange: "35-44", male: 4, female: 3 },
      { ageRange: "45-54", male: 1, female: 1 },
      { ageRange: "55-64", male: 0, female: 0 },
      { ageRange: "65+", male: 0, female: 0 }
    ],
    topCities: [
      { city: "New York", country: "United States", value: 8500 },
      { city: "Los Angeles", country: "United States", value: 6200 },
      { city: "London", country: "United Kingdom", value: 4800 },
      { city: "Toronto", country: "Canada", value: 3500 },
      { city: "Sydney", country: "Australia", value: 2800 }
    ],
    topCountries: [
      { country: "United States", value: 45000 },
      { country: "United Kingdom", value: 12000 },
      { country: "Canada", value: 8000 },
      { country: "Australia", value: 6000 },
      { country: "Germany", value: 4000 }
    ]
  };
}

/**
 * Complete mock Instagram account with all data
 */
export function generateCompleteMockInstagramData(username?: string) {
  const account = generateMockInstagramAccount(username);
  const media = generateMockInstagramMedia(account.id, 30);
  const insights = generateMockInstagramInsights(account.id, 30);
  const demographics = generateMockAudienceDemographics();

  return {
    account,
    media,
    insights,
    demographics
  };
}


