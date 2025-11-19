{
  dockerTools,
  site,
}:
dockerTools.buildLayeredImage {
  name = "sapphic-moe";
  tag = "latest";

  config = {
    Cmd = [
      "node"
      "${site}/dist/server/entry.mjs"
    ];
    Env = [
      "NODE_ENV=production"
      "ASTRO_TELEMETRY_DISABLED=1"
      "NPM_CONFIG_UPDATE_NOTIFIER=false"
    ];
    ExposedPorts = {
      "4321/tcp" = { };
    };
  };
}
