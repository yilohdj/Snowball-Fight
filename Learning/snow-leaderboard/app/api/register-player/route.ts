import { NextResponse } from "next/server"
import { MongoClient } from "mongodb";

// Define the player type
type Player = {
  puuid: string
  name: string
  tagline: string
  snowballsHit: number
  profileIconId: number
  region: string
}
const uri = process.env.MONGODB_URI ?? "";
const client = new MongoClient(uri)
const dbName = "snowball-fight"; // Database name
const collectionName = "leaderboard"; // Collection name

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.json()

    // Basic validation
    if (!formData.summonerName?.trim()) {
      return NextResponse.json(
        { error: "Summoner name is required" },
        { status: 400 }
      )
    }

    if (!formData.tagLine?.trim()) {
      return NextResponse.json(
        { error: "Tag line is required" },
        { status: 400 }
      )
    }

    // Determine region2 based on region
    let region2 = ""
    if (formData.region === "na1" || formData.region === "br1" || formData.region === "la1" || formData.region === "la2") {
      region2 = "americas"
    } else if (formData.region === "jp1" || formData.region === "kr") {
      region2 = "asia"
    } else if (formData.region === "me1" || formData.region === "eun1" || formData.region === "euw1" || formData.region === "tr1" || formData.region === "ru") {
      region2 = "europe"
    } else {
      region2 = "americas"
    }

    // Get API key from environment variable
    const apiKey = process.env.RIOT_API_KEY

    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Step 1: Retrieve PUUID
      const rootUrl = `https://${region2}.api.riotgames.com/`
      const puuidEndpoint = `riot/account/v1/accounts/by-riot-id/${encodeURIComponent(formData.summonerName)}/${encodeURIComponent(formData.tagLine)}`
      const puuidUrl = rootUrl + puuidEndpoint + '?api_key=' + apiKey
      
      const puuidResponse = await fetch(puuidUrl)
      if (!puuidResponse.ok) {
        return NextResponse.json(
          { error: `Request Error Status: ${puuidResponse.status}` },
          { status: puuidResponse.status }
        )
      }
      
      const puuidData = await puuidResponse.json()
      const puuid = puuidData.puuid
      
      // Step 2: Retrieve profile icon ID
      const profileEndpoint = `https://${formData.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`
      const profileResponse = await fetch(profileEndpoint)
      
      if (!profileResponse.ok) {
        return NextResponse.json(
          { error: `Request Error Status: ${profileResponse.status}` },
          { status: profileResponse.status }
        )
      }
      
      const profileData = await profileResponse.json()
      const profileIconId = profileData.profileIconId
      
      // Step 3: Retrieve snowballs hit
      const challengeEndpoint = `https://${formData.region}.api.riotgames.com/lol/challenges/v1/player-data/${puuid}?api_key=${apiKey}`
      const challengeResponse = await fetch(challengeEndpoint)
      
      if (!challengeResponse.ok) {
        return NextResponse.json(
          { error: `Request Error Status: ${challengeResponse.status}` },
          { status: challengeResponse.status }
        )
      }
      
      const challengeData = await challengeResponse.json()
      const challenges = challengeData.challenges
      
      let snowballsHit = 0
      for (let j = 0; j < challenges.length; j++) {
        if (challenges[j].challengeId === 101203) {
          snowballsHit = challenges[j].value
          break
        }
      }
      
      // Create player entry
      const entry: Player = {
        puuid: puuid,
        name: formData.summonerName,
        tagline: formData.tagLine,
        snowballsHit: snowballsHit,
        profileIconId: profileIconId,
        region: formData.region
      }
      await collection.updateOne(
        { puuid }, // Find by puuid
        { $set: entry }, // Update or set new values
        { upsert: true } // Insert if not found
      );
      
      // Read existing data file
      const leaderboard = await collection
        .find({})
        .sort({ snowballsHit: -1 })
        .toArray();
      
      return NextResponse.json({
        success: true,
        message: "Player registered successfully",
        leaderboard
      })
      
    } catch (error) {
      console.error("API or file operation error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "An unexpected error occurred" },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error("Request parsing error:", error)
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    )
  }
}