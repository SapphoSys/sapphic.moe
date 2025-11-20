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
            turso-cli
          ];
        }
      );

      packages = forSystems (
        pkgs:
        let
          # Build-time environment variables
          # Can be passed via --arg from CLI or read from environment
          buildEnv = {
            PUBLIC_TURNSTILE_SITE_KEY = builtins.getEnv "PUBLIC_TURNSTILE_SITE_KEY";
            TURNSTILE_SECRET_TOKEN = builtins.getEnv "TURNSTILE_SECRET_TOKEN";
            OWM_API_KEY = builtins.getEnv "OWM_API_KEY";
            LASTFM_API_KEY = builtins.getEnv "LASTFM_API_KEY";
            ASTRO_DB_REMOTE_URL = builtins.getEnv "ASTRO_DB_REMOTE_URL";
            ASTRO_DB_APP_TOKEN = builtins.getEnv "ASTRO_DB_APP_TOKEN";
            ASTRO_DB_GUESTBOOK_DASHBOARD_URL = builtins.getEnv "ASTRO_DB_GUESTBOOK_DASHBOARD_URL";
            DISCORD_CONTACT_WEBHOOK_URL = builtins.getEnv "DISCORD_CONTACT_WEBHOOK_URL";
            DISCORD_GUESTBOOK_WEBHOOK_URL = builtins.getEnv "DISCORD_GUESTBOOK_WEBHOOK_URL";
            DISCORD_USER_ID = builtins.getEnv "DISCORD_USER_ID";
            LANYARD_API_URL = builtins.getEnv "LANYARD_API_URL";
            COMMIT_HASH = builtins.getEnv "COMMIT_HASH";
            COMMIT_DATE = builtins.getEnv "COMMIT_DATE";
          };
          site = pkgs.callPackage ./site.nix { inherit buildEnv; };
          container = pkgs.callPackage ./container.nix { inherit pkgs site; };
        in
        {
          inherit site container;
          default = site;
        }
      );
    };
}
