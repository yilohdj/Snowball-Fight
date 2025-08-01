"use client"

import React, { useState} from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from "next/link"

// Define regions for the dropdown - now with expanded list
const REGIONS = [
  { value: "na1", label: "North America" },
  { value: "euw1", label: "Europe West" },
  { value: "eun1", label: "Europe Nordic & East" },
  { value: "kr", label: "Korea" },
  { value: "jp1", label: "Japan" },
  { value: "br1", label: "Brazil" },
  { value: "la1", label: "Latin America North" },
  { value: "la2", label: "Latin America South" },
  { value: "oc1", label: "Oceania" },
  { value: "tr1", label: "Turkey" },
  { value: "ru", label: "Russia" },
  { value: "me1", label: "Middle East" },
  { value: "sg2", label: "Singapore" },
  { value: "tw2", label: "Taiwan" },
  { value: "vn2", label: "Vietnam" },
]

export default function RegisterPage() {
  const router = useRouter()
  
  // Form state - using a single object for form data
  const [formData, setFormData] = useState({
    summonerName: "",
    tagLine: "",
    region: "na1"
  })
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Call the API route
      const response = await fetch("/api/register-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limit errors specifically
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
        }
        throw new Error(data.error || "Failed to register player")
      }

      // Show success message
      setSuccess(true)
      
      // Optional: Redirect after success
      setTimeout(() => {
        router.push("/")
      }, 3000)
      
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#0D2B4A] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "30px 30px"}}></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center text-[#87CEFA] hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leaderboard
          </Link>

          <div className="relative">
            {/* Decorative top corners */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#87CEFA]"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#87CEFA]"></div>
            
            <div className="bg-[#0A1A2F]/80 backdrop-blur-sm border border-[#1E3A5F] rounded-lg overflow-hidden shadow-[0_0_15px_rgba(135,206,250,0.2)]">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white flex items-center justify-center">
                    Add or Update Stats
                  </h1>
                  <p className="text-[#87CEFA] mt-2">
                    Enter your name and tagline to add/update information.
                  </p>
                </div>

                {success ? (
                  <div className="bg-[#1E3A5F] border border-[#87CEFA]/30 text-[#87CEFA] px-4 py-3 rounded relative mb-4">
                    <p>
                      <strong>Success!</strong> Redirecting you back...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-red-900/50 border border-red-700/50 text-red-200 px-4 py-3 rounded relative mb-4">
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="summonerName" className="block text-[#87CEFA] font-medium">
                          Summoner Name
                        </label>
                        <input
                          id="summonerName"
                          name="summonerName"
                          value={formData.summonerName}
                          onChange={handleChange}
                          placeholder="Your in-game name"
                          className="w-full px-3 py-2 bg-[#1E3A5F]/50 border border-[#1E3A5F] rounded-md text-white placeholder-[#87CEFA]/50 focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="tagLine" className="block text-[#87CEFA] font-medium">
                          Tag Line
                        </label>
                        <input
                          id="tagLine"
                          name="tagLine"
                          value={formData.tagLine}
                          onChange={handleChange}
                          placeholder="Your tag (e.g. NA1)"
                          className="w-full px-3 py-2 bg-[#1E3A5F]/50 border border-[#1E3A5F] rounded-md text-white placeholder-[#87CEFA]/50 focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-transparent"
                        />
                        <p className="text-xs text-[#87CEFA]/70">
                          This is the part after the # in your Riot ID (e.g. YourName#<strong>NA1</strong>)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="region" className="block text-[#87CEFA] font-medium">
                          Region
                        </label>
                        <select
                          id="region"
                          name="region"
                          value={formData.region}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-[#1E3A5F]/50 border border-[#1E3A5F] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#87CEFA]/50 focus:border-transparent max-h-60 overflow-y-auto"
                        >
                          {REGIONS.map((region) => (
                            <option key={region.value} value={region.value}>
                              {region.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-[#1E5F7A] hover:bg-[#2A7090] text-white rounded-md transition-colors shadow-lg hover:shadow-[0_0_15px_rgba(135,206,250,0.3)] flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Add My Stats"
                        )}
                      </button>
                    </div>
                  </form>
                )}
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