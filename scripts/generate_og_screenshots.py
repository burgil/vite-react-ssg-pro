#!/usr/bin/env python3
"""
generate_og_screenshots.py

Create OG images by taking screenshots of each route defined in seo.json.

Usage:
    python scripts/generate_og_screenshots.py --host localhost --port 4173 --seo seo.json

Requirements:
  pip install -r scripts/requirements.txt
  playwright install

What it does:
  - Reads `seo.json` and scans for entries that include `ogImage` (e.g. `/images/og/og-home.webp`).
  - Checks whether the referenced file exists in `public/`.
  - If missing, opens the route at `http://{host}:{port}{routePath}`, screenshots the viewport sized 1200x630, and saves as webp to the target path.

Notes:
    - Defaults to `localhost:4173` since a server is expected to be running.
  - Uses Playwright to render pages (headless), wait for network idle, and capture a screenshot.
"""
import argparse
import json
import os
import sys
import asyncio
import time
import threading
from pathlib import Path
from typing import Dict, Any

from PIL import Image
from playwright.async_api import async_playwright

# Shared event used to signal prompt threads to exit early on cancel
prompt_cancel_event = threading.Event()

# ANSI color codes
class Colors:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'


def parse_args():
    parser = argparse.ArgumentParser(description='Generate OG screenshots from routes in seo.json')
    parser.add_argument('--host', default='localhost', help='Local server host (default: localhost)')
    parser.add_argument('--port', default=4173, type=int, help='Local server port (default: 4173)')
    parser.add_argument('--cleanup', action='store_true', help='Delete orphaned OG images not referenced in seo.json')
    parser.add_argument('--dry-run', action='store_true', help='When used with --cleanup, list files that would be deleted without deleting')
    parser.add_argument('--seo', default='seo.json', help='Path to seo.json')
    parser.add_argument('--out', default='public', help='Output dir for images (default: public)')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite existing images')
    args = parser.parse_args()
    return args


def read_seo(seo_path: str) -> Dict[str, Any]:
    with open(seo_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def ensure_dir_for_file(filepath: Path):
    dirpath = filepath.parent
    if not dirpath.exists():
        dirpath.mkdir(parents=True, exist_ok=True)


async def capture_page_to_webp(page, url: str, dest_path: Path, viewport=(1200, 630), wait_time: float = 1.2):
    print(f"{Colors.CYAN}-> Navigating to{Colors.RESET} {url}")
    await page.set_viewport_size({'width': viewport[0], 'height': viewport[1]})
    response = await page.goto(url, wait_until='networkidle', timeout=30000)
    if response is None or not (200 <= response.status < 400):
        print(f"{Colors.YELLOW}[WARN] Warning: Received status {response.status if response else 'None'} for {url}{Colors.RESET}")
    # Wait a bit for dynamic content and animations to settle
    await asyncio.sleep(wait_time)
    tmp_png = dest_path.with_suffix('.png')
    await page.screenshot(path=str(tmp_png), type='png', full_page=False)
    # Convert to webp using Pillow
    img = Image.open(tmp_png)
    img.save(dest_path, 'WEBP', quality=90, method=6)
    tmp_png.unlink()
    print(f"{Colors.GREEN}[OK] Saved OG image to{Colors.RESET} {dest_path}")


async def generate_images(host: str, port: int, seo_path: str, out_dir: str, overwrite: bool):
    seo = read_seo(seo_path)
    base_url = f"http://{host}:{port}"
    # Collect routes: keys in seo that start with '/'
    routes = [k for k in seo.keys() if k.startswith('/')]
    
    # Start Playwright early and test server connectivity before prompting
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1200, 'height': 630})
        page = await context.new_page()
        # Test server connectivity before processing routes or prompting
        try:
            print(f"{Colors.BLUE}[TEST] Testing connection to {base_url}...{Colors.RESET}")
            response = await page.goto(base_url, wait_until='networkidle', timeout=10000)
            if response is None or response.status >= 500:
                print(f"\n{Colors.RED}{Colors.BRIGHT}[ERR] ERROR:{Colors.RESET} Server at {base_url} returned status {response.status if response else 'None'}")
                print(f"{Colors.YELLOW}Please ensure the preview server is running with: {Colors.CYAN}pnpm preview{Colors.RESET}")
                await browser.close()
                sys.exit(1)
            print(f"{Colors.GREEN}[OK] Server is running at {base_url}{Colors.RESET}\n")
        except Exception as e:
            print(f"\n{Colors.RED}{Colors.BRIGHT}[ERR] ERROR:{Colors.RESET} Cannot connect to server at {base_url}")
            print(f"{Colors.RED}Error: {e}{Colors.RESET}")
            print(f"\n{Colors.YELLOW}Please ensure the preview server is running in another terminal:{Colors.RESET}")
            print(f"  {Colors.BRIGHT}1.{Colors.RESET} Run: {Colors.CYAN}pnpm preview{Colors.RESET}")
            print(f"  {Colors.BRIGHT}2.{Colors.RESET} Wait for server to start on port {Colors.MAGENTA}{port}{Colors.RESET}")
            print(f"  {Colors.BRIGHT}3.{Colors.RESET} Run this script again\n")
            await browser.close()
            sys.exit(1)

        # Check if any existing images will be encountered
        if not overwrite:
            existing_count = 0
            for route in routes:
                if route == '':
                    continue
                config = seo.get(route, {})
                og_image = config.get('ogImage')
                if not og_image:
                    continue
                if og_image.startswith('/'):
                    dest_rel = og_image[1:]
                else:
                    dest_rel = og_image
                dest_path = Path(out_dir) / dest_rel
                # Only count existing files that are OG images (prefixed with 'og-')
                if dest_path.exists() and dest_path.name.lower().startswith('og-'):
                    existing_count += 1
            
            if existing_count > 0:
                # Prompt with a 10-second timeout that defaults to 'Y' (skip overwriting).
                prompt_text = f"{Colors.YELLOW}[?] Found {existing_count} existing OG image(s). Skip overwriting them? (Y/n):{Colors.RESET} "
                print(prompt_text, end='', flush=True)

                def timed_prompt(prompt: str, timeout: float = 10.0, default: str = 'y') -> str:
                    # Check if cancel event was set before starting
                    if prompt_cancel_event.is_set():
                        raise KeyboardInterrupt
                    # Windows: use msvcrt to read characters without requiring Enter
                    if os.name == 'nt':
                        try:
                            import msvcrt
                        except Exception:
                            # Fallback to input() if msvcrt isn't available
                            try:
                                return input().strip().lower()
                            except KeyboardInterrupt:
                                # Propagate so the prompt handling can cancel the whole script
                                raise
                            except Exception:
                                return default
                        buf = []
                        start = time.time()
                        while True:
                            if prompt_cancel_event.is_set():
                                raise KeyboardInterrupt
                            if msvcrt.kbhit():
                                ch = msvcrt.getwche()
                                # Ctrl+C via msvcrt may appear as ASCII ETX '\x03'
                                if ch == '\x03':
                                    raise KeyboardInterrupt
                                if ch in ('\r', '\n'):
                                    print()
                                    return ''.join(buf).strip().lower()
                                elif ch == '\x08':  # backspace
                                    if buf:
                                        buf.pop()
                                        # Erase character visually
                                        print('\b \b', end='', flush=True)
                                else:
                                    buf.append(ch)
                                    # Accept single 'y' or 'n' keypress without Enter
                                    if ch.lower() in ('y', 'n') and len(buf) == 1:
                                        print()
                                        return ch.lower()
                            if time.time() - start >= timeout:
                                print()
                                if prompt_cancel_event.is_set():
                                    raise KeyboardInterrupt
                                print(f"{Colors.CYAN}[INFO] No response after {int(timeout)} seconds, defaulting to skip overwriting{Colors.RESET}")
                                return default
                            time.sleep(0.1)
                    else:
                        # POSIX: select on stdin; user still must press Enter but we avoid a stuck thread
                        try:
                            import select, sys
                            rlist, _, _ = select.select([sys.stdin], [], [], timeout)
                            if rlist:
                                line = sys.stdin.readline().strip().lower()
                                return line
                            else:
                                print()
                                if prompt_cancel_event.is_set():
                                    raise KeyboardInterrupt
                                print(f"{Colors.CYAN}[INFO] No response after {int(timeout)} seconds, defaulting to skip overwriting{Colors.RESET}")
                                return default
                        except Exception:
                            # Fallback
                            try:
                                return input().strip().lower()
                            except KeyboardInterrupt:
                                # Propagate to caller so we can cancel the whole run
                                raise
                            except Exception:
                                return default

                # Run the prompt in an executor so we don't block the event loop
                try:
                    response = await asyncio.get_event_loop().run_in_executor(None, timed_prompt, prompt_text, 10.0, 'y')
                except asyncio.CancelledError:
                    prompt_cancel_event.set()
                    print(f"\n{Colors.CYAN}[INFO] Prompt cancelled by user (Ctrl+C). Exiting...{Colors.RESET}")
                    try:
                        await browser.close()
                    except Exception:
                        pass
                    sys.exit(1)
                except KeyboardInterrupt:
                    prompt_cancel_event.set()
                    print(f"\n{Colors.CYAN}[INFO] Operation cancelled by user (Ctrl+C). Exiting...{Colors.RESET}")
                    try:
                        await browser.close()
                    except Exception:
                        pass
                    sys.exit(1)

                # Default: skip existing images unless user answers 'n' or 'no'
                if response == 'n' or response == 'no':
                    overwrite = True
                    print(f"{Colors.CYAN}[INFO] Will overwrite existing images{Colors.RESET}")
                else:
                    print(f"{Colors.CYAN}[INFO] Will skip overwriting existing images{Colors.RESET}")

        

        for route in routes:
            # Skip only if route is '/'
            if route == '':
                continue
            config = seo.get(route, {})
            og_image = config.get('ogImage')
            if not og_image:
                print(f"{Colors.BLUE}[SKIP] Skipping {route}: no ogImage configured{Colors.RESET}")
                continue

            # Determine local filepath for OG image
            # ogImage may be '/images/og/og-home.webp'
            if og_image.startswith('/'):
                dest_rel = og_image[1:]
            else:
                dest_rel = og_image

            dest_path = Path(out_dir) / dest_rel
            # Only target files prefixed with 'og-'. Skip other image types (e.g., article hero images).
            fname = dest_path.name
            if not fname.lower().startswith('og-'):
                print(f"{Colors.BLUE}[SKIP] Skipping {route}: ogImage '{og_image}' is not prefixed with 'og-' (not an OG image){Colors.RESET}")
                continue
            if dest_path.exists() and not overwrite:
                # print(f"OG image already exists for {route}, skipping: {dest_path}")
                continue

            # Ensure directory exists
            ensure_dir_for_file(dest_path)

            url = base_url + (route if route.startswith('/') else '/' + route)
            try:
                # Wait longer for the homepage, which often contains animated hero content
                homepage_wait = 3.0 if route in ('/', '') else 1.2
                await capture_page_to_webp(page, url, dest_path, wait_time=homepage_wait)
            except asyncio.CancelledError:
                prompt_cancel_event.set()
                print(f"\n{Colors.CYAN}[INFO] Capture cancelled by user (Ctrl+C). Exiting...{Colors.RESET}")
                try:
                    await browser.close()
                except Exception:
                    pass
                sys.exit(1)
            except KeyboardInterrupt:
                prompt_cancel_event.set()
                print(f"\n{Colors.CYAN}[INFO] Operation cancelled by user (Ctrl+C). Exiting...{Colors.RESET}")
                try:
                    await browser.close()
                except Exception:
                    pass
                sys.exit(1)
            except Exception as e:
                print(f"{Colors.RED}[ERR] Error capturing {url}: {e}{Colors.RESET}")

        await browser.close()


def get_referenced_images_from_seo(seo: Dict[str, Any]) -> set:
    referenced = set()
    for route, config in seo.items():
            if not isinstance(config, dict):
                continue
            og = config.get('ogImage')
            if og and isinstance(og, str):
                if og.startswith('/'):
                    referenced.add(og[1:])
                else:
                    referenced.add(og)
    # Include global default image and logo
    global_conf = seo.get('_global', {})
    if isinstance(global_conf, dict):
        for key in ('defaultImage', 'logo'):
            val = global_conf.get(key)
            if val and isinstance(val, str):
                referenced.add(val[1:] if val.startswith('/') else val)
    # Normalize to lower-case for case-insensitive comparisons
    normalized = {p.replace('\\', '/').lower() for p in referenced}
    return normalized


def cleanup_orphaned_images(out_dir: str, referenced: set, dry_run: bool = True):
    # We'll only consider webp images under out_dir/images/**
    out = Path(out_dir)
    images_root = out / 'images'
    to_delete = []

    # Check images folder for files starting with og-
    if images_root.exists():
        for root, _, files in os.walk(images_root):
            for fname in files:
                if not fname.lower().endswith('.webp'):
                    continue
                # only consider files with 'og-' prefix in the filename
                if not fname.startswith('og-'):
                    continue
                rel = os.path.relpath(os.path.join(root, fname), out_dir)
                norm = rel.replace('\\', '/').lower()
                if norm not in referenced:
                    to_delete.append(Path(root) / fname)

    if not to_delete:
        # print('No orphaned OG images found to delete.')
        return

    # Delete or show them
    for p in to_delete:
        if dry_run:
            print(f"{Colors.YELLOW}[DRYRUN]{Colors.RESET} Would delete: {p}")
        else:
            try:
                p.unlink()
                print(f"{Colors.GREEN}[DEL] Deleted:{Colors.RESET} {p}")
            except Exception as e:
                print(f"{Colors.RED}[ERR] Failed to delete {p}: {e}{Colors.RESET}")


def main():
    args = parse_args()
    seo_path = args.seo
    if not os.path.exists(seo_path):
        print(f"{Colors.RED}{Colors.BRIGHT}[ERR] ERROR:{Colors.RESET} seo.json not found at {Colors.YELLOW}{seo_path}{Colors.RESET}")
        sys.exit(1)

    # Ensure Playwright is installed and browsers are set up
    # This script assumes `playwright install` has been run.

    # Run generation and optional cleanup
    try:
        asyncio.run(generate_images(args.host, args.port, seo_path, args.out, args.overwrite))
    except KeyboardInterrupt:
        prompt_cancel_event.set()
        print(f"\n{Colors.CYAN}[INFO] Operation cancelled by user (Ctrl+C). Exiting...{Colors.RESET}")
        sys.exit(1)
    except asyncio.CancelledError:
        prompt_cancel_event.set()
        print(f"\n{Colors.CYAN}[INFO] Operation cancelled. Exiting...{Colors.RESET}")
        sys.exit(1)
    if args.cleanup:
        seo = read_seo(seo_path)
        referenced = get_referenced_images_from_seo(seo)
        cleanup_orphaned_images(args.out, referenced, dry_run=args.dry_run)


if __name__ == '__main__':
    main()
