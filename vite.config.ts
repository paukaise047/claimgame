import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path for GitHub Pages deployment under /claimgame/.
// Local dev (`npm run dev`) is unaffected.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/claimgame/" : "/",
});
