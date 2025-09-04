// app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * API Route para logout do usuário
 * Encerra a sessão no Appwrite e remove o cookie de sessão
 */
export async function POST(request: NextRequest) {
  try {
    // Criar cliente de sessão usando o cookie
    const { account } = await createSessionClient();
    
    // Tentar encerrar a sessão atual no Appwrite
    try {
      await account.deleteSession('current');
    } catch (error: any) {
      // Se falhar, pode ser porque a sessão já expirou
      console.log('Sessão já encerrada ou inválida:', error.message);
    }
    
    // Remover o cookie de sessão
    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');
    
    return NextResponse.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Erro no logout:', error);
    
    // Mesmo com erro, remover o cookie para garantir logout
    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');
    
    return NextResponse.json(
      { message: 'Logout realizado (com limpeza de sessão)' },
      { status: 200 }
    );
  }
}