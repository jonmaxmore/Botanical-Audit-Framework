// vue.config.js

module.exports = {
  // ...existing code...
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // ...existing code...
};
