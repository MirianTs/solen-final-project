import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  HASH_SALT: z.string().min(16, "HASH_SALT must be at least 16 characters"),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function parse<T extends z.ZodType>(schema: T, values: Record<string, string | undefined>, label: string): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid ${label} environment variables:\n${issues}\nSee .env.example.`);
  }
  return result.data;
}

let publicCache: PublicEnv | undefined;
let serverCache: ServerEnv | undefined;

/** Public env (safe in the browser). Each var is referenced literally so Next.js can inline it. */
export function publicEnv(): PublicEnv {
  publicCache ??= parse(
    publicSchema,
    {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
    "public",
  );
  return publicCache;
}

/** Server-only secrets. Never call this from client code. */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called in the browser");
  }
  serverCache ??= parse(
    serverSchema,
    {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      HASH_SALT: process.env.HASH_SALT,
    },
    "server",
  );
  return serverCache;
}
