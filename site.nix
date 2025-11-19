{
  lib,
  stdenv,
  cacert,
  nodejs_22,
  pnpm,
}:
let
  fs = lib.fileset;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "sapphic-moe";
  version = "4";
  src = lib.cleanSource ./.;

  nativeBuildInputs = [
    nodejs_22
    pnpm
    cacert
  ];

  configurePhase = ''
    runHook preConfigure

    export HOME="$NIX_BUILD_TOP"
    export PNPM_HOME="$NIX_BUILD_TOP/.pnpm"
    export NODE_EXTRA_CA_CERTS="${cacert}/etc/ssl/certs/ca-bundle.crt"

    # Set required environment variables for build-time validation
    # These are overridden at runtime by the service
    export PUBLIC_TURNSTILE_SITE_KEY="placeholder"
    export TURNSTILE_SECRET_TOKEN="placeholder"
    export OWM_API_KEY="placeholder"
    export LASTFM_API_KEY="placeholder"
    export ASTRO_DB_REMOTE_URL="placeholder"
    export ASTRO_DB_APP_TOKEN="placeholder"
    export ASTRO_DB_GUESTBOOK_DASHBOARD_URL="placeholder"
    export DISCORD_CONTACT_WEBHOOK_URL="placeholder"
    export DISCORD_GUESTBOOK_WEBHOOK_URL="placeholder"
    export DISCORD_USER_ID="placeholder"
    export LANYARD_API_URL="placeholder"
    export COMMIT_HASH="unknown"
    export COMMIT_DATE="unknown"

    runHook postConfigure
  '';

  buildPhase = ''
    runHook preBuild

    pnpm install --frozen-lockfile
    pnpm run build

    runHook postBuild
  '';

  installPhase = ''
    mkdir -p $out
    cp -r dist $out/
  '';
})
