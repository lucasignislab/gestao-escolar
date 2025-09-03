// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserProfile } from '@/lib/authorization';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar se o usuário está autenticado e é um administrador
    const profile = await getCurrentUserProfile();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    if (profile.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar estas estatísticas.' },
        { status: 403 }
      );
    }
    
    // Buscar estatísticas do sistema
    const [totalAlunos, totalProfessores, totalTurmas] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count()
    ]);
    
    return NextResponse.json({
      totalAlunos,
      totalProfessores,
      totalTurmas
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}