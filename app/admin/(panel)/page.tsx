import Link from "next/link";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";

export default function AdminHome() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">მართვის პანელი</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ADMIN_SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex min-h-20 flex-col justify-center gap-1 rounded-card border border-line bg-card px-5 py-4 transition-colors hover:border-accent"
            >
              <span className="text-lg font-bold">{s.label}</span>
              <span className="text-sm text-muted">{s.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
