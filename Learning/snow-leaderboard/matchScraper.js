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
async function getPUUID(gameName, tagline, region) {
  const region2 = getRegion2(region);
  try {
    const puuidResponse = await fetch(
      `https://${region2}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagline}?api_key=${apiKey}`
    );
    if (!puuidResponse.ok) {
      console.error('Failed to retrieve PUUID');
      return null;
    }
    const data = await puuidResponse.json();
    return data.puuid;
  } catch (err) {
    console.error('Error fetching PUUID:', err);
    return null;
  }
}
async function scrape(gameName, tagline, region, count){
    const playersChecked = new Set();
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const region2 = getRegion2(region);
        const puuid = await getPUUID(gameName, tagline, region)
        if (!puuid) {
            console.error("Cannot proceed without a valid PUUID");
            return;
        }
        const matchIDEndpoint = `https://${region2}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=450&type=normal&start=0&count=${count}&api_key=${apiKey}`;

        try {
            const matchIDResponse = await fetch(matchIDEndpoint);
            if (!matchIDResponse.ok) {
                console.error(`Failed to fetch match IDs`);
            }

            const matchIDs = await matchIDResponse.json();

            for (let i = 0; i < matchIDs.length; i++) {
                const matchEndpoint = `https://${region2}.api.riotgames.com/lol/match/v5/matches/${matchIDs[i]}?api_key=${apiKey}`;
                try {
                    const matchResponse = await fetch(matchEndpoint);
                    if (!matchResponse.ok) {
                        console.error(`Failed to fetch match data for ${matchIDs[i]}`);
                        break;
                    }
                    const matchData = await matchResponse.json();
                    const participants = matchData.metadata.participants;
                    for (let j = 0; j < participants.length; j++) {
                        if (playersChecked.has(participants[j])) {
                            continue;
                        }
                        try {
                            const profileEndpoint = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${participants[j]}?api_key=${apiKey}`;
                            const profileResponse = await fetch(profileEndpoint);
                            if (!profileResponse.ok) {
                                console.error(`Profile Request Error Status: ${profileResponse.status}`);
                                continue;
                            }
                            const profileData = await profileResponse.json();
                            const profileIconId = profileData.profileIconId;

                            const challengeEndpoint = `https://${region}.api.riotgames.com/lol/challenges/v1/player-data/${participants[j]}?api_key=${apiKey}`;
                            const challengeResponse = await fetch(challengeEndpoint);
                            if (!challengeResponse.ok) {
                                console.error(`Challenge Request Error Status: ${challengeResponse.status}`);
                                continue;
                            }
                            const challengeData = await challengeResponse.json();
                            const challenges = challengeData.challenges;
                            let snowballsHit = 0;
                            for (let k = 0; k < challenges.length; k++) {
                                if (challenges[k].challengeId === 101203) {
                                    snowballsHit = challenges[k].value;
                                    break;
                                }
                            }
                            const playerEndpoint = `https://${region2}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${participants[j]}?api_key=${apiKey}`
                            const playerResponse = await fetch(playerEndpoint);
                            if (!playerResponse.ok) {
                                console.error(`Player Request Error Status: ${playerResponse.status}`);
                                continue;
                            }
                            const playerData = await playerResponse.json();
                            const Player = {
                                puuid: participants[j],
                                name: playerData.gameName,
                                tagline: playerData.tagLine,
                                snowballsHit: snowballsHit,
                                profileIconId: profileIconId,
                                region: region
                            }
                            await collection.updateOne(
                                { puuid: participants[j] }, // Find by puuid
                                { $set: Player }, // Update or set new values
                                { upsert: true } // Insert if not found
                            );
                            console.log(playerData.gameName + "#" + playerData.tagLine + " added.");
                            playersChecked.add(participants[j]);
                        } catch (error) {
                            console.error(`API or file operation error for ${participants[j]}:`, error);
                        }
                    }

                } catch (err) {
                    console.error("Error with match data:", err.message)
                }
            }
            const leaderboard = await collection
                .find({})
                .sort({ snowballsHit: -1 })
                .toArray();
        } catch (err) {
            console.error("Error with match IDs:", err.message)
        }
    } catch(err) {
        console.error("Error connecting to DB:", err.message);
    } finally {
        await client.close();
        console.log("✅ Scraping complete");
    }
}


const [, , gameName, tagline, region, count] = process.argv;
scrape(gameName, tagline, region, count);