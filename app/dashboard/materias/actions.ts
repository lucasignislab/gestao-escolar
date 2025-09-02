// app/dashboard/materias/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { 
  createMateriaSchema, 
  updateMateriaSchema, 
  materiaSearchSchema,
  type MateriaSearchParams 
} from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { requirePermission, getCurrentUserProfile, isAdmin } from '@/lib/authorization';

/**
 * Server Action para criar uma nova matéria
 * Estabelece relação N-N com professores usando connect do Prisma
 */
export async function createMateria(formData: FormData) {
  try {
    // Verificar permissão antes de executar a ação
    await requirePermission('CREATE_MATERIA');
    
    // Extrair dados do FormData
    const name = formData.get('name') as string;
    const teacherIdsString = formData.get('teacherIds') as string;
    
    // Parse do array de IDs dos professores
    const teacherIds = JSON.parse(teacherIdsString) as string[];
    
    // Validar dados usando Zod
    const validatedData = createMateriaSchema.parse({
      name,
      teacherIds,
    });

    // Verificar se já existe uma matéria com o mesmo nome
    const existingMateria = await prisma.subject.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingMateria) {
      throw new Error('Já existe uma matéria com este nome.');
    }

    // Criar a matéria com relação N-N usando connect
    await prisma.subject.create({
      data: {
        name: validatedData.name,
        teachers: {
          connect: validatedData.teacherIds.map((id: string) => ({ id })),
        },
      },
    });

    // Revalidar a página de matérias
    revalidatePath('/dashboard/materias');
    
    return { success: true, message: 'Matéria criada com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar matéria:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro interno do servidor' 
    };
  }
}

/**
 * Server Action para atualizar uma matéria existente
 * Atualiza a relação N-N com professores usando set do Prisma
 */
export async function updateMateria(formData: FormData) {
  try {
    // Verificar permissão antes de executar a ação
    await requirePermission('UPDATE_MATERIA');
    
    // Extrair dados do FormData
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const teacherIdsString = formData.get('teacherIds') as string;
    
    // Parse do array de IDs dos professores
    const teacherIds = JSON.parse(teacherIdsString) as string[];
    
    // Validar dados usando Zod
    const validatedData = updateMateriaSchema.parse({
      id,
      name,
      teacherIds,
    });

    // Verificar se existe outra matéria com o mesmo nome (exceto a atual)
    const existingMateria = await prisma.subject.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive',
        },
        NOT: {
          id: validatedData.id,
        },
      },
    });

    if (existingMateria) {
      throw new Error('Já existe uma matéria com este nome.');
    }

    // Atualizar a matéria e suas relações usando set
    await prisma.subject.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        teachers: {
          set: validatedData.teacherIds.map((id: string) => ({ id })),
        },
      },
    });

    // Revalidar a página de matérias
    revalidatePath('/dashboard/materias');
    
    return { success: true, message: 'Matéria atualizada com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar matéria:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro interno do servidor' 
    };
  }
}

/**
 * Server Action para deletar uma matéria
 */
export async function deleteMateria(id: string) {
  try {
    // Verificar permissão antes de executar a ação
    await requirePermission('DELETE_MATERIA');
    
    await prisma.subject.delete({
      where: { id },
    });

    // Revalidar a página de matérias
    revalidatePath('/dashboard/materias');
    
    return { success: true, message: 'Matéria deletada com sucesso!' };
  } catch (error) {
    console.error('Erro ao deletar matéria:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro interno do servidor' 
    };
  }
}

/**
 * Server Action para buscar matérias com paginação e filtros
 * Inclui os professores relacionados
 */
export async function buscarMaterias(searchParams: MateriaSearchParams) {
  try {
    // Verificar se está autenticado
    await getCurrentUserProfile();
    
    // Validar parâmetros de busca
    const validatedParams = materiaSearchSchema.parse(searchParams);
    
    const page = parseInt(validatedParams.page || '1');
    const limit = parseInt(validatedParams.limit || '10');
    const search = validatedParams.search || '';
    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    // Buscar matérias com contagem total
    const [materias, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: {
          teachers: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.subject.count({ where }),
    ]);

    const totalPaginas = Math.ceil(total / limit);

    return {
      materias,
      total,
      pagina: page,
      totalPaginas,
    };
  } catch (error) {
    console.error('Erro ao buscar matérias:', error);
    throw new Error('Erro ao buscar matérias');
  }
}

/**
 * Server Action para buscar todos os professores
 * Usado para popular o seletor de professores no formulário
 */
export async function buscarProfessores() {
  try {
    // Verificar se está autenticado
    await getCurrentUserProfile();
    
    const professores = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
      },
      orderBy: [{ name: 'asc' }, { surname: 'asc' }],
    });

    return professores;
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    throw new Error('Erro ao buscar professores');
  }
}

/**
 * Server Action para buscar uma matéria específica por ID
 * Inclui os professores relacionados
 */
export async function buscarMateriaPorId(id: string) {
  try {
    // Verificar se está autenticado
    await getCurrentUserProfile();
    
    const materia = await prisma.subject.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
      },
    });

    if (!materia) {
      throw new Error('Matéria não encontrada');
    }

    return materia;
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    throw new Error('Erro ao buscar matéria');
  }
}