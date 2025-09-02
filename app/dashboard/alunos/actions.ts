// app/dashboard/alunos/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAlunoSchema, updateAlunoSchema } from '@/lib/schemas';
import { requirePermission, getCurrentUserProfile, isAdmin, isAluno } from '@/lib/authorization';

const prisma = new PrismaClient();

/**
 * Função para criar um novo aluno
 * Valida os dados recebidos e os insere no banco de dados
 * @param formData - Dados do formulário contendo informações do aluno
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function createAluno(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('CREATE_ALUNO');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    name: formData.get('name') as string,
    surname: formData.get('surname') as string,
    parentId: formData.get('parentId') as string,
    classId: formData.get('classId') as string,
    gradeId: formData.get('gradeId') as string,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Validação dos dados usando o schema do Zod
  const result = createAlunoSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Criar o Profile primeiro
    const profile = await prisma.profile.create({
      data: {
        role: 'ALUNO',
        avatarUrl: avatarUrl,
        // username será definido posteriormente ou pode ser baseado no nome
      },
    });

    // Após criar o Profile, criar o Student
    await prisma.student.create({
      data: {
        profileId: profile.id,
        name: result.data.name,
        surname: result.data.surname,
        parentId: result.data.parentId,
        classId: result.data.classId,
        gradeId: result.data.gradeId,
      },
    });

    revalidatePath('/dashboard/alunos'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return { success: false, message: 'Ocorreu um erro ao criar o aluno.' };
  }
}

/**
 * Função para atualizar um aluno existente
 * Valida os dados recebidos e atualiza no banco de dados
 * @param formData - Dados do formulário contendo informações do aluno
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function updateAluno(formData: FormData) {
  const data = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    surname: formData.get('surname') as string,
    parentId: formData.get('parentId') as string,
    classId: formData.get('classId') as string,
    gradeId: formData.get('gradeId') as string,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Verificar permissão antes de executar a ação
  try {
    const currentUser = await getCurrentUserProfile();
    
    // Admins podem atualizar qualquer aluno
    if (await isAdmin()) {
      await requirePermission('UPDATE_ALUNO');
    }
    // Alunos podem atualizar apenas seus próprios dados
    else if (await isAluno()) {
      const student = await prisma.student.findUnique({
        where: { id: data.id },
        select: { profileId: true },
      });
      
      if (!student || student.profileId !== currentUser.id) {
        throw new Error('Você só pode atualizar seus próprios dados.');
      }
    }
    // Outros roles não podem atualizar alunos
    else {
      throw new Error('Acesso negado.');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  // Validação dos dados usando o schema do Zod
  const result = updateAlunoSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Buscar o aluno para obter o profileId
    const student = await prisma.student.findUnique({
      where: { id: result.data.id },
      select: { profileId: true },
    });

    if (!student) {
      return { success: false, message: 'Aluno não encontrado.' };
    }

    // Atualizar os dados do Student
    await prisma.student.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        surname: result.data.surname,
        parentId: result.data.parentId,
        classId: result.data.classId,
        gradeId: result.data.gradeId,
      },
    });

    // Atualizar o avatarUrl no Profile se fornecido
    if (avatarUrl) {
      await prisma.profile.update({
        where: { id: student.profileId },
        data: { avatarUrl: avatarUrl },
      });
    }

    revalidatePath('/dashboard/alunos'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return { success: false, message: 'Ocorreu um erro ao atualizar o aluno.' };
  }
}

/**
 * Função para excluir um aluno
 * Remove o aluno do banco de dados
 * @param id - ID do aluno a ser excluído
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function deleteAluno(id: string) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('DELETE_ALUNO');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  try {
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath('/dashboard/alunos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return { success: false, message: 'Ocorreu um erro ao excluir o aluno.' };
  }
}

/**
 * Função para buscar alunos com paginação e filtros
 * @param searchParams - Parâmetros de busca (página, termo de busca, limite)
 * @returns Lista de alunos com informações de paginação
 */
export async function buscarAlunos(searchParams: {
  page?: string;
  search?: string;
  limit?: string;
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const search = searchParams.search || '';
  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { surname: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [alunos, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: {
            select: {
              name: true,
              surname: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          grade: {
            select: {
              level: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      alunos,
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    throw new Error('Erro ao buscar alunos');
  }
}

/**
 * Função para buscar responsáveis para popular o select
 * @returns Lista de responsáveis
 */
export async function buscarResponsaveis() {
  try {
    const responsaveis = await prisma.parent.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return responsaveis;
  } catch (error) {
    console.error('Erro ao buscar responsáveis:', error);
    throw new Error('Erro ao buscar responsáveis');
  }
}

/**
 * Função para buscar turmas para popular o select
 * @returns Lista de turmas
 */
export async function buscarTurmas() {
  try {
    const turmas = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        grade: {
          select: {
            level: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return turmas;
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    throw new Error('Erro ao buscar turmas');
  }
}

/**
 * Função para buscar anos escolares para popular o select
 * @returns Lista de anos escolares
 */
export async function buscarAnosEscolares() {
  try {
    const anosEscolares = await prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return anosEscolares;
  } catch (error) {
    console.error('Erro ao buscar anos escolares:', error);
    throw new Error('Erro ao buscar anos escolares');
  }
}