import { ReactNode } from "react";

export const authInputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-koda-teal focus:ring-2 focus:ring-koda-teal/20";

export function fieldErrors(messages?: string[]) {
  if (!messages?.length) return null;
  return <p className="text-xs text-red-600">{messages[0]}</p>;
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="bg-koda-navy">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-white">KODA</span>
            <span className="text-lg font-light tracking-tight text-koda-teal">Projects</span>
          </div>
        </div>
      </header>
      <div className="bg-gradient-to-r from-koda-gold to-koda-teal">
        <div className="mx-auto max-w-6xl px-6 py-3 text-sm text-white/90">
          Tracking every client engagement in one place.
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-koda-gold to-koda-teal" />
          <div className="px-8 py-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
            <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
