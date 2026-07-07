module.exports = {
  apps: [
    {
      name: 'front-quality',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      cwd: './',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
}
