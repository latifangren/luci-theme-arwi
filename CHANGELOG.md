# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-25

### Added
- **Dark Mode Support:** Clean integration of dark mode settings with `:root` and default `[data-theme="dark"]` stylesheet variables.
- **Unified Syncing:** Synchronized standard LuCI `data-darkmode` attributes with `data-theme` variable on root document element (ensuring full compatibility with third-party app CSS).
- **Embedded Preference Mode inside Sidebar:** Re-routed theme/dark mode controls to a dedicated **Preferences** tab system within the custom floating navbar settings gear (`⚙`).
- **Accent Color Picker:** Users can customize their accent color from Blue (Default), Emerald, Purple, Amber, and Rose options, persisting selection in `localStorage`.
- **Keyboard Shortcut:** Toggle Dark Mode instantly using `Alt + D` globally.
- **Custom Assets Kustomization (Issue #10):** Add custom upload fields inside the Preferences tab to let users set their own custom logo, custom login page background, or custom admin dashboard background (stored locally via `localStorage` base64 cache).
- **UCI & Multi-Device Sync:** Leveraged UCI configuration backend `luci.arwi` on the router to securely save preferences (Navbar links, accent colors, theme darkmode, and external background URL pointers) across different browsers and devices (PC & mobile). Integrated size-based safety limit (<50KB) to shield router memory JFFS2 flash wear.

### Fixed
- **FOUC Prevention:** Moved the theme initialization script block into the `<head>` of both `header.ut` and `header.htm` templates to prevent light/dark screen flickering.
- **Sidebar Arrow Inversion (Issue #11):** Repositioned arrow default direction from LEFT to RIGHT in wide mode, and left in collapsed mode.
- **Custom HP Item Distortions (Issue #2 & #5):** Added auto center alignment and sizing logic for custom image paths/buttons in the bottom mobile nav.
- **Docker & Status Icon Collision (Issue #2):** Updated default Docker representation to stacks of containers rather than dashboard grid grids.
- **Scrollable Dropdowns (Issue #13):** Enabled multi-scrollbar scrolling overlays for large dropdown listings (e.g. Passwall proxy list selectors).
- **Main Wrapper Stretch & Hidden Buttons (Issue #9):** Limited firewall status tables and IPTables `<pre>` outputs to `max-width: 100%` and `overflow-x: auto` to prevent page button clipping.
