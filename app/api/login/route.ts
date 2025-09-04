import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar o cliente administrativo para criar a sessão
    const { account } = await createAdminClient();
    
    console.log('🔍 [API Login] Tentando criar sessão para:', email);
    
    // Criar sessão com email e senha
    const session = await account.createEmailPasswordSession(email, password);
    
    console.log('✅ [API Login] Sessão criada:', session.$id);
    console.log('🔍 [API Login] Session secret presente:', session.secret ? 'Sim' : 'Não');
    
    // Definir o cookie de sessão no servidor
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });
    
    console.log('✅ [API Login] Cookie definido no servidor');

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      userId: session.userId,
    });
  } catch (error: any) {
    console.error('❌ [API Login] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}