import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "შესვლა" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const admin = await getAdmin();
  if (admin?.isAdmin) redirect("/admin");

  const { error } = await searchParams;
  const notice = error === "forbidden" || admin ? "ამ ანგარიშს ადმინისტრატორის წვდომა არ აქვს." : undefined;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-card border border-line bg-card p-6 sm:p-8">
        <p className="text-xl font-extrabold tracking-[0.2em] text-accent">SOLEN</p>
        <h1 className="mt-2 mb-6 text-2xl font-bold">ადმინ პანელი</h1>
        <LoginForm notice={notice} />
      </div>
    </main>
  );
}
