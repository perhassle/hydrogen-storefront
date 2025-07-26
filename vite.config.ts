import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import {fileURLToPath, URL} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    hydrogen(),
    oxygen(),
    tsconfigPaths(),
    {
      name: 'copy-manifest-and-assets',
      writeBundle() {
        // Copy manifest.json and assets to client/.vite/ and server/.vite/ for React Router SSR
        
        // Copy manifest files
        const manifestPath = path.resolve(__dirname, 'dist', '.vite', 'manifest.json');
        
        // Copy to client directory
        const clientTargetDir = path.resolve(__dirname, 'dist', 'client', '.vite');
        const clientTargetPath = path.resolve(clientTargetDir, 'manifest.json');
        
        // Copy to server directory
        const serverTargetDir = path.resolve(__dirname, 'dist', 'server', '.vite');
        const serverTargetPath = path.resolve(serverTargetDir, 'manifest.json');
        
        if (fs.existsSync(manifestPath)) {
          // Create client directory and copy
          fs.mkdirSync(clientTargetDir, { recursive: true });
          fs.copyFileSync(manifestPath, clientTargetPath);
          
          // Create server directory and copy
          fs.mkdirSync(serverTargetDir, { recursive: true });
          fs.copyFileSync(manifestPath, serverTargetPath);
        }
        
        // Copy assets to server directory
        const assetsDir = path.resolve(__dirname, 'dist', 'assets');
        const serverAssetsDir = path.resolve(__dirname, 'dist', 'server', 'assets');
        
        if (fs.existsSync(assetsDir)) {
          // Copy entire assets directory to server
          const copyDir = (src: string, dest: string) => {
            fs.mkdirSync(dest, { recursive: true });
            const entries = fs.readdirSync(src, { withFileTypes: true });
            
            for (const entry of entries) {
              const srcPath = path.join(src, entry.name);
              const destPath = path.join(dest, entry.name);
              
              if (entry.isDirectory()) {
                copyDir(srcPath, destPath);
              } else {
                fs.copyFileSync(srcPath, destPath);
              }
            }
          };
          
          copyDir(assetsDir, serverAssetsDir);
        }
      }
    }
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [],
    },
  },
});
