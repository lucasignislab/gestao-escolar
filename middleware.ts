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
  // Verificar todos os cookies para depuração
  const allCookies = request.cookies.getAll();
  console.log('Middleware - Todos os cookies:', allCookies.map(c => `${c.name}=${c.value.substring(0, 5)}...`).join(', '));
  console.log('Middleware - Nomes de todos os cookies:', allCookies.map(c => c.name).join(', '));
  
  // Tentar obter o cookie de sessão de várias maneiras
  const session = request.cookies.get('appwrite-session');
  const sessionLowerCase = request.cookies.get('appwrite-session'.toLowerCase());
  const sessionFromAll = allCookies.find(c => c.name.toLowerCase() === 'appwrite-session');
  
  // Verificar qual método encontrou o cookie
  console.log('Middleware - Cookie encontrado via get():', !!session);
  console.log('Middleware - Cookie encontrado via get() lowercase:', !!sessionLowerCase);
  console.log('Middleware - Cookie encontrado via find():', !!sessionFromAll);
  
  // Usar o cookie que foi encontrado
  const actualSession = session || sessionLowerCase || sessionFromAll;
  const isAuthenticated = !!actualSession?.value;
  
  // Log para depuração
  console.log('Middleware - URL:', request.nextUrl.pathname);
  console.log('Middleware - Método:', request.method);
  console.log('Middleware - Cookie de sessão:', actualSession?.value ? 'Presente' : 'Ausente');
  
  if (actualSession?.value) {
    console.log('Middleware - Cookie de sessão valor (bruto):', actualSession.value.substring(0, 10) + '...');
    try {
      const decodedValue = decodeURIComponent(actualSession.value);
      console.log('Middleware - Cookie de sessão valor (decodificado):', decodedValue.substring(0, 10) + '...');
    } catch (e) {
      console.log('Middleware - Erro ao decodificar cookie:', e);
    }
  } else {
    console.log('Middleware - Cookie de sessão valor: N/A');
  }
  
  console.log('Middleware - isAuthenticated:', isAuthenticated);
  
  // Adicionar o cookie à resposta para garantir que ele seja propagado
  if (actualSession?.value) {
    // Não modificar o cookie, apenas passá-lo adiante
    response.cookies.set('appwrite-session', actualSession.value, {
      path: '/',
      maxAge: 2592000, // 30 dias em segundos
    });
    console.log('Middleware - Cookie propagado na resposta');
  } else {
    console.log('Middleware - Nenhum cookie para propagar');
  }

  // Proteger rotas do dashboard - redirecionar para login se não autenticado
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Middleware - Redirecionando para login (não autenticado)');
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirecionar usuários autenticados da página de login para o dashboard
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    console.log('Middleware - Redirecionando para dashboard (já autenticado)');
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