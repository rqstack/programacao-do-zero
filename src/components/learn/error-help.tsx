import { HelpCircle } from "lucide-react";
import { explainError } from "@/lib/tutor/tutor";

/** Explica em linguagem simples uma mensagem de erro (quando ela é reconhecida). */
export function ErrorHelp({ message }: { message: string }) {
  const e = explainError(message);
  if (!e) return null;
  return (
    <div className="mt-3 border-t border-bad/30 pt-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold text-fg">
        <HelpCircle aria-hidden className="size-4 text-amber" /> O que isso quer dizer: {e.title}
      </p>
      <p className="mt-1 text-[#ffe3e3]">{e.meaning}</p>
      <p className="mt-1 text-muted">
        <span className="font-semibold text-fg">O que conferir:</span> {e.check}
      </p>
    </div>
  );
}
