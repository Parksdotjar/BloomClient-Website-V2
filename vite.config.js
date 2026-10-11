import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8110",
      "/v1/account": "http://127.0.0.1:8110",
      "/v1/tickets": "http://127.0.0.1:8110",
      "/v1/owner": "http://127.0.0.1:8110",
      "/v1/social": "http://127.0.0.1:8110",
    },
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        changelog: resolve(__dirname, "changelog/index.html"),
        support: resolve(__dirname, "support/index.html"),
        tickets: resolve(__dirname, "tickets/index.html"),
        team: resolve(__dirname, "team/index.html"),
        community: resolve(__dirname, "community/index.html"),
        signin: resolve(__dirname, "signin/index.html"),
        connect: resolve(__dirname, "connect/index.html"),
        connected: resolve(__dirname, "connect/connected/index.html"),
        dashboard: resolve(__dirname, "dashboard/index.html"),
        owner: resolve(__dirname, "owner/index.html"),
        privacyPolicy: resolve(__dirname, "privacypolicy/index.html"),
        termsOfService: resolve(__dirname, "tos/index.html"),
      },
    },
  },
});
