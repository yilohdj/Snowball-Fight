"use client"

import { useState, useEffect } from "react"
import { Snowflake, ChevronRight, PlusCircle, Search, X, ChevronLeft, ChevronFirst, ChevronLast } from "lucide-react"
import Link from "next/link"

// Player type definition
type Player = {
  puuid: string
  name: string
  tagline: string
  snowballsHit: number
  profileIconId: number
  region : string
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage] = useState(100)

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
        setFilteredPlayers(sortedPlayers)
      } catch (err) {
        console.error("Error fetching players:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // Load sample data as fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Filter players based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlayers(players)
    } else {
      const filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPlayers(filtered)
    }
    // Reset to first page when search changes
    setCurrentPage(1)
  }, [searchQuery, players])

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPlayers.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex)

  // Function to generate u.gg URL
  const getUGGUrl = (player: Player) => {
    return `https://u.gg/lol/profile/${player.region}/${player.name}-${player.tagline}/overview`
  }

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)
  const goToPreviousPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)

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

      {/* Snowflakes */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {Array.from({ length: 20 }).map((_, i) => (
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
              <Snowflake size={Math.random() * 10 + 10} />
            </div>
          ))}
        </div>
      )}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header with esports style */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="relative text-5xl sm:text-6xl font-extrabold text-white mb-2 uppercase tracking-wider">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#87CEFA] to-[#E0FFFF]">
                Snowball Fight
              </span>
            </h1>
          </div>

          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#87CEFA]"></div>
            <div className="text-[#87CEFA]">
              <Snowflake size={20} />
            </div>
            <div className="h-[1px] w-16 bg-gradient-to-r from-[#87CEFA] to-transparent"></div>
          </div>

          <p className="text-[#87CEFA] max-w-2xl mx-auto text-lg">
            The ultimate display of skill on the Howling Abyss.
          </p>

          {/* Add Register Button */}
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 bg-[#1E5F7A] hover:bg-[#2A7090] text-white rounded-lg transition-colors shadow-lg hover:shadow-[0_0_15px_rgba(135,206,250,0.3)]"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Your Stats
            </Link>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-md max-w-2xl mx-auto border border-red-700">
              Error loading data: {error}.
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Decorative top corners */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#87CEFA]"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#87CEFA]"></div>

            {/* Main leaderboard */}
            <div className="bg-[#0A1A2F]/80 backdrop-blur-sm border border-[#1E3A5F] rounded-lg overflow-hidden shadow-[0_0_15px_rgba(135,206,250,0.2)]">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-[#0D2B4A] to-[#1E3A5F] p-4 border-b border-[#1E3A5F] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white text-left flex items-center gap-x-2">
                    <img src="poro.png" width="75px" height="100px" alt="Poro" />
                    <span>Leaderboard</span>
                  </h2>

                  <div className="flex items-center text-[#87CEFA] text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#87CEFA] mr-2 animate-pulse"></span>
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#87CEFA]/60" />
                    <input
                      type="text"
                      placeholder="Search by summoner name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#0A1A2F]/80 border border-[#1E3A5F] rounded-lg text-white placeholder-[#87CEFA]/60 focus:outline-none focus:border-[#87CEFA]/50 focus:ring-1 focus:ring-[#87CEFA]/20 transition-all duration-300"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#87CEFA]/60 hover:text-[#87CEFA] transition-colors duration-200"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <div className="mt-2 text-sm text-[#87CEFA]/80">
                      Found {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard content */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 rounded-full border-2 border-[#87CEFA]/30 border-t-[#87CEFA] animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPlayers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-[#87CEFA]/60 text-lg mb-2">
                          {searchQuery ? `No players found matching "${searchQuery}"` : "No players found"}
                        </div>
                        <div className="text-[#87CEFA]/40 text-sm">
                          {searchQuery ? "Try adjusting your search terms" : "Check back later for updates"}
                        </div>
                      </div>
                                          ) : (
                        currentPlayers.map((player, index) => {
                          const globalIndex = startIndex + index
                          return (
                          <Link
                            key={player.puuid || globalIndex}
                            href={getUGGUrl(player)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group block relative overflow-hidden rounded-lg transition-all duration-300
                              ${
                                globalIndex < 3
                                  ? "bg-gradient-to-r from-[#0D2B4A]/80 to-[#1E3A5F]/80 border border-[#87CEFA]/30"
                                  : "bg-[#0D2B4A]/50 border border-[#1E3A5F]/50 hover:border-[#87CEFA]/30"
                              } hover:shadow-[0_0_20px_rgba(135,206,250,0.15)]`}
                          >
                        {/* Hover indicator */}
                        <div className="absolute inset-y-0 right-0 w-1 bg-[#87CEFA]/0 group-hover:bg-[#87CEFA]/70 transition-colors duration-300"></div>

                        <div className="flex items-center p-4 relative z-10">
                                                     {/* Rank indicator */}
                           <div
                             className={`
                             ${
                               globalIndex === 0
                                 ? "bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/50 text-[#FFD700] border-[#FFD700]"
                                 : globalIndex === 1
                                   ? "bg-gradient-to-br from-[#C0C0C0]/20 to-[#C0C0C0]/50 text-[#C0C0C0] border-[#C0C0C0]"
                                   : globalIndex === 2
                                     ? "bg-gradient-to-br from-[#CD7F32]/20 to-[#CD7F32]/50 text-[#CD7F32] border-[#CD7F32]"
                                     : "bg-gradient-to-br from-[#1E3A5F]/50 to-[#1E3A5F] text-[#87CEFA] border-[#1E3A5F]"
                             }
                             w-10 h-10 rounded-md flex items-center justify-center font-bold mr-4 shrink-0
                             border shadow-[0_0_10px_rgba(135,206,250,0.1)]
                           `}
                           >
                             {globalIndex + 1}
                           </div>

                          {/* Profile icon with stylized border */}
                          <div className="relative h-12 w-12 rounded-full mr-4 shrink-0 border-2 border-[#1E3A5F] overflow-hidden group-hover:border-[#87CEFA]/50 transition-colors duration-300">
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

                          {/* Player info */}
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-x-2">
                              <h3 className="font-bold text-white text-lg group-hover:text-[#87CEFA] transition-colors duration-300">
                                {player.name}
                              </h3>
                              <p className="text-sm text-[#87CEFA]/80 bg-[#1E3A5F]/50 px-2 py-0.5 rounded-sm inline-flex items-center">
                                <span className="text-xs mr-1">#</span>
                                {player.tagline}
                              </p>
                            </div>
                          </div>

                          {/* Snowball score with esports styling */}
                          <div className="text-right flex flex-col items-end mr-2">
                            <div className="text-2xl font-bold text-white">{player.snowballsHit.toLocaleString()}</div>
                            <div className="text-xs text-[#87CEFA]/80 flex items-center">
                              <Snowflake className="mr-1 h-3 w-3" />
                              <span>Snowballs Hit</span>
                            </div>
                          </div>

                          {/* Arrow indicator for clickable card */}
                          <ChevronRight className="h-5 w-5 text-[#87CEFA]/0 group-hover:text-[#87CEFA]/70 transition-all duration-300 transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Pagination Navigation */}
                {totalPages > 1 && (
                  <div className="mt-8 p-4 bg-[#0A1A2F]/60 border-t border-[#1E3A5F]">
                    <div className="flex items-center justify-between">
                      {/* Page info */}
                      <div className="text-sm text-[#87CEFA]/80">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredPlayers.length)} of {filteredPlayers.length} players
                      </div>

                      {/* Navigation controls */}
                      <div className="flex items-center gap-2">
                        {/* First page */}
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-[#1E3A5F]/50 border border-[#1E3A5F] text-[#87CEFA] hover:bg-[#1E3A5F] hover:border-[#87CEFA]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronFirst className="h-4 w-4" />
                        </button>

                        {/* Previous page */}
                        <button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-[#1E3A5F]/50 border border-[#1E3A5F] text-[#87CEFA] hover:bg-[#1E3A5F] hover:border-[#87CEFA]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                                  currentPage === pageNum
                                    ? "bg-[#87CEFA] text-[#0A1A2F] border-[#87CEFA]"
                                    : "bg-[#1E3A5F]/50 text-[#87CEFA] border-[#1E3A5F] hover:bg-[#1E3A5F] hover:border-[#87CEFA]/50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        {/* Next page */}
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-[#1E3A5F]/50 border border-[#1E3A5F] text-[#87CEFA] hover:bg-[#1E3A5F] hover:border-[#87CEFA]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Last page */}
                        <button
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-[#1E3A5F]/50 border border-[#1E3A5F] text-[#87CEFA] hover:bg-[#1E3A5F] hover:border-[#87CEFA]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronLast className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nordic rune decorative footer */}
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-[#1E3A5F] to-[#87CEFA]/30"></div>
                    <div className="text-[#87CEFA]/50 rotate-45">❄</div>
                    <div className="text-[#87CEFA]/70">❄</div>
                    <div className="text-[#87CEFA]/50 -rotate-45">❄</div>
                    <div className="h-[1px] w-16 bg-gradient-to-r from-[#87CEFA]/30 to-[#1E3A5F]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative bottom corners */}
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#87CEFA]"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#87CEFA]"></div>
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

