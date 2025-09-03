// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

/**
 * Cria e retorna uma instância do cliente Supabase para uso no browser
 * Utiliza as variáveis de ambiente para configurar a conexão
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
          getAll() {
            if (typeof document === 'undefined') return []
            return document.cookie
              .split('; ')
              .map(cookie => {
                const [name, ...rest] = cookie.split('=')
                return { name, value: rest.join('=') }
              })
              .filter(cookie => cookie.name && cookie.value)
          },
          setAll(cookiesToSet) {
            if (typeof document === 'undefined') return
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookieString = `${name}=${value}`
              if (options?.maxAge) cookieString += `; Max-Age=${options.maxAge}`
              if (options?.path) cookieString += `; Path=${options.path}`
              if (options?.domain) cookieString += `; Domain=${options.domain}`
              if (options?.secure) cookieString += '; Secure'
              if (options?.httpOnly) cookieString += '; HttpOnly'
              if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`
              document.cookie = cookieString
            })
          }
        }
    }
  )
}