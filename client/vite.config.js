import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   port: 8000, // 👈 change this to the port you want
  //   host: "0.0.0.0", // optional: allows access from mobile devices in same network
  // },
})
