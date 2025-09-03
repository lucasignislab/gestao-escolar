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
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  // Configuração para o Netlify
  trailingSlash: false,
  // Otimizações para produção
  swcMinify: true,
  // Removendo export estático para permitir funcionalidades dinâmicas
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Configuração para variáveis de ambiente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
