import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
// import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        // tailwindcss(),
        react(),
    ],
  server: {
   '/api': {
        target: 'http://localhost:8000', // your Laravel backend URL
        changeOrigin: true,
        secure: false,
        // optional: rewrite path if needed
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
});


// export default defineConfig({
//   server: {
//     host: '0.0.0.0', // ✅ Allow external devices (like your phone) to access
//     port: 3000,      // ✅ Default port for Vite

//     proxy: {
//       '/api': {
//         target: 'http://localhost:8000', // ✅ Laravel backend
//         changeOrigin: true,
//         secure: false,
//         // rewrite: (path) => path.replace(/^\/api/, ''), // Optional
//       },
//     },
//   },

//   plugins: [
//     laravel({
//       input: ['resources/css/app.css', 'resources/js/app.jsx'],
//       refresh: true,
//     }),
//     react(),
//   ],
// });



