import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "კონტაქტები" };

// Placeholder: the editor for this section is built in a later phase.
export default async function Page() {
  await requireAdmin();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">კონტაქტები</h1>
      <p className="text-muted">ეს განყოფილება მალე დაემატება.</p>
    </>
  );
}
