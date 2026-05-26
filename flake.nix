{
  description = "Sword – dev shell (Tauri 2 + Go + React)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    rust-overlay,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      overlays = [(import rust-overlay)];
      pkgs = import nixpkgs {inherit system overlays;};

      # Tauri 2 needs webkit2gtk 4.1 (not 4.0).
      # The rust toolchain version doesn't matter much; stable is fine.
      rust = pkgs.rust-bin.stable.latest.default.override {
        extensions = ["rust-src" "rust-analyzer"];
      };
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [
          # ── languages ───────────────────────────────────────────────────
          go_1_24
          rust
          nodejs_22 # npm is bundled with Node

          # ── Tauri 2 build deps (Linux) ───────────────────────────────
          pkg-config
          openssl
          glib
          gtk3
          webkitgtk_4_1 # Tauri 2 requires 4.1, not 4.0
          librsvg
          libsoup_3 # Tauri 2 uses libsoup 3
          libayatana-appindicator
          xdg-utils

          # ── misc tooling ─────────────────────────────────────────────
          curl
          wget
          file # `file` binary used by Tauri bundler
        ];

        # pkg-config needs to find webkit2gtk-4.1 and openssl
        shellHook = ''
          export PKG_CONFIG_PATH="${pkgs.webkitgtk_4_1.dev}/lib/pkgconfig:${pkgs.openssl.dev}/lib/pkgconfig:${pkgs.gtk3.dev}/lib/pkgconfig:$PKG_CONFIG_PATH"
          export WEBKIT_DISABLE_COMPOSITING_MODE=1   # prevents blank windows on some compositors
          export WAYLAND_DISPLAY=${WAYLAND_DISPLAY: -wayland-0}
          export GDK_BACKEND=wayland
          echo "🗡  Sword dev shell ready"
          echo "   go run run.go        – build sidecar + launch tauri dev"
          echo "   go run run.go build  – build sidecar only"
          echo "   go run run.go check  – type-check only"
        '';
      };
    });
}
