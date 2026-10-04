# Soundtool — Free Browser Audio Toolkit

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org)
[![License: MIT (code)](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Catalog: CC-BY-4.0](https://img.shields.io/badge/Catalog-CC--BY--4.0-green.svg)](LICENSE-data)
[![Tools](https://img.shields.io/badge/Tools-67-purple)](https://soundtool.tools)

**Official public archive for [Soundtool](https://soundtool.tools)** — a free, browser-based audio toolkit with 67 tools and 15 playable virtual instruments, available in 14 languages.

> ⚠️ **Important**: Soundtool is **not** open-source software. The web application itself is proprietary. This repository is an *archive*, not the product: it hosts the public tool catalog, the CLI, and edge-infrastructure snippets for reference. All processing runs 100% locally in the browser — audio files never leave the user's device.

## What's inside

| Path | What it is | License |
|---|---|---|
| [`cli/catalog/soundtool-tools.json`](cli/catalog/soundtool-tools.json) | Snapshot of the 67-tool public catalog (name / slug / description / category) | CC-BY-4.0 — attribution: link to https://soundtool.tools |
| [`cli/`](cli) | `soundtool` command-line tool: list, search, pick and open tools from the catalog | MIT |
| [`edge/`](edge) | Cloudflare Worker snippet: R2 model streaming with HTTP range support (serves the on-device AI models) | Provided for reference, no license granted |

## Install the CLI

```bash
pip install git+https://github.com/yangchangjiang/soundtool.git
```

## Usage

```bash
$ soundtool count
67 tools

$ soundtool search piano
  virtual-piano — Play a free virtual piano online...
  ...

$ soundtool random
  🎧 nightcore — Transform any song into nightcore...

  Soundtool — free browser audio tools → https://soundtool.tools
```

The CLI always prints the site link — every run spreads the word.

## The toolkit

67 tools across 7 categories — AI speech-to-text (Whisper), text-to-speech, voice cloning, stem separation (Demucs v4), noise removal, audio conversion, 8D audio, slowed reverb, and 15 virtual instruments. Everything runs on-device; no uploads, no signup, no watermarks. 14 languages.

**Site**: https://soundtool.tools

## Licenses

- Code (CLI): [MIT](LICENSE)
- Catalog data: [CC-BY-4.0](LICENSE-data) — attribution required, link back to https://soundtool.tools
- Edge snippets: provided for reference; no license granted. All rights reserved.
