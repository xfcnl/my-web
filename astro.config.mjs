// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mikufans1.dpdns.org',
  vite: {
    plugins: [tailwindcss()],
  },
});
