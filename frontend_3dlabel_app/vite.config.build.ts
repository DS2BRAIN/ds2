const { defineConfig, mergeConfig } = require('vite');
const baseConfig = require('./vite.config');

// https://vitejs.dev/config/
module.exports = mergeConfig(baseConfig, {
    base: '/tool/pc/',
    build: {
        outDir: '../dist/pc-tool',
    },
});
