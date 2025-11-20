{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    {
      nixpkgs,
      ...
    }@inputs:
    let
      forSystems =
        fn:
        nixpkgs.lib.genAttrs [
          "aarch64-linux"
          "aarch64-darwin"
          "x86_64-darwin"
          "x86_64-linux"
        ] (system: fn nixpkgs.legacyPackages.${system});
      defaultForSystems =
        fn:
        forSystems (pkgs: {
          default = fn pkgs;
        });
    in
    {
      devShells = defaultForSystems (
        pkgs:
        with pkgs;
        mkShellNoCC {
          packages = [
            nodejs
            pnpm
            cachix
            turso-cli
          ];
        }
      );

      packages = forSystems (
        pkgs:
        let
          # Pure environment variables with defaults
          # These will be used for deterministic builds
          buildEnv = {
            PUBLIC_TURNSTILE_SITE_KEY = "";
            TURNSTILE_SECRET_TOKEN = "";
            OWM_API_KEY = "";
            LASTFM_API_KEY = "";
            ASTRO_DB_REMOTE_URL = "";
            ASTRO_DB_APP_TOKEN = "";
            ASTRO_DB_GUESTBOOK_DASHBOARD_URL = "";
            DISCORD_CONTACT_WEBHOOK_URL = "";
            DISCORD_GUESTBOOK_WEBHOOK_URL = "";
            DISCORD_USER_ID = "";
            LANYARD_API_URL = "";
            COMMIT_HASH = "unknown";
            COMMIT_DATE = "unknown";
          };
          site = pkgs.callPackage ./site.nix { inherit buildEnv; };
          container = pkgs.callPackage ./container.nix {
            inherit pkgs site;
            commitHash = buildEnv.COMMIT_HASH;
            commitDate = buildEnv.COMMIT_DATE;
          };
        in
        {
          inherit site container;
          default = site;
        }
      );
    };
}
