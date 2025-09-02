// app/dashboard/turmas/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createTurmaSchema, updateTurmaSchema } from '@/lib/schemas';
import { requirePermission, getCurrentUserProfile, isAdmin, isProfessor } from '@/lib/authorization';

const prisma = new PrismaClient();

/**
 * Função para criar uma nova turma
 * Valida os dados e cria um registro no banco de dados
 * @param formData - Dados do formulário de criação
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function createTurma(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('CREATE_TURMA');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    name: formData.get('name') as string,
    capacity: parseInt(formData.get('capacity') as string),
    gradeId: formData.get('gradeId') as string,
    supervisorId: formData.get('supervisorId') as string || undefined,
  };

  // Validar os dados usando o esquema Zod
  const result = createTurmaSchema.safeParse(data);

  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verificar se já existe uma turma com o mesmo nome
    const existingTurma = await prisma.class.findUnique({
      where: { name: result.data.name },
    });

    if (existingTurma) {
      return { success: false, message: 'Já existe uma turma com este nome.' };
    }

    // Criar a turma
    await prisma.class.create({
      data: {
        name: result.data.name,
        capacity: result.data.capacity,
        gradeId: result.data.gradeId,
        supervisorId: result.data.supervisorId,
      },
    });

    revalidatePath('/dashboard/turmas'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return { success: false, message: 'Ocorreu um erro ao criar a turma.' };
  }
}

/**
 * Função para atualizar uma turma existente
 * Valida os dados e atualiza o registro no banco de dados
 * @param formData - Dados do formulário de edição
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function updateTurma(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('UPDATE_TURMA');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    capacity: parseInt(formData.get('capacity') as string),
    gradeId: formData.get('gradeId') as string,
    supervisorId: formData.get('supervisorId') as string || undefined,
  };

  // Validar os dados usando o esquema Zod
  const result = updateTurmaSchema.safeParse(data);

  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verificar se já existe outra turma com o mesmo nome
    const existingTurma = await prisma.class.findFirst({
      where: {
        name: result.data.name,
        NOT: { id: result.data.id },
      },
    });

    if (existingTurma) {
      return { success: false, message: 'Já existe uma turma com este nome.' };
    }

    // Atualizar a turma
    await prisma.class.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        capacity: result.data.capacity,
        gradeId: result.data.gradeId,
        supervisorId: result.data.supervisorId,
      },
    });

    revalidatePath('/dashboard/turmas'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    return { success: false, message: 'Ocorreu um erro ao atualizar a turma.' };
  }
}

/**
 * Função para excluir uma turma
 * Remove a turma do banco de dados
 * @param id - ID da turma a ser excluída
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function deleteTurma(id: string) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('DELETE_TURMA');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  try {
    // Verificar se a turma tem alunos associados
    const studentsCount = await prisma.student.count({
      where: { classId: id },
    });

    if (studentsCount > 0) {
      return { 
        success: false, 
        message: `Não é possível excluir a turma pois ela possui ${studentsCount} aluno(s) associado(s).` 
      };
    }

    await prisma.class.delete({
      where: { id },
    });

    revalidatePath('/dashboard/turmas');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    return { success: false, message: 'Ocorreu um erro ao excluir a turma.' };
  }
}

/**
 * Função para buscar turmas com paginação e filtros
 * @param searchParams - Parâmetros de busca (página, busca, limite, ano escolar)
 * @returns Lista de turmas com informações de paginação
 */
export async function buscarTurmas(searchParams: {
  page?: string;
  search?: string;
  limit?: string;
  gradeId?: string;
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const search = searchParams.search || '';
  const gradeId = searchParams.gradeId;
  const skip = (page - 1) * limit;

  try {
    const currentUser = await getCurrentUserProfile();
    
    const where: {
      name?: {
        contains: string;
        mode: 'insensitive';
      };
      gradeId?: string;
      supervisorId?: string;
    } = {};

    // Filtro por busca (nome da turma)
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }

    // Filtro por ano escolar
    if (gradeId) {
      where.gradeId = gradeId;
    }

    // Filtrar dados baseado no role do usuário
    if (await isProfessor()) {
      // Professores só veem suas próprias turmas
      const teacher = await prisma.teacher.findUnique({
        where: { profileId: currentUser.id },
        select: { id: true },
      });
      
      if (!teacher) {
        throw new Error('Professor não encontrado.');
      }
      
      where.supervisorId = teacher.id;
    }
    // Admins veem todas as turmas (whereClause vazio)
    // Alunos e Responsáveis não deveriam acessar esta função
    else if (!await isAdmin()) {
      throw new Error('Acesso negado.');
    }

    const [turmas, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          grade: {
            select: {
              level: true,
            },
          },
          supervisor: {
            select: {
              name: true,
              surname: true,
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.class.count({ where }),
    ]);

    return {
      turmas,
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    throw new Error('Erro ao buscar turmas');
  }
}

/**
 * Função para buscar anos escolares disponíveis
 * @returns Lista de anos escolares
 */
export async function buscarAnosEscolares() {
  try {
    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return grades;
  } catch (error) {
    console.error('Erro ao buscar anos escolares:', error);
    throw new Error('Erro ao buscar anos escolares');
  }
}

/**
 * Função para buscar professores disponíveis para supervisão
 * @returns Lista de professores
 */
export async function buscarProfessores() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return teachers;
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    throw new Error('Erro ao buscar professores');
  }
}