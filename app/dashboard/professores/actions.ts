// app/dashboard/professores/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createProfessorSchema, updateProfessorSchema } from '@/lib/schemas';
import { requirePermission } from '@/lib/authorization';

const prisma = new PrismaClient();

/**
 * Função para criar um novo professor
 * Valida os dados recebidos e os insere no banco de dados
 * @param formData - Dados do formulário contendo informações do professor
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function createProfessor(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('CREATE_PROFESSOR');
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
    phone: formData.get('phone') as string || undefined,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Validação dos dados usando o schema do Zod
  const result = createProfessorSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Lógica para criar o usuário no Supabase Auth primeiro (essencial!)
    // ...
    
    // Criar o Profile primeiro
    const profile = await prisma.profile.create({
      data: {
        role: 'PROFESSOR',
        avatarUrl: avatarUrl,
        // username será definido posteriormente ou pode ser baseado no email
      },
    });

    // Após criar o Profile, criar o Teacher
    await prisma.teacher.create({
      data: {
        profileId: profile.id,
        name: result.data.name,
        surname: result.data.surname,
        email: result.data.email,
        phone: result.data.phone,
      },
    });

    revalidatePath('/dashboard/professores'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    return { success: false, message: 'Ocorreu um erro ao criar o professor.' };
  }
}

/**
 * Função para atualizar um professor existente
 * Valida os dados recebidos e atualiza no banco de dados
 * @param formData - Dados do formulário contendo informações do professor
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function updateProfessor(formData: FormData) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('UPDATE_PROFESSOR');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  const data = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    surname: formData.get('surname') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
  };

  const avatarUrl = formData.get('avatarUrl') as string || undefined;

  // Validação dos dados usando o schema do Zod
  const result = updateProfessorSchema.safeParse(data);
  if (!result.success) {
    // Retornar os erros de validação
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Buscar o professor para obter o profileId
    const teacher = await prisma.teacher.findUnique({
      where: { id: result.data.id },
      select: { profileId: true },
    });

    if (!teacher) {
      return { success: false, message: 'Professor não encontrado.' };
    }

    // Atualizar os dados do Teacher
    await prisma.teacher.update({
      where: { id: result.data.id },
      data: {
        name: result.data.name,
        surname: result.data.surname,
        email: result.data.email,
        phone: result.data.phone,
      },
    });

    // Atualizar o avatarUrl no Profile se fornecido
    if (avatarUrl) {
      await prisma.profile.update({
        where: { id: teacher.profileId },
        data: { avatarUrl: avatarUrl },
      });
    }

    revalidatePath('/dashboard/professores'); // Atualiza a lista na UI
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    return { success: false, message: 'Ocorreu um erro ao atualizar o professor.' };
  }
}

/**
 * Função para excluir um professor
 * @param id - ID do professor a ser excluído
 */
export async function deleteProfessor(id: string) {
  // Verificar permissão antes de executar a ação
  try {
    await requirePermission('DELETE_PROFESSOR');
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Acesso negado.',
    };
  }

  try {
    // Lógica para excluir o usuário do Supabase Auth e Profile primeiro!
    await prisma.teacher.delete({ where: { id } });
    revalidatePath('/dashboard/professores');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir professor:', error);
    return { success: false, message: 'Erro ao excluir.' };
  }
}