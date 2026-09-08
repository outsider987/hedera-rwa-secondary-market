import {renameSync} from 'node:fs';
import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({envDir:false,base:'./',plugins:[tailwindcss(),{name:'static-index',apply:'build',closeBundle(){renameSync('dist/showcase/showcase.html','dist/showcase/index.html');}}],build:{outDir:'dist/showcase',rollupOptions:{input:'showcase.html'}}});
