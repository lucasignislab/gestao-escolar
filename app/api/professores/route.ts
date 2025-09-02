// app/api/professores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ITENS_POR_PAGINA = 10;

/**
 * API route para buscar professores com paginação e filtros
 * GET /api/professores?page=1&search=termo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paginaAtual = Number(searchParams.get('page')) || 1;
    const termoBusca = searchParams.get('search') || '';

    // Construir cláusula WHERE para filtros de busca
    const whereClause = termoBusca ? {
      OR: [
        { name: { contains: termoBusca, mode: 'insensitive' as const } },
        { surname: { contains: termoBusca, mode: 'insensitive' as const } },
        { email: { contains: termoBusca, mode: 'insensitive' as const } },
      ],
    } : {};

    // Buscar professores com paginação e filtros
    const professores = await prisma.teacher.findMany({
      where: whereClause,
      take: ITENS_POR_PAGINA,
      skip: (paginaAtual - 1) * ITENS_POR_PAGINA,
      orderBy: {
        name: 'asc',
      },
    });

    // Contar total de professores com filtros aplicados
    const total = await prisma.teacher.count({ where: whereClause });

    return NextResponse.json({
      professores,
      total,
      pagina: paginaAtual,
      totalPaginas: Math.ceil(total / ITENS_POR_PAGINA),
    });
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}