import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  // NEXT_PUBLIC_ is what Vercel's Supabase integration uses for the public
  // URL and anon key. Server-only secrets never use either prefix.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
