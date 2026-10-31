// Fail fast with a readable message when the server starts with missing env vars.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { publicEnv, serverEnv } = await import("./lib/env");
  publicEnv();
  serverEnv();
}
