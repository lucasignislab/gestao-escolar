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
  const actualSession = session;
  
  // Verificar se o cookie de sessão existe e tem valor válido
  let isAuthenticated = false;
  
  if (actualSession?.value && actualSession.value.length > 0) {
    // Agora o cookie contém apenas o sessionId diretamente
    // Verificar se tem um formato válido de sessionId (geralmente tem mais de 10 caracteres)
    if (actualSession.value.length > 10) {
      isAuthenticated = true;
      console.log('Middleware - Sessão válida com sessionId:', actualSession.value.substring(0, 10) + '...');
    } else {
      console.log('Middleware - SessionId muito curto, considerado inválido');
    }
  }
  

  
  // Adicionar o cookie à resposta para garantir que ele seja propagado
  if (actualSession?.value) {
    response.cookies.set('appwrite-session', actualSession.value, {
      path: '/',
      maxAge: 2592000, // 30 dias em segundos
    });
  }

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