{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { nixpkgs, ... }:
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
            flyctl
            turso-cli
          ];
        }
      );

      packages = forSystems (
        pkgs:
        let
          site = pkgs.callPackage ./site.nix { };
          container = pkgs.callPackage ./container.nix { inherit pkgs site; };
        in
        {
          inherit site container;
          default = site;
        }
      );
    };
}
