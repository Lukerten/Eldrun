{
  pkgs ? (let
    inherit (builtins) fetchTree fromJSON readFile;
    inherit ((fromJSON (readFile ./flake.lock)).nodes) nixpkgs;
  in
    import (fetchTree nixpkgs.locked) {}),
}:
pkgs.mkShell {
  hardeningDisable = ["all"];
  name = "Eldrun";
  buildInputs = with pkgs; [
    gnumake
    nodejs
    pnpm
    wrangler
  ];

  shellHook = "";
}
