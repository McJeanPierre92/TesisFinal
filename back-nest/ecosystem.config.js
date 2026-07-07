module.exports = {
  apps: [
    {
      name: 'back-quality',
      script: 'dist/main.js',
      cwd: './',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
}
