// Plantilla PM2 para el droplet. Ajustar `cwd` a la ruta real de despliegue.
// - "ebim-web": la app Next.js.
// - "ebim-agente-lusha": corre el agente 1 vez/día (autorestart:false + cron_restart = "ejecutar y salir" con PM2).
module.exports = {
  apps: [
    {
      name: "ebim-web",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
    {
      name: "ebim-agente-lusha",
      script: "npx",
      args: "tsx --env-file=.env scripts/run-agente-lusha.ts",
      cwd: __dirname,
      autorestart: false,
      cron_restart: "0 8 * * *",
    },
  ],
};
