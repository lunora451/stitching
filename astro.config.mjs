// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
  }),

  prefetch: {
    prefetchAll: true,
  },

  image: {
    responsiveStyles: true,
  },
});
