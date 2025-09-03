import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Configurações para o Prisma em produção
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Configuração para o Netlify
  trailingSlash: false,
  // Otimizações para produção
  // swcMinify foi removido no Next.js 15.x
  // Configuração para permitir funcionalidades dinâmicas com cookies
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Configuração para variáveis de ambiente
  env: {

  },
};

export default nextConfig;
