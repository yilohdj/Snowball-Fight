"use client"

import { useState, useEffect } from "react"
import { Snowflake } from 'lucide-react'
import Image from "next/image"

// Player type definition
type Player = {
  puuid: string
  name: string
  tagline: string
  snowballsHit: number
  profileIconId: number
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Fetch players data from the API
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load players data');
        }
        
        const data = await response.json();
        
        // Sort players by score (highest first)
        const sortedPlayers = [...data].sort((a, b) => b.snowballsHit - a.snowballsHit);
        setPlayers(sortedPlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Load sample data as fallback
        const sampleData: Player[] = [
          {
            puuid: "1",
            name: "FrostyChampion",
            tagline: "Winter is my playground",
            snowballsHit: 9850,
            profileIconId: 1,
          },
          {
            puuid: "1",
            name: "IceQueen",
            tagline: "Freezing the competition",
            snowballsHit: 8720,
            profileIconId: 1,
          },
          {
            puuid: "1",
            name: "SnowDrifter",
            tagline: "Drifting through the ranks",
            snowballsHit: 7650,
            profileIconId: 1,
          },
        ];
        setPlayers(sampleData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayers();
  }, []);

  // Function to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        if (Array.isArray(jsonData)) {
          setPlayers(jsonData.sort((a, b) => b.score - a.score))
        } else {
          alert("The JSON file must contain an array of player objects")
        }
      } catch (error) {
        alert("Error parsing JSON file")
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 relative overflow-hidden">
      {isClient && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute text-blue-100 animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDuration: `${Math.random() * 10 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              <Snowflake size={20} />
            </div>
          ))}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Snowball Fight</h1>
          <p className="text-blue-700 max-w-2xl mx-auto">
            The ultimate display of Aram skill!
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md max-w-2xl mx-auto">
              Error loading data: {error}. Using sample data instead.
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm border border-blue-100 shadow-xl rounded-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                <Snowflake className="mr-2 h-6 w-6 text-blue-500" />
                Leaderboard
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {players.map((player, index) => (
                    <div key={index} className="flex items-center p-4 rounded-lg border border-blue-50 hover:bg-blue-50/50 transition-all">
                      <div className={`${
                        index === 0 ? "bg-yellow-400" : 
                        index === 1 ? "bg-gray-300" : 
                        index === 2 ? "bg-amber-600" : 
                        "bg-blue-200"
                      } w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 shrink-0`}>
                        {index + 1}
                      </div>
                      
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-blue-200 mr-4 shrink-0">
                        <Image 
                          src={"https://ddragon.leagueoflegends.com/cdn/15.5.1/img/profileicon/" + player.profileIconId + ".png"} 
                          alt={`${player.name}'s profile`} 
                          width={48} 
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center flex-wrap gap-x-2">
                          <h3 className="font-bold text-blue-900">{player.name}</h3>
                          <p className="text-sm text-blue-600"> {"#" + player.tagline}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-800">{player.snowballsHit.toLocaleString()}</div>
                        <div className="text-xs text-blue-500">Snowballs Hit</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}