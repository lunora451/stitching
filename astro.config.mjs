// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  prefetch: {
    prefetchAll: true,
  },
  image: {
    responsiveStyles: true,
  },
});
