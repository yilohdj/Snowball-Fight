import { MongoClient } from "mongodb";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const apiKey = process.env.RIOT_API_KEY;
const client = new MongoClient(uri);

const dbName = "snowball-fight";
const collectionName = "leaderboard";

function getRegion2(region) {
  if (["na1", "br1", "la1", "la2"].includes(region)) return "americas";
  if (["jp1", "kr"].includes(region)) return "asia";
  if (["me1", "eun1", "euw1", "tr1", "ru"].includes(region)) return "europe";
  return "americas";
}

async function removeInvalidEntries() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const players = await collection.find({}).toArray();

    for (const player of players) {
      const { name, tagline, region } = player;

      if (
        typeof name !== "string" ||
        typeof tagline !== "string" ||
        typeof region !== "string"
      ) {
        console.warn(`⚠️ Skipping malformed entry:`, player);
        await collection.deleteOne({ _id: player._id });
        console.log(`🗑️ Deleted malformed entry.`);
        continue;
      }

      const region2 = getRegion2(region);
      const cleanedName = name.trim();
      const cleanedTag = tagline.trim();

      const accountUrl = `https://${region2}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanedName)}/${encodeURIComponent(cleanedTag)}?api_key=${apiKey}`;

      try {
        const res = await fetch(accountUrl);

        if (!res.ok) {
          const reason = await res.text();
          console.warn(`❌ ${cleanedName}#${cleanedTag} not found (${res.status}) - ${reason}`);
          await collection.deleteOne({ _id: player._id });
          console.log(`🗑️ Deleted ${cleanedName}#${cleanedTag}`);
        } else {
          console.log(`✅ Valid entry: ${cleanedName}#${cleanedTag}`);
        }
      } catch (err) {
        console.error(`💥 Network error for ${cleanedName}#${cleanedTag}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
  } finally {
    await client.close();
    console.log("✅ Cleanup complete.");
  }
}

removeInvalidEntries();
