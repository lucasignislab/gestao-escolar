// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria e retorna uma instância do cliente Supabase para uso no browser
 * Utiliza as variáveis de ambiente para configurar a conexão
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}