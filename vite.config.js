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
                portfolio: resolve(__dirname, 'portfolio/index.html'),
                portfolio_es: resolve(__dirname, 'portfolio/es/index.html'),
                en: resolve(__dirname, 'en/index.html'),
                bento_test: resolve(__dirname, 'bento-test.html'),
            },
        },
    },
});
