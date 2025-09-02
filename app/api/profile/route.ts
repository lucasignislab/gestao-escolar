// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/authorization';

export async function GET() {
  try {
    const profile = await getCurrentUserProfile();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}