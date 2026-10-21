import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { RewardToaster } from "@/components/layout/reward-toaster";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Programação do Zero — Do primeiro código aos seus próprios projetos",
    template: "%s · Programação do Zero",
  },
  description:
    "Aprenda programação passo a passo, de graça e sem cadastro: aulas, exercícios, quizzes, jogos, laboratório de código e projetos guiados.",
  applicationName: "Programação do Zero",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Programação do Zero" },
};

export const viewport: Viewport = {
  themeColor: "#060a13",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-electric focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <SiteHeader />
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
          <RewardToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
