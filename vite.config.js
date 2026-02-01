import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                system: resolve(__dirname, 'system.html'),
                nexus: resolve(__dirname, 'nexus.html'),
                particulas: resolve(__dirname, 'particulas.html'),
                portfolio: resolve(__dirname, 'public/portfolio/index.html'),
                portfolio_es: resolve(__dirname, 'public/portfolio/es/index.html'),
            },
        },
    },
});
