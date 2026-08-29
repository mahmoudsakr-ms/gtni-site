module.exports = {
  apps: [
    {
      name: "gtni",

      cwd: "/var/www/gtni",

      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",

      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      restart_delay: 5000,

      watch: false,

      max_memory_restart: "2G",

      min_uptime: "30s",
      max_restarts: 10,

      kill_timeout: 5000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      error_file: "/var/log/pm2/gtni-error.log",
      out_file: "/var/log/pm2/gtni-out.log",
      log_file: "/var/log/pm2/gtni-combined.log",
      time: true,
    },
  ],
};
