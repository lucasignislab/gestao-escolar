// app/dashboard/administradores/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createAdministradorSchema, updateAdministradorSchema } from '@/lib/schemas';
import { requirePermission, getCurrentUserProfile, isAdmin } from '@/lib/authorization';

const prisma = new PrismaClient();

/**
 * Função para criar um novo administrador
 * Valida os dados recebidos e os insere no banco de dados
 * @param formData - Dados do formulário contendo informações do administrador
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function createAdministrador(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    // Apenas admins podem criar novos administradores
    if (!(await isAdmin())) {
      throw new Error('Apenas administradores podem criar novos administradores.');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    username: formData.get('username') as string,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Validação dos dados usando o schema do Zod
  const result = createAdministradorSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verificar se já existe um administrador com o mesmo username
    const existingAdmin = await prisma.profile.findUnique({
      where: { username: result.data.username },
    });

    if (existingAdmin) {
      return { success: false, message: 'Já existe um administrador com este nome de usuário.' };
    }

    // Criar o Profile com role ADMIN
    await prisma.profile.create({
      data: {
        username: result.data.username,
        role: 'ADMIN',
        avatarUrl: avatarUrl,
      },
    });

    revalidatePath('/dashboard/administradores'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    return { success: false, message: 'Ocorreu um erro ao criar o administrador.' };
  }
}

/**
 * Função para atualizar um administrador existente
 * Valida os dados recebidos e atualiza no banco de dados
 * @param formData - Dados do formulário contendo informações do administrador
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function updateAdministrador(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    const currentUser = await getCurrentUserProfile();
    
    // Apenas admins podem atualizar dados de administradores
    if (await isAdmin()) {
      // Admin pode atualizar seus próprios dados ou de outros admins
      // (em um sistema real, pode ser necessário verificar hierarquia)
    } else {
      throw new Error('Apenas administradores podem atualizar dados de administradores.');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    id: formData.get('id') as string,
    username: formData.get('username') as string,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Validação dos dados usando o schema do Zod
  const result = updateAdministradorSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verificar se já existe outro administrador com o mesmo username
    const existingAdmin = await prisma.profile.findFirst({
      where: {
        username: result.data.username,
        NOT: { id: result.data.id },
      },
    });

    if (existingAdmin) {
      return { success: false, message: 'Já existe um administrador com este nome de usuário.' };
    }

    // Verificar se o perfil existe e é um administrador
    const profile = await prisma.profile.findUnique({
      where: { id: result.data.id },
    });

    if (!profile) {
      return { success: false, message: 'Administrador não encontrado.' };
    }

    if (profile.role !== 'ADMIN') {
      return { success: false, message: 'O perfil especificado não é um administrador.' };
    }

    // Atualizar os dados do Profile
    await prisma.profile.update({
      where: { id: result.data.id },
      data: {
        username: result.data.username,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : profile.avatarUrl,
      },
    });

    revalidatePath('/dashboard/administradores'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar administrador:', error);
    return { success: false, message: 'Ocorreu um erro ao atualizar o administrador.' };
  }
}

/**
 * Função para deletar um administrador
 * @param id - ID do administrador a ser deletado
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function deleteAdministrador(id: string) {
  // Verificar permissão antes de executar a ação
  try {
    // Apenas admins podem deletar administradores
    if (!(await isAdmin())) {
      throw new Error('Apenas administradores podem deletar administradores.');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  try {
    // Verificar se o perfil existe e é um administrador
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return { success: false, message: 'Administrador não encontrado.' };
    }

    if (profile.role !== 'ADMIN') {
      return { success: false, message: 'O perfil especificado não é um administrador.' };
    }

    // Verificar se não é o último administrador do sistema
    const adminCount = await prisma.profile.count({
      where: { role: 'ADMIN' },
    });

    if (adminCount <= 1) {
      return { success: false, message: 'Não é possível excluir o último administrador do sistema.' };
    }

    // Deletar o administrador
    await prisma.profile.delete({
      where: { id },
    });

    revalidatePath('/dashboard/administradores'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar administrador:', error);
    return { success: false, message: 'Ocorreu um erro ao deletar o administrador.' };
  }
}

/**
 * Função para buscar administradores com paginação e filtros
 * @param searchParams - Parâmetros de busca (página, busca, limite)
 * @returns Lista de administradores com informações de paginação
 */
export async function buscarAdministradores(searchParams: {
  page?: string;
  search?: string;
  limit?: string;
}) {
  // Verificar permissão antes de executar a ação
  try {
    // Apenas admins podem visualizar lista de administradores
    if (!(await isAdmin())) {
      throw new Error('Apenas administradores podem visualizar esta informação.');
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Acesso negado.');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const search = searchParams.search || '';
  const skip = (page - 1) * limit;

  try {
    const where = {
      role: 'ADMIN' as const,
      ...(search && {
        username: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [administradores, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          role: true,
        },
        orderBy: {
          username: 'asc',
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return {
      administradores,
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Erro ao buscar administradores:', error);
    throw new Error('Erro ao buscar administradores');
  }
}