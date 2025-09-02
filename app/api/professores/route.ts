// app/api/professores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUserProfile } from '@/lib/authorization';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar permissões (apenas ADMIN e PROFESSOR podem ver a lista)
    if (!['ADMIN', 'PROFESSOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar esta funcionalidade' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const limit = 10;
    const offset = (page - 1) * limit;

    // Construir filtros de busca
    const where = search
      ? {
          username: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    // Buscar professores com paginação
    const [professores, total] = await Promise.all([
      prisma.profile.findMany({
        where: {
          role: 'PROFESSOR',
          ...where,
        },
        select: {
          id: true,
          username: true,
          role: true,
          avatarUrl: true,
        },
        skip: offset,
        take: limit,
        orderBy: {
          username: 'asc',
        },
      }),
      prisma.profile.count({
        where: {
          role: 'PROFESSOR',
          ...where,
        },
      }),
    ]);

    return NextResponse.json({
      professores,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}