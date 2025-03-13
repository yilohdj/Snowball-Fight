import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Define the player type
type Player = {
  puuid: string
  name: string
  tagline: string
  snowballsHit: number
  profileIconId: number
  region: string
}

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
      // Step 1: Retrieve PUUID
      const rootUrl = `https://${region2}.api.riotgames.com/`
      const puuidEndpoint = `riot/account/v1/accounts/by-riot-id/${encodeURIComponent(formData.summonerName)}/${encodeURIComponent(formData.tagLine)}`
      const puuidUrl = rootUrl + puuidEndpoint + '?api_key=' + apiKey
      
      const puuidResponse = await fetch(puuidUrl)
      if (!puuidResponse.ok) {
        return NextResponse.json(
          { error: `PUUID error! Status: ${puuidResponse.status}` },
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
          { error: `Profile icon ID error! Status: ${profileResponse.status}` },
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
          { error: `Challenge data error! Status: ${challengeResponse.status}` },
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
      
      // Read existing data file
      const filePath = path.join(process.cwd(), "snowballs.json")
      let snowballs: Player[] = []
      
      try {
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, "utf8")
          snowballs = JSON.parse(fileData)
        }
      } catch (error) {
        console.error("Error reading snowballs.json:", error)
        // If there's an error reading the file, we'll start with an empty array
      }
      
      // Update or add player entry
      const index = snowballs.findIndex(player => player.puuid === puuid)
      
      if (index === -1) {
        snowballs.push(entry)
      } else {
        snowballs[index] = entry
      }
      
      // Sort by snowballs hit (highest first)
      snowballs.sort((a, b) => b.snowballsHit - a.snowballsHit)
      
      // Write updated data back to file
      fs.writeFileSync(filePath, JSON.stringify(snowballs, null, 2))
      
      return NextResponse.json({
        success: true,
        message: "Player registered successfully",
        player: entry
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