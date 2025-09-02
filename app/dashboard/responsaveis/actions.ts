// app/dashboard/responsaveis/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createResponsavelSchema, updateResponsavelSchema } from '@/lib/schemas';
import { requirePermission, getCurrentUserProfile, isAdmin, isResponsavel } from '@/lib/authorization';

const prisma = new PrismaClient();

/**
 * Função para criar um novo responsável
 * Valida os dados recebidos e os insere no banco de dados
 * @param formData - Dados do formulário contendo informações do responsável
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function createResponsavel(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('CREATE_RESPONSAVEL');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    name: formData.get('name') as string,
    surname: formData.get('surname') as string,
    email: formData.get('email') as string,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Validação dos dados usando o schema do Zod
  const result = createResponsavelSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verificar se já existe um responsável com o mesmo email
    const existingParent = await prisma.parent.findUnique({
      where: { email: result.data.email },
    });

    if (existingParent) {
      return { success: false, message: 'Já existe um responsável com este email.' };
    }

    // Criar o Profile primeiro
    const profile = await prisma.profile.create({
      data: {
        role: 'RESPONSAVEL',
        avatarUrl: avatarUrl,
        // username será definido posteriormente ou pode ser baseado no nome
      },
    });

    // Após criar o Profile, criar o Parent
    await prisma.parent.create({
      data: {
        profileId: profile.id,
        name: result.data.name,
        surname: result.data.surname,
        email: result.data.email,
      },
    });

    revalidatePath('/dashboard/responsaveis'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar responsável:', error);
    return { success: false, message: 'Ocorreu um erro ao criar o responsável.' };
  }
}

/**
 * Função para atualizar um responsável existente
 * Valida os dados recebidos e atualiza no banco de dados
 * @param formData - Dados do formulário contendo informações do responsável
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function updateResponsavel(formData: FormData) {
  const data = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    surname: formData.get('surname') as string,
    email: formData.get('email') as string,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Verificar permissão antes de executar a ação
  try {
    const currentUser = await getCurrentUserProfile();
    
    // Admins podem atualizar qualquer responsável
    if (await isAdmin()) {
      await requirePermission('UPDATE_RESPONSAVEL');
    }
    // Responsáveis podem atualizar apenas seus próprios dados
    else if (await isResponsavel()) {
      const parent = await prisma.parent.findUnique({
        where: { id: data.id },
        select: { profileId: true },
      });
      
      if (!parent || parent.profileId !== currentUser.id) {
        throw new Error('Você só pode atualizar seus próprios dados.');
      }
    }
    // Outros roles não podem atualizar responsáveis
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
  const result = updateResponsavelSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Verificar se já existe outro responsável com o mesmo email
    const existingParent = await prisma.parent.findFirst({
      where: {
        email: result.data.email,
        NOT: { id: result.data.id },
      },
    });

    if (existingParent) {
      return { success: false, message: 'Já existe um responsável com este email.' };
    }

    // Buscar o responsável para obter o profileId
    const parent = await prisma.parent.findUnique({
      where: { id: result.data.id },
      select: { profileId: true },
    });

    if (!parent) {
      return { success: false, message: 'Responsável não encontrado.' };
    }

    // Atualizar os dados do Parent
    await prisma.parent.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        surname: result.data.surname,
        email: result.data.email,
      },
    });

    // Atualizar o Profile com a URL do avatar se fornecida
    if (avatarUrl !== undefined) {
      await prisma.profile.update({
        where: { id: parent.profileId },
        data: {
          avatarUrl: avatarUrl,
        },
      });
    }

    revalidatePath('/dashboard/responsaveis'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar responsável:', error);
    return { success: false, message: 'Ocorreu um erro ao atualizar o responsável.' };
  }
}

/**
 * Função para deletar um responsável
 * @param id - ID do responsável a ser deletado
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function deleteResponsavel(id: string) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('DELETE_RESPONSAVEL');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  try {
    // Verificar se o responsável tem filhos associados
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!parent) {
      return { success: false, message: 'Responsável não encontrado.' };
    }

    if (parent.children.length > 0) {
      return { success: false, message: 'Não é possível excluir um responsável que possui filhos cadastrados.' };
    }

    // Deletar o responsável (o Profile será deletado em cascata)
    await prisma.parent.delete({
      where: { id },
    });

    revalidatePath('/dashboard/responsaveis'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar responsável:', error);
    return { success: false, message: 'Ocorreu um erro ao deletar o responsável.' };
  }
}

/**
 * Função para buscar responsáveis com paginação e filtros
 * @param searchParams - Parâmetros de busca (página, busca, limite)
 * @returns Lista de responsáveis com informações de paginação
 */
export async function buscarResponsaveis(searchParams: {
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
            {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              surname: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [responsaveis, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: {
            select: {
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              children: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.parent.count({ where }),
    ]);

    return {
      responsaveis,
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Erro ao buscar responsáveis:', error);
    throw new Error('Erro ao buscar responsáveis');
  }
}