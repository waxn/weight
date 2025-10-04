import { ConvexClient } from "convex/browser";

// Get Convex URL from environment variables with fallback
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || 
                  import.meta.env.VITE_CONVEX_URL || 
                  'https://wooden-gazelle-79.convex.cloud'; // Fallback to your deployment URL

const convex = new ConvexClient(convexUrl);

export { convex };
