import { cx } from "@/components/ui/primitives";

/** Foto da pessoa (do Google) ou a inicial do nome. */
export function Avatar({ name, url, size = 40, className }: { name: string; url: string | null; size?: number; className?: string }) {
  return (
    <span className={cx("grid shrink-0 place-items-center overflow-hidden rounded-full border border-line-strong bg-panel-2", className)} style={{ width: size, height: size }}>
      {url ? (
        // Imagem externa simples: o site é estático, sem otimização de imagens.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" width={size} height={size} referrerPolicy="no-referrer" className="size-full object-cover" />
      ) : (
        <span aria-hidden className="font-semibold" style={{ fontSize: size * 0.4 }}>
          {name.charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </span>
  );
}
