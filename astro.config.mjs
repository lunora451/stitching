// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  output: 'server',
  prefetch: {
    prefetchAll: true,
  },
  image: {
    responsiveStyles: true,
  },
});
