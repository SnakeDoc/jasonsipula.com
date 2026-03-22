// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://jasonsipula.com",
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
          content: {
            type: "text",
            value: " (opens in new tab)",
          },
          contentProperties: {
            className: "sr-only",
          },
        },
      ],
    ],
  },
});
