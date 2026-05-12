import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path: "/claimgame/" when building for GitHub Pages, "/" otherwise.
// Local `npm run dev` is unaffected.
const isPages = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GITHUB_PAGES === "true";

export default defineConfig({
  plugins: [react()],
  base: isPages ? "/claimgame/" : "/",
});
