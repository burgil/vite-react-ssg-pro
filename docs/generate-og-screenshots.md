# Generate OG Screenshots

This guide explains how to automatically generate Open Graph (OG) images for routes defined in `src/seo.json` using the `scripts/generate_og_screenshots.py` script.

## Overview

The script scans `src/seo.json` routes and creates missing screenshots for `ogImage` references. Screenshots are captured using Playwright (headless Chromium) at 1200x630 and saved as WebP images under `public/images/og/`.

The template also exposes a `pnpm og-screenshots` script to make running this easier. For a full local workflow (build + OG generation), run:

```bash
pnpm build && pnpm og-screenshots
```

## Prerequisites

- Python 3.10+
- Playwright installed
- Optional: You can run the script directly, or use the `pnpm og-screenshots` script which wraps the command.

## Install

```bash
# Install Node deps
pnpm install

# Install Python deps for OG generation
pip install -r scripts/requirements.txt
playwright install
```

> Tip: If you're on macOS or Linux, consider using a Python virtual environment.

## Quick Usage

Start the preview server (in a separate terminal):

```bash
pnpm preview
```

Then run the OG screenshot generator in another terminal:

```bash
# Using Python directly
python scripts/generate_og_screenshots.py --host localhost --port 4173 --seo src/seo.json --out public

# Or use the npm/pnpm script
pnpm og-screenshots
```

The `pnpm og-screenshots` script will generate missing screenshots and cleanup orphaned OG files by default (see `--cleanup` option).

## Options

- `--host`: Hostname (default: `localhost`)
- `--port`: Port that dev server is running (default: `4173`)
- `--seo`: Path to `seo.json` (default: `src/seo.json`)
- `--out`: Output directory (default: `public`)
- `--overwrite`: Overwrite existing images
- `--cleanup`: Delete unreferenced OG images in `public/images/og/` (default: skip)
- `--dry-run`: When used with `--cleanup`, displays files to delete without deleting

## Recommended Workflow

1. Start the preview server to ensure pages render the same as production:

```bash
pnpm preview
```

2. Run the OG screenshot generator to capture missing images:

```bash
pnpm og-screenshots
```

3. Build for production and verify everything looks good:

```bash
pnpm build
pnpm preview
# if everything looks good
pnpm build && pnpm og-screenshots  # local build + OG generation
```

## CI / Automation

For CI pipelines, you can run a headless build and OG generation step. Example:

```bash
pnpm install
pnpm build
python scripts/generate_og_screenshots.py --host 127.0.0.1 --port $PORT --seo src/seo.json --out public --overwrite
```

## Troubleshooting

- If Playwright cannot connect, ensure you've run `playwright install`.
- Increase timeout in `generate_og_screenshots.py` or run with `--overwrite` if your server takes more time to warm up.
- Use `--dry-run` when cleaning up or if you want to verify which screenshots will be deleted.

## See Also

- `scripts/generate_og_screenshots.py` - the implementation (scripts/README_generate_og.md has more detailed examples).

***

This guide supplements the `scripts/README_generate_og.md` file in the `template/scripts` folder and documents the command-line workflow for local development and CI automation.
