const { defineConfig, mergeConfig } = require('vite');
const dns = require('dns');
const vue = require('@vitejs/plugin-vue');
const path = require('path');
const fs = require('fs');
dns.setDefaultResultOrder('verbatim');

let localConfig = getLocalConfig();
// https://vitejs.dev/config/
const config = defineConfig({
    server: {
        open: true,
        port: 13003,

          server: {
            origin: 'http://0.0.0.0:13002/'
          },
          // hmr: {
          //   host: 'localhost',
          // },
        // api proxy when development
        proxy: {
            '/api': {
                changeOrigin: true,
                target: 'http://0.0.0.0:13002',
            },
        },
    },
    plugins: [vue()],
    alias: [
        { find: 'pc-render', replacement: path.resolve(__dirname, './src/packages/pc-render') },
        { find: 'pc-editor', replacement: path.resolve(__dirname, './src/packages/pc-editor') },
    ],
});export default defineConfig({
    server: {
      hmr: {
        host: 'localhost',
      }
    }
});

module.exports = mergeConfig(config, localConfig);

function getLocalConfig() {
    let file = path.resolve(__dirname, './vite.config.local.js');
    let config = {};
    if (fs.existsSync(file)) {
        try {
            config = require(file);
        } catch (e) {}
    }
    return config;
}
