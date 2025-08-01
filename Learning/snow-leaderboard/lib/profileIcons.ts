// Profile icon utility for handling local icons
// We have 4,727 local icons ranging from 0 to 10005

/**
 * Get the profile icon source path
 * @param profileIconId - The profile icon ID from Riot API
 * @returns Local path if available, otherwise external URL
 */
export function getProfileIconSrc(profileIconId: number): string {
  // Check if we have the icon locally (we have most icons 0-10005)
  if (profileIconId >= 0 && profileIconId <= 10005) {
    return `/profile-icons/${profileIconId}.png`;
  }
  
  // Fallback to external URL for newer icons
  return `https://ddragon.leagueoflegends.com/cdn/15.5.1/img/profileicon/${profileIconId}.png`;
}

/**
 * Check if a profile icon is available locally
 * @param profileIconId - The profile icon ID
 * @returns True if the icon is available locally
 */
export function isLocalIcon(profileIconId: number): boolean {
  // We have most icons from 0 to 10005 locally
  return profileIconId >= 0 && profileIconId <= 10005;
}

/**
 * Get the default profile icon path (icon 1)
 * @returns Path to the default profile icon
 */
export function getDefaultProfileIcon(): string {
  return "/profile-icons/1.png";
}

/**
 * Get the total number of local icons available
 * @returns Number of local icons
 */
export function getLocalIconCount(): number {
  return 4727; // Total icons we have locally
}

/**
 * Get the range of local icon IDs
 * @returns Object with min and max icon IDs
 */
export function getLocalIconRange(): { min: number; max: number } {
  return { min: 0, max: 10005 };
} 