import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "პაროლის აღდგენა" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-card border border-line bg-card p-6 sm:p-8">
        <Logo className="h-8 w-auto" />
        <h1 className="mt-2 mb-2 text-2xl font-bold">პაროლის აღდგენა</h1>
        <p className="mb-6 text-sm text-muted">ჩაწერეთ ადმინის ელფოსტა — გამოგიგზავნით ბმულს ახალი პაროლისთვის.</p>
        <ForgotForm />
      </div>
    </main>
  );
}
