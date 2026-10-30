"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, HeartHandshake, Loader2, RotateCcw } from "lucide-react";
import { Alert, Button, cx, Spinner } from "@/components/ui/primitives";
import { pollDelay } from "@/lib/support/poll";

const FN = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/functions/v1/support-pix`;
const HEADERS = { "Content-Type": "application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" };
const PENDING_KEY = "pdz-apoio-pendente";
const PRESETS = [5, 10, 20, 50];

type Status = "aguardando" | "confirmado" | "expirado" | "falhou" | "estornado";
interface Charge {
  id: string;
  amount_cents: number;
  status: Status;
  pix_code: string | null;
  expires_at: string;
}

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function call<T>(init: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(FN, { ...init, headers: HEADERS });
    const data = (await res.json()) as T & { error?: string };
    return res.ok ? { ok: true, data } : { ok: false, error: data.error ?? `Erro ${res.status}` };
  } catch {
    return { ok: false, error: "Sem conexão com o servidor. Tente de novo." };
  }
}

/** Apoio voluntário via Pix. Não concede XP, troféus nem vantagens. */
export function SupportPix() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [amount, setAmount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [failures, setFailures] = useState(0);
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(false);
      return;
    }
    call<{ enabled: boolean }>({ method: "GET" }).then((r) => setEnabled(r.ok ? r.data.enabled : false));
    // Retoma uma cobrança pendente deste navegador (recarregou a página).
    try {
      const saved = window.localStorage.getItem(PENDING_KEY);
      if (saved) setCharge(JSON.parse(saved) as Charge);
    } catch {
      /* sem armazenamento */
    }
  }, []);

  // QR Code gerado no navegador a partir do Copia e Cola (nenhum dado sai daqui).
  useEffect(() => {
    if (!charge?.pix_code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQr(null);
      return;
    }
    QRCode.toDataURL(charge.pix_code, { margin: 1, width: 260, errorCorrectionLevel: "M" }).then(setQr, () => setQr(null));
  }, [charge?.pix_code]);

  // Acompanha o pagamento: o servidor confere na Syncpay a cada consulta.
  useEffect(() => {
    if (!charge || charge.status !== "aguardando") {
      try {
        if (charge && charge.status !== "aguardando") window.localStorage.removeItem(PENDING_KEY);
      } catch {
        /* sem armazenamento */
      }
      return;
    }
    try {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(charge));
    } catch {
      /* sem armazenamento */
    }
    const t = window.setTimeout(async () => {
      const r = await call<Charge>({ method: "POST", body: JSON.stringify({ action: "status", id: charge.id }) });
      if (r.ok) {
        setFailures(0);
        setCharge((c) => (c && c.id === r.data.id ? { ...c, ...r.data, pix_code: r.data.pix_code ?? c.pix_code } : c));
      } else {
        // Falhou (rede ou servidor): agenda outra consulta em vez de parar de acompanhar.
        setFailures((n) => n + 1);
      }
    }, pollDelay(failures));
    return () => window.clearTimeout(t);
  }, [charge, failures]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = amount.trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) < 5) {
      setError("Informe um valor a partir de R$ 5,00, com até 2 casas decimais.");
      return;
    }
    keyRef.current ??= crypto.randomUUID();
    setBusy(true);
    const r = await call<Charge>({ method: "POST", body: JSON.stringify({ action: "create", amount: value, idempotency_key: keyRef.current }) });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setCharge(r.data);
  }

  function reset() {
    keyRef.current = null;
    setCharge(null);
    setCopied(false);
    try {
      window.localStorage.removeItem(PENDING_KEY);
    } catch {
      /* sem armazenamento */
    }
  }

  if (enabled === null) return <Spinner label="Carregando" />;
  if (!enabled) {
    return (
      <Alert tone="info" title="O apoio via Pix ainda não está ativo">
        A integração já está pronta, mas aguarda a configuração da conta de recebimento. Enquanto isso, a melhor forma de apoiar é compartilhar o site com quem está começando.
      </Alert>
    );
  }

  if (charge) {
    const status = charge.status;
    return (
      <div className="rounded-[var(--radius-lg)] border border-line bg-navy/60 p-6" aria-live="polite">
        <p className="text-sm text-muted">Apoio de {brl(charge.amount_cents)}</p>
        {status === "aguardando" && (
          <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR Code Pix para pagamento" width={220} height={220} className="mx-auto rounded-md bg-white p-2" />
            ) : (
              <Spinner label="Gerando QR Code" />
            )}
            <div className="min-w-0 space-y-3">
              <p className="flex items-center gap-2 font-semibold">
                <Loader2 aria-hidden className="size-4 animate-spin text-electric-hi" /> Aguardando o pagamento
              </p>
              <p className="text-sm text-muted">Abra o app do seu banco, escolha Pix e leia o QR Code ou cole o código abaixo. Esta tela atualiza sozinha quando o pagamento for confirmado.</p>
              <label htmlFor="copia-cola" className="block text-xs font-semibold text-subtle">
                Pix Copia e Cola
              </label>
              <textarea id="copia-cola" readOnly value={charge.pix_code ?? ""} rows={3} className="w-full resize-none rounded-md border border-line-strong bg-ink p-2 font-mono text-xs" />
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(charge.pix_code ?? "");
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  } catch {
                    /* sem permissão: a pessoa pode copiar do campo */
                  }
                }}
              >
                {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />} {copied ? "Copiado!" : "Copiar código"}
              </Button>
              <p className="text-xs text-subtle">Válido até {new Date(charge.expires_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.</p>
            </div>
          </div>
        )}
        {status === "confirmado" && (
          <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-ok">
            <HeartHandshake aria-hidden className="size-6" /> Pagamento confirmado. Muito obrigado pelo apoio!
          </p>
        )}
        {status === "expirado" && <p className="mt-3 text-warn">Este Pix expirou sem pagamento. Se quiser, gere um novo.</p>}
        {status === "falhou" && <p className="mt-3 text-bad">O pagamento não foi concluído. Nenhum valor foi cobrado.</p>}
        {status === "estornado" && <p className="mt-3 text-muted">Este pagamento foi devolvido.</p>}
        {status !== "aguardando" && (
          <Button variant="ghost" size="sm" className="mt-4" onClick={reset}>
            <RotateCcw aria-hidden className="size-4" /> Fazer outro apoio
          </Button>
        )}
        {status === "aguardando" && (
          <button type="button" onClick={reset} className="mt-4 text-xs text-subtle underline">
            Desistir e escolher outro valor
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={generate} className="space-y-4 rounded-[var(--radius-lg)] border border-line p-6" noValidate>
      <fieldset>
        <legend className="text-sm font-semibold">Quanto você quer apoiar?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={Number(amount.replace(",", ".")) === v}
              onClick={() => setAmount(String(v))}
              className={cx("min-h-10 rounded-full border px-4 text-sm font-semibold", Number(amount.replace(",", ".")) === v ? "border-electric bg-electric/10" : "border-line-strong")}
            >
              {brl(v * 100)}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="valor-apoio" className="block text-sm font-medium">
          Ou digite outro valor (mínimo R$ 5,00)
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-muted">R$</span>
          <input
            id="valor-apoio"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            aria-describedby="valor-dica"
            className="min-h-11 w-40 rounded-md border border-line-strong bg-ink px-3 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>
        <p id="valor-dica" className="mt-1 text-xs text-subtle">
          A Syncpay desconta uma tarifa por Pix recebido. Não pedimos seus dados pessoais.
        </p>
      </div>
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <HeartHandshake aria-hidden className="size-4" />} Gerar Pix
      </Button>
    </form>
  );
}
