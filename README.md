# Obsidian CSS Inlay Colors

[![GitHub Release](https://img.shields.io/github/v/release/GRA0007/obsidian-css-inlay-colors?label=version)](https://github.com/GRA0007/obsidian-css-inlay-colors/releases)
[![Checks](https://img.shields.io/github/check-runs/GRA0007/obsidian-css-inlay-colors/main)](https://github.com/GRA0007/obsidian-css-inlay-colors/actions/workflows/checks.yml)
[![Obsidian](https://img.shields.io/badge/obsidian-plugin-8A5CF5?logo=obsidian)](https://obsidian.md)

Show inline color hints for CSS colors in Obsidian.

To use, just put any valid CSS color syntax in a code block like so: \`#8A5CF5\`.

<img src="example.jpg" alt="Example of the extension running for all CSS color formats" width="200">

Enable the color picker setting to change a color using a color picker in live preview mode. Note that the color picker does not support opacity, and will only let you select from sRGB colors. It will attempt to preserve the existing format you have written, as well as any existing opacity.

## Development

This project uses Biome and Yarn for linting/formatting and package management. Run `yarn dev` to build on changes.
