{
  lib,
  stdenv,
  cacert,
  nodejs_22,
  pnpm,
  buildEnv ? { },
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

    # Export build-time environment variables
    ${lib.concatStringsSep "\n" (
      lib.mapAttrsToList (name: value: ''export ${name}="${value}"'') buildEnv
    )}

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
    cp -r node_modules $out/
    cp package.json $out/
    cp pnpm-lock.yaml $out/
  '';
})
