// pm2 进程配置：服务器上用 pm2 守护 Next.js，崩溃自动重启、开机自启
module.exports = {
  apps: [
    {
      name: "daily-ai",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      // 只监听本机，由 Nginx 对外提供 80/443
      args: "start -p 3000 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      max_memory_restart: "600M",
    },
  ],
};
