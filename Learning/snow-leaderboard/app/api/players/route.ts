import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { checkRateLimit, createRateLimitHeaders, generalAPIRateLimiter } from "@/lib/rateLimit"

// MongoDB connection
const uri = process.env.MONGODB_URI ?? "" // Store in Vercel env vars
const client = new MongoClient(uri)
const dbName = "snowball-fight" // Database name
const collectionName = "leaderboard" // Collection name

export async function GET(request: Request) {
  try {
    // Check rate limit first
    const rateLimitResult = checkRateLimit(request, generalAPIRateLimiter)
    
    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime)
      
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers
        }
      )
    }

    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    // Fetch all players, sorted by snowballsHit (highest first)
    const players = await collection
      .find({})
      .sort({ snowballsHit: -1 }) // Descending order
      .toArray()

    // Add rate limit headers to successful response
    const headers = createRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime)

    return NextResponse.json(players, { headers })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Failed to load players data" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
