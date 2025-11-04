{
  description = "WhatsApp client service with Bun, Baileys, and Nix flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.bun pkgs.nodejs pkgs.git ];
          shellHook = ''
            echo "Bun and Node.js are available. Run 'bun --version' to verify."
          '';
        };
      }
    );
}
