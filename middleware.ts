// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware para proteção de rotas e gerenciamento de autenticação
 * Verifica se o usuário está autenticado antes de acessar rotas protegidas
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Verificar se existe sessão do Appwrite nos cookies
  const session = request.cookies.get('appwrite-session');
  const isAuthenticated = !!session?.value;

  // Proteger rotas do dashboard - redirecionar para login se não autenticado
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirecionar usuários autenticados da página de login para o dashboard
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}