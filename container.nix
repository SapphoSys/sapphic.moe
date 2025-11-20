{
  dockerTools,
  pkgs,
  site,
  commitHash ? "unknown",
  commitDate ? "unknown",
}:
dockerTools.buildLayeredImage {
  name = "sapphic-moe";
  tag = "latest";

  contents = [
    pkgs.nodejs_22
    pkgs.coreutils
    pkgs.cacert
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
      "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
      "ASTRO_TELEMETRY_DISABLED=1"
      "NPM_CONFIG_UPDATE_NOTIFIER=false"
      "COMMIT_HASH=${commitHash}"
      "COMMIT_DATE=${commitDate}"
    ];
    ExposedPorts = {
      "4321/tcp" = { };
    };
  };
}
