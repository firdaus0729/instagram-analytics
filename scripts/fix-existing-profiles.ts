import { connectToDatabase } from "../lib/db";
import { User } from "../models/User";
import { InfluencerProfile } from "../models/InfluencerProfile";
import { InstagramAccount } from "../models/InstagramAccount";

/**
 * Utility script to fix existing influencer profiles:
 * - Make all profiles public
 * - Approve all influencer users
 * - Create missing profiles for influencers without one
 */
async function fixExistingProfiles() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    // 1. Approve all influencer users
    const updateResult = await User.updateMany(
      { role: "influencer" },
      { isApproved: true, isVerified: true }
    );
    console.log(`✅ Approved ${updateResult.modifiedCount} influencer users`);

    // 2. Make all profiles public
    const profileResult = await InfluencerProfile.updateMany(
      {},
      { isPublic: true }
    );
    console.log(`✅ Made ${profileResult.modifiedCount} profiles public`);

    // 3. Create missing profiles for influencers without one
    const influencers = await User.find({ role: "influencer" });
    let createdCount = 0;
    
    for (const influencer of influencers) {
      const existingProfile = await InfluencerProfile.findOne({ user: influencer._id });
      if (!existingProfile) {
        await InfluencerProfile.create({
          user: influencer._id,
          category: "Other",
          bio: "New influencer profile",
          isPublic: true
        });
        createdCount++;
      }
    }
    console.log(`✅ Created ${createdCount} missing profiles`);

    // 4. Show summary
    const allProfiles = await InfluencerProfile.find({}).populate("user");
    console.log("\n📊 Summary:");
    console.log(`Total profiles: ${allProfiles.length}`);
    
    for (const profile of allProfiles) {
      const user = profile.user as any;
      const account = await InstagramAccount.findOne({ user: user._id });
      const status = profile.isPublic && user.isApproved && account 
        ? "✅ Visible" 
        : "❌ Not visible";
      console.log(`  - ${user.email}: ${status} (public: ${profile.isPublic}, approved: ${user.isApproved}, has IG: ${!!account})`);
    }

    console.log("\n✅ All profiles fixed!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing profiles:", error);
    process.exit(1);
  }
}

fixExistingProfiles();


