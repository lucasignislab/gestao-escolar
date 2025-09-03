// types/supabase-cookie.d.ts
// Augmentações de tipos para compatibilidade entre Next.js e Supabase SSR
// Permite uso dos métodos get, set e remove sem erros de tipagem.

import '@supabase/ssr'
import 'next/headers'

declare module '@supabase/ssr' {
  /**
   * Expande CookieMethodsServer para aceitar métodos adicionais
   * necessários pelo fluxo de autenticação.
   */
  interface CookieMethodsServer {
    /** Retorna o valor bruto do cookie ou undefined */
    get?: (name: string) => string | undefined | null | Promise<string | undefined | null>
    /** Define um cookie */
    set?: (name: string, value: string, options?: any) => void
    /** Remove um cookie */
    remove?: (name: string, options?: any) => void
  }
}

declare module 'next/headers' {
  interface RequestCookies {
    /** Sobrecargas flexíveis para aceitar objeto completo */
    set(name: string, value: string, options?: any): void
    set(cookie: { name: string; value: string; options?: any }): void
  }

  interface ResponseCookies {
    set(name: string, value: string, options?: any): void
    set(cookie: { name: string; value: string; options?: any }): void
  }
}