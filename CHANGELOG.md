# Changelog

All notable changes to the Ubiquiti Network Dashboard card are documented in
this file.

## [1.0.2] - 2026-10-24

### Fixed

- Isolate card styles in a shadow root to prevent styling other dashboard cards.
- Refresh uplink load colors and endpoint indicators when throughput changes,
  without rebuilding device elements or losing keyboard focus.
- Follow Home Assistant's light/dark mode when `theme: auto` is configured.
- Update fallback device names when entity friendly names change.
- Improve narrow-card layouts, gateway label contrast, and client-count chips.

### Changed

- Coalesce connection redraws into one animation frame, skip hidden wires on
  compact cards, and cancel pending work when the card disconnects.
- Avoid replacing unchanged live metric text.
- Synchronize source and distribution versions from `package.json` during
  builds; validate committed distribution content and release-tag consistency.
- Add six regression tests and run them in GitHub Actions.

## [1.0.1] - 2026-08-17

### Fixed

- Fix a visual configuration editor bug.

## [1.0.0] - 2026-08-09

Initial public release.

### Added

- **Access point cards** with online status, model, live client count, and
  optional per-band client metrics (e.g. 2.4 GHz / 5 GHz).
- **Switch device view** showing configured ports with link status, PoE
  indicator, PoE power/budget summary, and optional link speed.
- **Optional internet gateway node** (router/USG/UDM) with WAN status,
  download/upload throughput, latency, WAN IP, and its own LAN ports.
- **Uplink wiring** between access points, switches, and the gateway, with
  automatic load-based coloring (green/yellow/red) when speed and
  throughput entities are configured, and a smart routing algorithm that
  keeps lines from crossing unrelated ports or switches.
- **Switch grouping** via `group`/`area`, with collapsible port views per
  switch.
- **Configurable switch width** (`width` / `width_mobile`) so switches can
  sit side by side on wide screens while stacking full-width on mobile.
- **Aggregate offline warning** in the card header as soon as any AP,
  switch, or the gateway goes offline.
- **Native Lovelace UI editor** for title, theme, access points, switches,
  ports, and uplinks — no YAML required, though YAML mode remains fully
  supported.
- **Automatic entity discovery** that scans existing Home Assistant
  entities for common UniFi naming patterns and suggests switches, ports,
  and access points to adopt into the configuration.
- Clicking any device or port opens its Home Assistant more-info dialog.
- Responsive layout built on Home Assistant theme variables, with no
  external dependencies.
- Full English UI and documentation.

[1.0.0]: https://github.com/404GamerNotFound/ha-ubiquiti-dashboard/releases/tag/v1.0.0
[1.0.1]: https://github.com/404GamerNotFound/ha-ubiquiti-dashboard/releases/tag/v1.0.1
[1.0.2]: https://github.com/404GamerNotFound/ha-ubiquiti-dashboard/releases/tag/v1.0.2
