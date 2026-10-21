import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="font-mono text-sm text-amber">404</p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Esta página não existe</h1>
      <p className="mt-3 max-w-xl text-muted">O endereço pode ter mudado ou ter sido digitado errado. Que tal voltar para a rota?</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-md bg-electric px-5 font-semibold text-white hover:bg-electric-hi">
          Ir para o início
        </Link>
        <Link href="/trilhas" className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 font-semibold hover:border-muted">
          Ver trilhas
        </Link>
      </div>
    </Container>
  );
}
