import { promises as fs } from 'fs';
import path from 'path';
import { brotliCompress, gzip, constants as zlibConstants } from 'zlib';
import type { BrotliOptions } from 'zlib';
import { promisify } from 'util';

const brotli = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

const compressExtensions = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg', '.xml', '.txt', '.wasm']);

// Console color codes for better visibility in CI
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function compressFile(filePath: string) {
  // Skip already compressed files
  if (filePath.endsWith('.gz') || filePath.endsWith('.br')) return;
  const ext = path.extname(filePath).toLowerCase();
  if (!compressExtensions.has(ext)) return;
  try {
    const data = await fs.readFile(filePath);
    const gz = await gzipAsync(data, { level: 9 });
    await fs.writeFile(filePath + '.gz', gz, { mode: 0o644 });
    const br = await brotli(data, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 4,
      },
    } as BrotliOptions);
    await fs.writeFile(filePath + '.br', br, { mode: 0o644 });
    // console.log(`${colors.green}✔ Compressed${colors.reset}: ${filePath}`);
  } catch (err) {
    console.error(`${colors.red}✖ Failed to compress${colors.reset}: ${filePath}`, err);
  }
}

async function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  try {
    const stats = await fs.stat(distDir);
    if (!stats.isDirectory()) {
      console.error(`${colors.red}✖ 'dist' is not a directory${colors.reset}`);
      console.error(`${colors.yellow}Please run the build command first (pnpm core:build).${colors.reset}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}✖ 'dist' directory not found; run build first.${colors.reset}`, err);
    process.exit(1);
  }
  const files = await walk(distDir);
  console.log(`${colors.cyan}🔎 Found ${files.length} files in 'dist'.${colors.reset}`);
  console.log(`${colors.cyan}🔄 Compressing files...${colors.reset}`);
  const tasks = files.map(async (f) => compressFile(f));
  await Promise.all(tasks);
  console.log(`${colors.green}✔ Compression finished.${colors.reset}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
