// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

export default defineConfig({
  output: 'server',

  prefetch: {
    prefetchAll: true,
  },

  image: {
    responsiveStyles: true,
  },

  adapter: netlify(),
});