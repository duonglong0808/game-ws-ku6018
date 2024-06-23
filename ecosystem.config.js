module.exports = {
  apps: [
    {
      name: 'game-ws-ku6018',
      script: 'dist/main.js',
      // autorestart: true,
      // watch: ['dist'],
      instances: 1,
      env: {
        NODE_ENV: 'development',
        PORT: 8088,
      },
    },
  ],
};
