// Minimal Supabase Storage REST helpers for the backup/restore scripts (no npm dependencies).

/** Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment; exits if either is missing. */
export function storageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
    process.exit(1);
  }
  // Legacy service_role keys are JWTs and go in Authorization too; new "sb_secret_" keys only in apikey.
  const headers = { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) };
  return { url, headers };
}

/** fetch() against the Supabase API with auth headers; throws with status and body on a non-2xx response. */
async function request(cfg, path, init = {}) {
  const res = await fetch(`${cfg.url}${path}`, { ...init, headers: { ...cfg.headers, ...init.headers } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status} ${body.slice(0, 300)}`);
  }
  return res;
}

/** Recursively lists every object path in a bucket. */
export async function listAll(cfg, bucket, prefix = "") {
  const paths = [];
  const limit = 1000;
  for (let offset = 0; ; offset += limit) {
    const res = await request(cfg, `/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit, offset, sortBy: { column: "name", order: "asc" } }),
    });
    const items = await res.json();
    for (const item of items) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) paths.push(...(await listAll(cfg, bucket, full))); // folder
      else paths.push(full);
    }
    if (items.length < limit) break;
  }
  return paths;
}

const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");

/** Downloads one object; returns its bytes and content type. */
export async function download(cfg, bucket, path) {
  const res = await request(cfg, `/storage/v1/object/${bucket}/${encodePath(path)}`);
  return { body: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get("content-type") };
}

/** Uploads one object, overwriting an existing file with the same path (x-upsert). */
export async function upload(cfg, bucket, path, body, contentType) {
  await request(cfg, `/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: { "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "max-age=31536000" },
    body,
  });
}
