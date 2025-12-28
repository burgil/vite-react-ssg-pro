# generate_og_screenshots.py

This script generates missing OG images based on your running local server.

Prerequisites
- Python 3.10+
- Install dependencies:

```bash
pip install -r scripts/requirements.txt
playwright install
```

Usage

```bash
python scripts/generate_og_screenshots.py --host localhost --port 4173 --seo src/seo.json --out public
```

Options
- `--host`: Hostname (default: localhost)
- `--port`: Port that dev server is running (default: 4173)
- `--seo`: Path to `seo.json` (default: src/seo.json)
- `--out`: Output directory (default: public)
- `--overwrite`: Overwrite existing OG files (default: skip existing)
 - `--cleanup`: Delete unreferenced OG images (files under `public/images` with `og-` prefix).
 - `--dry-run`: When used with `--cleanup`, list files that would be deleted without deleting them.

How it works
- The script reads `src/seo.json` and looks for route entries that contain `ogImage`.
- If the referenced file doesn't exist under `public/` it will open the route using Playwright and capture a screenshot sized 1200x630.
- Screenshots are saved to the `ogImage` path defined in `src/seo.json` under `public/` as WebP images.
