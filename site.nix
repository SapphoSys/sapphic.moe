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
