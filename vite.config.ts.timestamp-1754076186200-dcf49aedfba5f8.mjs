// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Security headers for development
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.kucoin.com https://www.google.com; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
    },
    proxy: {
      "/kucoin-api": {
        target: "https://api.kucoin.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kucoin-api/, ""),
        secure: true,
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; CryptoApp/1.0)"
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    rollupOptions: {
      output: {
        // Security: Remove comments and optimize build
        compact: true,
        // Ensure assets have proper integrity
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    // Enable source maps for debugging but remove in production
    sourcemap: process.env.NODE_ENV !== "production"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIC8vIFNlY3VyaXR5IGhlYWRlcnMgZm9yIGRldmVsb3BtZW50XG4gICAgICAnWC1GcmFtZS1PcHRpb25zJzogJ0RFTlknLFxuICAgICAgJ1gtQ29udGVudC1UeXBlLU9wdGlvbnMnOiAnbm9zbmlmZicsXG4gICAgICAnWC1YU1MtUHJvdGVjdGlvbic6ICcxOyBtb2RlPWJsb2NrJyxcbiAgICAgICdSZWZlcnJlci1Qb2xpY3knOiAnc3RyaWN0LW9yaWdpbi13aGVuLWNyb3NzLW9yaWdpbicsXG4gICAgICAnUGVybWlzc2lvbnMtUG9saWN5JzogJ2NhbWVyYT0oKSwgbWljcm9waG9uZT0oKSwgZ2VvbG9jYXRpb249KCksIHBheW1lbnQ9KCksIHVzYj0oKSwgbWFnbmV0b21ldGVyPSgpLCBneXJvc2NvcGU9KCksIGFjY2VsZXJvbWV0ZXI9KCknLFxuICAgICAgJ1N0cmljdC1UcmFuc3BvcnQtU2VjdXJpdHknOiAnbWF4LWFnZT0zMTUzNjAwMDsgaW5jbHVkZVN1YkRvbWFpbnM7IHByZWxvYWQnLFxuICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JzogXCJkZWZhdWx0LXNyYyAnc2VsZic7IHNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnIGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20gaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb207IHN0eWxlLXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb207IGZvbnQtc3JjICdzZWxmJyBodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tOyBpbWctc3JjICdzZWxmJyBkYXRhOiBodHRwczo7IGNvbm5lY3Qtc3JjICdzZWxmJyBodHRwczovL2FwaS5rdWNvaW4uY29tIGh0dHBzOi8vd3d3Lmdvb2dsZS5jb207IGZyYW1lLXNyYyBodHRwczovL3d3dy5nb29nbGUuY29tOyBvYmplY3Qtc3JjICdub25lJzsgYmFzZS11cmkgJ3NlbGYnOyBmb3JtLWFjdGlvbiAnc2VsZic7XCJcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICAnL2t1Y29pbi1hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vYXBpLmt1Y29pbi5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9rdWNvaW4tYXBpLywgJycpLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICdVc2VyLUFnZW50JzogJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBDcnlwdG9BcHAvMS4wKSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gU2VjdXJpdHk6IFJlbW92ZSBjb21tZW50cyBhbmQgb3B0aW1pemUgYnVpbGRcbiAgICAgICAgY29tcGFjdDogdHJ1ZSxcbiAgICAgICAgLy8gRW5zdXJlIGFzc2V0cyBoYXZlIHByb3BlciBpbnRlZ3JpdHlcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJ1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmcgYnV0IHJlbW92ZSBpbiBwcm9kdWN0aW9uXG4gICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQSxJQUNOLFNBQVM7QUFBQTtBQUFBLE1BRVAsbUJBQW1CO0FBQUEsTUFDbkIsMEJBQTBCO0FBQUEsTUFDMUIsb0JBQW9CO0FBQUEsTUFDcEIsbUJBQW1CO0FBQUEsTUFDbkIsc0JBQXNCO0FBQUEsTUFDdEIsNkJBQTZCO0FBQUEsTUFDN0IsMkJBQTJCO0FBQUEsSUFDN0I7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxpQkFBaUIsRUFBRTtBQUFBLFFBQ25ELFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLFVBQVU7QUFBQSxVQUNWLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixTQUFTO0FBQUE7QUFBQSxRQUVULGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxXQUFXLFFBQVEsSUFBSSxhQUFhO0FBQUEsRUFDdEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
