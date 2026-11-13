// Uploads a photos backup folder (made by backup-photos.mjs) back into the `photos` bucket.
// Existing files with the same name are overwritten.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/restore-photos.mjs <backup-dir>
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { storageConfig, upload } from "./storage-api.mjs";

const BUCKET = "photos";
const TYPES = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/restore-photos.mjs <backup-dir>");
  process.exit(1);
}

const cfg = storageConfig();
const manifest = JSON.parse(await readFile(join(dir, "_manifest.json"), "utf8"));
if (!Array.isArray(manifest.files)) {
  console.error(`${join(dir, "_manifest.json")} has no "files" list. Is this a folder made by backup-photos.mjs?`);
  process.exit(1);
}

for (const path of manifest.files) {
  const body = await readFile(join(dir, path));
  await upload(cfg, BUCKET, path, body, TYPES[extname(path).toLowerCase()] ?? "application/octet-stream");
  console.log(`uploaded ${path}`);
}
console.log(`Restored ${manifest.files.length} file(s) into bucket "${BUCKET}".`);
