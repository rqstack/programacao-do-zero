"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";
import { cx } from "@/components/ui/primitives";

/** Link para relatar um problema na página atual (leva o caminho, nunca dados pessoais). */
export function ReportLink({ label = "Relatar um problema", className }: { label?: string; className?: string }) {
  const pathname = usePathname() || "/";
  const de = pathname.startsWith("/feedback") ? "" : `?de=${encodeURIComponent(pathname)}`;
  return (
    <Link href={`/feedback${de}`} className={cx("inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg", className)}>
      <MessageSquareWarning aria-hidden className="size-4" /> {label}
    </Link>
  );
}
