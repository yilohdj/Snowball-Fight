import { MongoClient } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const apiKey = process.env.RIOT_API_KEY;
const client = new MongoClient(uri);

const dbName = "snowball-fight";
const collectionName = "leaderboard";

// Determines the regional routing
function getRegion2(region) {
  if (["na1", "br1", "la1", "la2"].includes(region)) return "americas";
  if (["jp1", "kr"].includes(region)) return "asia";
  if (["me1", "eun1", "euw1", "tr1", "ru"].includes(region)) return "europe";
  return "americas";
}

async function update() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const players = await collection.find({}).toArray();

    for (const player of players) {
      const { name, tagline, puuid, region } = player;
      const region2 = getRegion2(region);

      const challengeEndpoint = `https://${region}.api.riotgames.com/lol/challenges/v1/player-data/${puuid}?api_key=${apiKey}`

      try {
        const challengeResponse = await fetch(challengeEndpoint);
        if (!challengeResponse.ok) {
          console.error(`Failed to fetch challenges for ${name}#${tagline}: ${challengeResponse.status}`);
          continue;
        }

        const challengeData = await challengeResponse.json()
        const challenges = challengeData.challenges
        let snowballs = 0
        for (let j = 0; j < challenges.length; j++) {
            if (challenges[j].challengeId === 101203) {
                snowballs = challenges[j].value
            break
            }
        }

        await collection.updateOne(
          { puuid },
          { $set: { snowballsHit: snowballs } }
        );

        console.log(`✅ Updated ${name}#${tagline} with new score.`);
      } catch (err) {
        console.error(`Error updating ${name}#${tagline}:`, err.message);
      }
    }

  } catch (err) {
    console.error("Error connecting to DB:", err.message);
  } finally {
    await client.close();
    console.log("✅ Migration completed.");
  }
}

update();
