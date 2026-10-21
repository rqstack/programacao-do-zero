import type { NextConfig } from "next";

/**
 * Site 100% estático (next build gera a pasta out/), pronto para o GitHub Pages.
 * NEXT_PUBLIC_BASE_PATH é usado quando o site fica em um subcaminho, como
 * https://usuario.github.io/programacao-do-zero.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
