// Downloads every file from the `photos` storage bucket into a local folder.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup-photos.mjs <out-dir>
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { download, listAll, storageConfig } from "./storage-api.mjs";

const BUCKET = "photos";
const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: node scripts/backup-photos.mjs <out-dir>");
  process.exit(1);
}

const cfg = storageConfig();
const paths = await listAll(cfg, BUCKET);
let bytes = 0;

for (const path of paths) {
  const { body } = await download(cfg, BUCKET, path);
  const target = join(outDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, body);
  bytes += body.length;
}

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "_manifest.json"), JSON.stringify({ bucket: BUCKET, files: paths, bytes }, null, 2));
console.log(`Backed up ${paths.length} file(s), ${(bytes / 1024).toFixed(0)} KiB from bucket "${BUCKET}".`);
