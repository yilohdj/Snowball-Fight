import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection
const uri = process.env.MONGODB_URI; // Store in Vercel env vars
const client = new MongoClient(uri);
const dbName = "snowball-fight"; // Database name
const collectionName = "leaderboard"; // Collection name

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch all players, sorted by snowballsHit (highest first)
    const players = await collection
      .find({})
      .sort({ snowballsHit: -1 }) // Descending order
      .toArray();

    return NextResponse.json(players);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to load players data" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
