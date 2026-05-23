// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare(),

  prefetch: {
    prefetchAll: true,
  },

  image: {
    responsiveStyles: true,
  },
});
