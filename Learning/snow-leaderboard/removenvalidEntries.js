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

async function repair() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const players = await collection.find({}).toArray();

    for (const player of players) {
      const { name, tagline, region } = player;

      if (!name || !tagline || !region) {
        console.warn(`Skipping invalid entry:`, player);
        continue;
      }

      const region2 = getRegion2(region);
      const accountUrl = `https://${region2}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tagline)}?api_key=${apiKey}`;

      try {
        const accountRes = await fetch(accountUrl);
        if (!accountRes.ok) {
          console.error(`❌ Failed account lookup for ${name}#${tagline}: ${accountRes.status}`);
          continue;
        }

        const accountData = await accountRes.json();
        const newPuuid = accountData.puuid;

        // Get profile icon
        const profileUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${newPuuid}?api_key=${apiKey}`;
        const profileRes = await fetch(profileUrl);
        const profileData = await profileRes.json();
        const profileIconId = profileData.profileIconId;

        // Get snowballsHit
        const challengeUrl = `https://${region}.api.riotgames.com/lol/challenges/v1/player-data/${newPuuid}?api_key=${apiKey}`;
        const challengeRes = await fetch(challengeUrl);

        if (!challengeRes.ok) {
          console.error(`⚠️ Failed challenge fetch for ${name}#${tagline}: ${challengeRes.status}`);
          continue;
        }

        const challengeData = await challengeRes.json();
        const challenges = challengeData.challenges || [];
        const snowballChallenge = challenges.find((c) => c.challengeId === 101203);
        const snowballsHit = snowballChallenge?.value ?? 0;

        // Update entry in DB
        await collection.updateOne(
          { name, tagline },
          {
            $set: {
              puuid: newPuuid,
              profileIconId,
              snowballsHit,
              region,
            },
          }
        );

        console.log(`✅ Repaired ${name}#${tagline}`);
      } catch (err) {
        console.error(`💥 Error processing ${name}#${tagline}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  } finally {
    await client.close();
    console.log("✅ Repair complete.");
  }
}

repair();
