module.exports = {
  apps: [
    {
      name: 'boraexpandir-api',
      script: './dist/index.js',
      cwd: '/home/ubuntu/BoraExpandirPlataforma/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '600M',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/home/ubuntu/logs/boraexpandir-api-error.log',
      out_file: '/home/ubuntu/logs/boraexpandir-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
