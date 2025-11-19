{
  dockerTools,
  pkgs,
  site,
}:
dockerTools.buildLayeredImage {
  name = "sapphic-moe";
  tag = "latest";

  contents = [
    pkgs.nodejs_22
    pkgs.coreutils
    site
  ];

  config = {
    Cmd = [
      "${pkgs.nodejs_22}/bin/node"
      "${site}/dist/server/entry.mjs"
    ];
    Env = [
      "NODE_ENV=production"
      "NODE_PATH=${site}/node_modules"
      "ASTRO_TELEMETRY_DISABLED=1"
      "NPM_CONFIG_UPDATE_NOTIFIER=false"
    ];
    ExposedPorts = {
      "4321/tcp" = { };
    };
  };
}
