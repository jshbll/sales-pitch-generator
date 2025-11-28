import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// React Compiler configuration
const ReactCompilerConfig = {
  // Target React 18+ features
  target: '18',
  
  // Enable source maps for debugging and skip problematic files
  sources: (filename: string) => {
    // Skip node_modules
    if (filename.indexOf('node_modules') !== -1) {
      return false;
    }
    
    // Skip files that have known issues with the compiler
    const problematicFiles = [
      'AuthContext.tsx', // Has try/finally blocks and dynamic imports
      'ImageMigrationContext.tsx', // May have complex patterns
      'OnboardingContext.tsx' // May have complex patterns
    ];
    
    for (const problematicFile of problematicFiles) {
      if (filename.includes(problematicFile)) {
        return false;
      }
    }
    
    return true;
  },
  
  // Optimization settings
  compilationMode: 'infer', // automatic detection
  
  // Be more tolerant of errors and skip compilation for problematic components
  panicThreshold: 'none', // Don't panic, just skip problematic files
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['babel-plugin-react-compiler', ReactCompilerConfig]
        ],
      },
    }),
  ],
  root: process.cwd(),
  envDir: process.cwd(), // Read .env files from the current working directory
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '~': path.resolve(process.cwd())
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html')
    }
  },
  base: '/'
})
