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

async function migrate() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const players = await collection.find({}).toArray();

    for (const player of players) {
      const { name, tagline, region } = player;
      const region2 = getRegion2(region);

      const puuidUrl = `https://${region2}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tagline)}?api_key=${apiKey}`;

      try {
        const response = await fetch(puuidUrl);
        if (!response.ok) {
          console.error(`Failed to fetch PUUID for ${name}#${tagline}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const newPuuid = data.puuid;

        await collection.updateOne(
          { name, tagline },
          { $set: { puuid: newPuuid } }
        );

        console.log(`✅ Updated ${name}#${tagline} with new PUUID.`);
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

migrate();
