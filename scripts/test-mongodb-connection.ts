import { connectToDatabase } from "../lib/db";

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    console.log("MONGODB_URI:", process.env.MONGODB_URI?.replace(/\/\/.*@/, "//***:***@") || "NOT SET");
    
    await connectToDatabase();
    console.log("✅ Connection successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    console.error("\nTroubleshooting steps:");
    console.error("1. Verify the MongoDB server IP address is correct");
    console.error("2. Check if both computers are on the same network");
    console.error("3. Verify MongoDB is running on the remote computer");
    console.error("4. Check firewall settings on the remote computer");
    console.error("5. Verify MongoDB is configured to accept remote connections (bindIp: 0.0.0.0)");
    process.exit(1);
  }
}

testConnection();

