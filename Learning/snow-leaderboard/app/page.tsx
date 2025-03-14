"use client"

import { useState, useEffect } from "react"
import { Snowflake, ChevronRight, PlusCircle } from "lucide-react"
import Link from "next/link"

// Player type definition
type Player = {
  puuid: string
  name: string
  tagline: string
  snowballsHit: number
  profileIconId: number
  region: string
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Fetch players data from the API
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/players")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to load players data")
        }

        const data = await response.json()

        // Sort players by score (highest first)
        const sortedPlayers = [...data].sort((a, b) => b.snowballsHit - a.snowballsHit)
        setPlayers(sortedPlayers)
      } catch (err) {
        console.error("Error fetching players:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // Load sample data as fallback
        const sampleData: Player[] = [
          {
            puuid: "1",
            name: "FrostyChampion",
            tagline: "NA1",
            snowballsHit: 9850,
            profileIconId: 5299,
            region: "na1",
          },
          {
            puuid: "2",
            name: "IceQueen",
            tagline: "NA1",
            snowballsHit: 8720,
            profileIconId: 4661,
            region: "na1",
          },
          {
            puuid: "3",
            name: "SnowDrifter",
            tagline: "NA1",
            snowballsHit: 7650,
            profileIconId: 4368,
            region: "na1",
          },
          {
            puuid: "4",
            name: "BlizzardKing",
            tagline: "NA1",
            snowballsHit: 6890,
            profileIconId: 5299,
            region: "na1",
          },
          {
            puuid: "5",
            name: "ArcticFox",
            tagline: "NA1",
            snowballsHit: 5720,
            profileIconId: 4661,
            region: "na1",
          },
        ]
        setPlayers(sampleData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Function to generate u.gg URL
  const getUGGUrl = (player: Player) => {
    return `https://u.gg/lol/profile/${player.region}/${player.name}-${player.tagline}/overview`
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#0D2B4A] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      {/* Snowflakes - reduced for mobile */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {Array.from({ length: isClient && window.innerWidth < 768 ? 10 : 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-[#87CEFA] animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDuration: `${Math.random() * 10 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            >
              <Snowflake
                size={Math.random() * (window.innerWidth < 768 ? 8 : 10) + (window.innerWidth < 768 ? 6 : 10)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="container mx-auto px-4 py-6 md:py-12 relative z-10">
        {/* Header with esports style */}
        <div className="text-center mb-8 md:mb-12">
          <div className="relative inline-block">
            <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 uppercase tracking-wider">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#87CEFA] to-[#E0FFFF]">
                Snowball Fight
              </span>
            </h1>
          </div>

          <div className="flex justify-center items-center gap-2 mb-3 md:mb-4">
            <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-transparent to-[#87CEFA]"></div>
            <div className="text-[#87CEFA]">
              <Snowflake size={16} className="md:w-5 md:h-5" />
            </div>
            <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-[#87CEFA] to-transparent"></div>
          </div>

          <p className="text-[#87CEFA] max-w-2xl mx-auto text-base md:text-lg px-2">
            The ultimate display of skill on the Howling Abyss.
          </p>

          {/* Add Register Button */}
          <div className="mt-4 md:mt-6">
            <Link
              href="/register"
              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-[#1E5F7A] hover:bg-[#2A7090] text-white rounded-lg transition-colors shadow-lg hover:shadow-[0_0_15px_rgba(135,206,250,0.3)]"
            >
              <PlusCircle className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
              Add Your Stats
            </Link>
          </div>

          {error && (
            <div className="mt-4 p-2 md:p-3 bg-red-900/50 text-red-200 rounded-md max-w-2xl mx-auto border border-red-700 text-sm md:text-base">
              Error loading data: {error}. Using sample data instead.
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Decorative top corners */}
            <div className="absolute -top-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-[#87CEFA]"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-t-2 border-r-2 border-[#87CEFA]"></div>

            {/* Main leaderboard */}
            <div className="bg-[#0A1A2F]/80 backdrop-blur-sm border border-[#1E3A5F] rounded-lg overflow-hidden shadow-[0_0_15px_rgba(135,206,250,0.2)]">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-[#0D2B4A] to-[#1E3A5F] p-3 md:p-4 border-b border-[#1E3A5F] relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold text-white text-left flex items-center gap-x-2">
                    <img src="poro.png" width="50" height="67" className="w-[50px] h-auto md:w-[75px]" alt="Poro" />
                    <span>Leaderboard</span>
                  </h2>

                  <div className="flex items-center text-[#87CEFA] text-xs md:text-sm">
                    <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#87CEFA] mr-1.5 md:mr-2 animate-pulse"></span>
                    <span>LIVE</span>
                  </div>
                </div>
              </div>

              {/* Leaderboard content */}
              <div className="p-3 md:p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#87CEFA]/30 border-t-[#87CEFA] animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {players.map((player, index) => (
                      <Link
                        key={index}
                        href={getUGGUrl(player)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group block relative overflow-hidden rounded-lg transition-all duration-300
                          ${
                            index < 3
                              ? "bg-gradient-to-r from-[#0D2B4A]/80 to-[#1E3A5F]/80 border border-[#87CEFA]/30"
                              : "bg-[#0D2B4A]/50 border border-[#1E3A5F]/50 hover:border-[#87CEFA]/30"
                          } hover:shadow-[0_0_20px_rgba(135,206,250,0.15)]`}
                      >
                        {/* Hover indicator */}
                        <div className="absolute inset-y-0 right-0 w-1 bg-[#87CEFA]/0 group-hover:bg-[#87CEFA]/70 transition-colors duration-300"></div>

                        <div className="flex flex-wrap md:flex-nowrap items-center p-2.5 md:p-4 relative z-10">
                          {/* Rank indicator */}
                          <div
                            className={`
                            ${
                              index === 0
                                ? "bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/50 text-[#FFD700] border-[#FFD700]"
                                : index === 1
                                  ? "bg-gradient-to-br from-[#C0C0C0]/20 to-[#C0C0C0]/50 text-[#C0C0C0] border-[#C0C0C0]"
                                  : index === 2
                                    ? "bg-gradient-to-br from-[#CD7F32]/20 to-[#CD7F32]/50 text-[#CD7F32] border-[#CD7F32]"
                                    : "bg-gradient-to-br from-[#1E3A5F]/50 to-[#1E3A5F] text-[#87CEFA] border-[#1E3A5F]"
                            }
                            w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center font-bold mr-2.5 md:mr-4 shrink-0
                            border shadow-[0_0_10px_rgba(135,206,250,0.1)]
                          `}
                          >
                            {index + 1}
                          </div>

                          {/* Profile icon with stylized border */}
                          <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full mr-2.5 md:mr-4 shrink-0 border-2 border-[#1E3A5F] overflow-hidden group-hover:border-[#87CEFA]/50 transition-colors duration-300">
                            {/* Profile image */}
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.5.1/img/profileicon/${player.profileIconId}.png`}
                              alt={`${player.name}'s profile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://ddragon.leagueoflegends.com/cdn/15.5.1/img/profileicon/1.png"
                              }}
                            />
                          </div>

                          {/* Player info and score - restructured for mobile */}
                          <div className="flex flex-grow justify-between items-center w-full md:w-auto mt-2 md:mt-0">
                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-x-2">
                                <h3 className="font-bold text-white text-base md:text-lg group-hover:text-[#87CEFA] transition-colors duration-300 truncate max-w-[120px] md:max-w-none">
                                  {player.name}
                                </h3>
                                <p className="text-xs md:text-sm text-[#87CEFA]/80 bg-[#1E3A5F]/50 px-1.5 py-0.5 rounded-sm inline-flex items-center w-fit">
                                  <span className="text-xs mr-1">#</span>
                                  {player.tagline}
                                </p>
                              </div>
                            </div>

                            {/* Snowball score with esports styling */}
                            <div className="text-right flex flex-col items-end mr-1 md:mr-2">
                              <div className="text-xl md:text-2xl font-bold text-white">
                                {player.snowballsHit.toLocaleString()}
                              </div>
                              <div className="text-[10px] md:text-xs text-[#87CEFA]/80 flex items-center whitespace-nowrap">
                                <Snowflake className="mr-0.5 md:mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span>Snowballs Hit</span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow indicator for clickable card */}
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#87CEFA]/0 group-hover:text-[#87CEFA]/70 transition-all duration-300 transform group-hover:translate-x-1 ml-1 md:ml-0 shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Nordic rune decorative footer */}
                <div className="mt-6 md:mt-8 flex justify-center">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-[#1E3A5F] to-[#87CEFA]/30"></div>
                    <div className="text-[#87CEFA]/50 rotate-45 text-sm md:text-base">❄</div>
                    <div className="text-[#87CEFA]/70 text-sm md:text-base">❄</div>
                    <div className="text-[#87CEFA]/50 -rotate-45 text-sm md:text-base">❄</div>
                    <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-[#87CEFA]/30 to-[#1E3A5F]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative bottom corners */}
            <div className="absolute -bottom-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-b-2 border-l-2 border-[#87CEFA]"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-[#87CEFA]"></div>
          </div>
        </div>
      </div>

      {/* Add the fall animation */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </main>
  )
}

