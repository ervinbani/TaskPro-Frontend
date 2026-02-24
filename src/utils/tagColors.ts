// Predefined color schemes for tags
const TAG_COLORS = [
  { bg: "#FEE2E2", color: "#DC2626", bgDark: "#7F1D1D", colorDark: "#FCA5A5" }, // Red
  { bg: "#DBEAFE", color: "#2563EB", bgDark: "#1E3A8A", colorDark: "#93C5FD" }, // Blue
  { bg: "#D1FAE5", color: "#059669", bgDark: "#064E3B", colorDark: "#6EE7B7" }, // Green
  { bg: "#FEF3C7", color: "#D97706", bgDark: "#78350F", colorDark: "#FCD34D" }, // Yellow
  { bg: "#E0E7FF", color: "#4338CA", bgDark: "#312E81", colorDark: "#C7D2FE" }, // Indigo
  { bg: "#FCE7F3", color: "#BE185D", bgDark: "#831843", colorDark: "#F9A8D4" }, // Pink
  { bg: "#CCFBF1", color: "#0F766E", bgDark: "#134E4A", colorDark: "#5EEAD4" }, // Teal
  { bg: "#FAE8FF", color: "#A21CAF", bgDark: "#701A75", colorDark: "#E879F9" }, // Fuchsia
  { bg: "#FEF9C3", color: "#CA8A04", bgDark: "#713F12", colorDark: "#FDE047" }, // Amber
  { bg: "#DCFCE7", color: "#16A34A", bgDark: "#14532D", colorDark: "#86EFAC" }, // Lime
];

/**
 * Generate a consistent color scheme for a tag based on its name
 * Uses a simple hash function to ensure the same tag always gets the same color
 */
export const getTagColor = (tagName: string) => {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Get absolute value and map to color index
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

/**
 * Get inline styles for a tag with the appropriate color scheme
 */
export const getTagStyles = (tagName: string, isDarkMode: boolean = false) => {
  const colors = getTagColor(tagName);
  return {
    backgroundColor: isDarkMode ? colors.bgDark : colors.bg,
    color: isDarkMode ? colors.colorDark : colors.color,
  };
};
