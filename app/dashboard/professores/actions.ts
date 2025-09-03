// app/dashboard/professores/actions.ts
'use server';

import { PrismaClient, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createProfessorSchema, updateProfessorSchema, professorSchema } from '@/lib/schemas';
import { getCurrentUserProfile } from '@/lib/authorization';
import { Client, Users, ID, Query } from 'node-appwrite';
import { APPWRITE_CONFIG } from '@/lib/appwrite';
import * as z from 'zod';
import { Storage } from 'node-appwrite';

// Cliente Appwrite simplificado para demonstração
const client = new Client();

// Verificar se as variáveis de ambiente estão definidas antes de configurar o cliente
if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && 
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && 
    process.env.APPWRITE_API_KEY) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
}

const users = new Users(client);

/**
 * Função temporária para criar um professor no Appwrite Auth
 * @param data - Dados básicos do professor
 * @returns Objeto com status de sucesso e ID do usuário criado
 */
export async function createProfessorSimples(data: { name: string, surname: string, email: string }) {
  try {
    // Passo 1: Criar o usuário no Appwrite Auth
    const newUser = await users.create(
      ID.unique(),      // Gera um ID único para o usuário
      data.email,
      undefined,        // Telefone (opcional)
      'senhaTemporaria123', // Senha inicial
      `${data.name} ${data.surname}`
    );

    console.log('Usuário criado no Appwrite:', newUser.$id);

    // O próximo passo será salvar no nosso banco de dados Neon/Prisma
    return { success: true, userId: newUser.$id };
  } catch (error: any) {
    console.error("Erro ao criar usuário no Appwrite:", error);
    return { success: false, message: error.message };
  }
}

const prisma = new PrismaClient();

/**
 * Função para excluir um professor do banco de dados e do Appwrite Auth
 * @param teacherId - ID do professor a ser excluído
 * @param profileId - ID do perfil associado ao professor
 * @returns Objeto com status de sucesso ou erro
 */
export async function deleteProfessorAction(teacherId: string, profileId: string) {
  try {
    // Passo 1: Excluir do nosso banco de dados Neon/Prisma
    await prisma.teacher.delete({ where: { id: teacherId } });
    await prisma.profile.delete({ where: { id: profileId } });

    // Passo 2: Excluir do Appwrite Auth
    await users.delete(profileId);

    revalidatePath('/dashboard/professores');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir professor:', error);
    if (error instanceof Error) {
      return { success: false, message: `Erro: ${error.message}` };
    }
    return { success: false, message: 'Ocorreu um erro ao excluir o professor.' };
  }
}

/**
 * Função para atualizar um professor no banco de dados
 * @param data - Dados do professor a ser atualizado
 * @returns Objeto com status de sucesso ou erro
 */
export async function updateProfessorAction(data: unknown) {
  const result = professorSchema.safeParse(data);
  if (!result.success) {
    return { 
      success: false, 
      message: "Dados inválidos", 
      errors: result.error.flatten().fieldErrors 
    };
  }

  const { id, ...dataToUpdate } = result.data;
  if (!id) return { success: false, message: "ID do professor é obrigatório para atualização." };

  try {
    // Primeiro, buscar o professor para obter o profileId
    const professor = await prisma.teacher.findUnique({
      where: { id },
      select: { profileId: true }
    });

    if (!professor) {
      return { success: false, message: "Professor não encontrado." };
    }

    // Extrair avatarUrl se estiver presente nos dados (foi adicionado via casting para any no frontend)
    const { avatarUrl, ...teacherDataToUpdate } = dataToUpdate as any;

    // Iniciar uma transação para garantir que ambas as atualizações ocorram ou nenhuma
    await prisma.$transaction(async (tx) => {
      // Atualizar o professor
      await tx.teacher.update({
        where: { id },
        data: teacherDataToUpdate,
      });

      // Se avatarUrl foi fornecido, atualizar o perfil
      if (avatarUrl) {
        await tx.profile.update({
          where: { id: professor.profileId },
          data: { avatarUrl }
        });
      }
    });

    revalidatePath('/dashboard/professores');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    if (error instanceof Error) {
      return { success: false, message: `Erro: ${error.message}` };
    }
    return { success: false, message: 'Ocorreu um erro ao atualizar o professor.' };
  }
}

// Configuração do cliente Appwrite para servidor
const getServerAppwriteClient = () => {
  const client = new Client();
  
  // Verificar se as variáveis de ambiente estão definidas antes de configurar o cliente
  if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && 
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID && 
      process.env.APPWRITE_API_KEY) {
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
  }
  
  return {
    client,
    users: new Users(client)
  };
};

/**
 * Função para criar um professor a partir de dados validados
 * @param data - Dados do professor a serem validados
 * @returns Objeto com status de sucesso ou erro
 */
export async function createProfessorAction(data: unknown) {
  // Passo 1: Validar os dados com Zod
  const result = professorSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  const { name, surname, email } = result.data;

  try {
    // Verificar se já existe um usuário com este e-mail no Appwrite
    const { users: appwriteUsers } = getServerAppwriteClient();
    const existingUsers = await appwriteUsers.list([Query.equal('email', email)]);

    if (existingUsers.total > 0) {
      return { 
        success: false, 
        message: 'Um usuário com este e-mail já existe.' 
      };
    }
    
    // Passo 2: Criar o usuário no Appwrite Auth
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      'senhaTemporaria123',
      `${name} ${surname}`
    );
    const appwriteUserId = newUser.$id;

    try {
      // Passo 3: Criar o Perfil e o Professor no nosso banco de dados Neon/Prisma
      await prisma.profile.create({
        data: {
          id: appwriteUserId, // Usamos o mesmo ID do Appwrite
          role: 'PROFESSOR',
        },
      });

      await prisma.teacher.create({
        data: {
          name,
          surname,
          email,
          profileId: appwriteUserId, // Conectamos ao perfil criado
        },
      });

      revalidatePath('/dashboard/professores');
      return { success: true };
    } catch (prismaError) {
      // Se falhar a criação no Prisma, deletar o usuário do Appwrite
      try {
        await appwriteUsers.delete(appwriteUserId);
        console.log(`Usuário ${appwriteUserId} deletado do Appwrite após falha no Prisma`);
      } catch (deleteError) {
        console.error('Erro ao deletar usuário do Appwrite após falha:', deleteError);
      }
      throw prismaError; // Re-lançar o erro original para ser tratado abaixo
    }
  } catch (error: unknown) {
    console.error('Erro ao criar professor:', error);
    if (error instanceof Error) {
      return { success: false, message: `Erro: ${error.message}` };
    }
    return { success: false, message: 'Ocorreu um erro ao criar o professor.' };
  }
}

/**
 * Função para criar um novo professor
 * Valida os dados recebidos e os insere no banco de dados
 * @param formData - Dados do formulário contendo informações do professor
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function createProfessor(formData: FormData) {
  try {
    // Extrair dados do FormData
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const avatarUrl = formData.get('avatarUrl') as string || undefined;

    // Verificar permissões
    const currentUser = await getCurrentUserProfile();
    if (currentUser.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem criar professores');
    }

    // Validar dados com o schema
    const validatedData = createProfessorSchema.parse({
      name,
      surname,
      email,
      phone,
    });

    // Verificar se já existe um usuário com este e-mail no Appwrite
    const { client, users } = getServerAppwriteClient();
    const existingUsers = await users.list([Query.equal('email', validatedData.email)]);

    if (existingUsers.total > 0) {
      return { 
        success: false, 
        message: 'Um usuário com este e-mail já existe.' 
      };
    }

    // Gerar senha aleatória para o novo usuário
    const password = formData.get('password') as string || generateRandomPassword();

    // Criar usuário no Appwrite
    const userId = ID.unique();
    const user = await users.create(
      userId,
      validatedData.email,
      password,
      `${validatedData.name} ${validatedData.surname}`
    );

    // Criar o Profile usando o ID do usuário Appwrite
    const profile = await prisma.profile.create({
      data: {
        id: user.$id, // Usar o ID gerado pelo Appwrite
        role: 'PROFESSOR',
        avatarUrl: avatarUrl,
        username: validatedData.email.split('@')[0], // Usar parte do email como username
      },
    });

    // Após criar o Profile, criar o Teacher
    await prisma.teacher.create({
      data: {
        profileId: profile.id,
        name: validatedData.name,
        surname: validatedData.surname,
        email: validatedData.email,
        phone: validatedData.phone,
      },
    });

    // Enviar e-mail de boas-vindas (não bloqueia o fluxo principal)
    enviarEmailBoasVindasProfessor(
      { name: validatedData.name, email: validatedData.email },
      password
    ).catch(error => {
      console.error('Falha ao enviar e-mail de boas-vindas:', error);
    });

    revalidatePath('/dashboard/professores'); // Atualiza a lista na UI
    return { success: true, password: process.env.NODE_ENV === 'development' ? password : undefined };
  } catch (error: unknown) {
    console.error('Erro ao criar professor:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'Ocorreu um erro ao criar o professor.'
    };
  }
}

/**
 * Gera uma senha aleatória para novos usuários
 * @returns Uma senha aleatória de 12 caracteres
 */
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Função para atualizar um professor existente
 * Valida os dados recebidos e atualiza no banco de dados
 * @param formData - Dados do formulário contendo informações do professor
 * @returns Objeto com status de sucesso e possíveis erros
 */
export async function updateProfessor(formData: FormData) {
  try {
    // Verificar permissões
    const currentUser = await getCurrentUserProfile();
    if (currentUser.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem atualizar professores');
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

    // Buscar o professor para obter o profileId
    const teacher = await prisma.teacher.findUnique({
      where: { id: result.data.id },
      select: { profileId: true, email: true },
    });

    if (!teacher) {
      return { success: false, message: 'Professor não encontrado.' };
    }

    // Obter o perfil do professor
    const profile = await prisma.profile.findUnique({
      where: { id: teacher.profileId },
    });

    if (!profile) {
      return { success: false, message: 'Perfil do professor não encontrado.' };
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

    // Atualizar o usuário no Appwrite Auth se o email foi alterado
    if (teacher.email !== result.data.email) {
      try {
        const { users } = getServerAppwriteClient();
        await users.updateEmail(profile.id, result.data.email);
      } catch (error) {
        console.error('Erro ao atualizar email no Appwrite:', error);
        // Continuar mesmo se falhar a atualização no Appwrite
      }
    }

    revalidatePath('/dashboard/professores'); // Atualiza a lista na UI
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar professor:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        details: error.flatten().fieldErrors,
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Erro desconhecido ao atualizar professor',
    };
  }
}

/**
 * Função para excluir um professor
 * @param id - ID do professor a ser excluído
 * @returns Mensagem de sucesso ou erro
 */
export async function deleteProfessor(id: string) {
  try {
    // Verificar permissões
    const currentUser = await getCurrentUserProfile();
    if (currentUser.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem excluir professores');
    }

    // Buscar o professor para obter o profileId
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { profileId: true },
    });

    if (!teacher) {
      return { success: false, message: 'Professor não encontrado.' };
    }

    // Excluir o professor do banco de dados
    await prisma.teacher.delete({ where: { id } });

    // Excluir o usuário do Appwrite Auth
    try {
      const { users } = getServerAppwriteClient();
      await users.delete(teacher.profileId);
    } catch (error) {
      console.error('Erro ao excluir usuário do Appwrite:', error);
      // Continuar mesmo se falhar a exclusão no Appwrite
    }

    // Excluir o perfil após excluir o professor e o usuário Appwrite
    await prisma.profile.delete({ where: { id: teacher.profileId } });

    revalidatePath('/dashboard/professores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao excluir professor:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Erro desconhecido ao excluir professor',
    };
  }
}

/**
 * Função para buscar professores com paginação e filtros
 * @param searchParams - Parâmetros de busca (página, busca, limite)
 * @returns Lista de professores com informações de paginação
 */
export async function buscarProfessores(searchParams: {
  page?: string;
  search?: string;
  limit?: string;
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const search = searchParams.search || '';
  const skip = (page - 1) * limit;

  try {
    // Verificar se o usuário está autenticado
    await getCurrentUserProfile();
    
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        surname?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    // Filtro por busca (nome, sobrenome ou email)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { surname: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Buscar professores com paginação e filtros
    const [professores, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
        orderBy: [
          { name: 'asc' },
          { surname: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.teacher.count({ where }),
    ]);

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit);

    return {
      data: professores,
      pagination: {
        total,
        pageCount: totalPages,
        currentPage: page,
        perPage: limit,
        from: skip + 1,
        to: Math.min(skip + limit, total),
      },
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar professores:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'Erro ao buscar professores'
    };
  }
}

/**
 * Função para buscar um professor específico por ID
 * @param id - ID do professor a ser buscado
 * @returns Dados do professor ou null se não encontrado
 */
export async function buscarProfessorPorId(id: string) {
  try {
    // Verificar se o usuário está autenticado
    await getCurrentUserProfile();
    
    const professor = await prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        profile: {
          select: {
            avatarUrl: true,
            role: true,
            username: true,
          },
        },
      },
    });

    if (!professor) {
      return null;
    }

    return professor;
  } catch (error: unknown) {
    console.error('Erro ao buscar professor por ID:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'Erro ao buscar professor'
    };
  }
}

/**
 * Verifica se um e-mail já está em uso por outro professor
 * @param email - E-mail a ser verificado
 * @param excludeId - ID do professor a ser excluído da verificação (opcional, para edição)
 * @returns true se o e-mail já estiver em uso, false caso contrário
 */
export async function verificarEmailProfessorExistente(email: string, excludeId?: string) {
  try {
    // Verificar se o usuário está autenticado
    await getCurrentUserProfile();
    
    const where: { email: string; id?: { not: string } } = { email };
    
    // Se fornecido um ID para excluir, adiciona à condição de busca
    if (excludeId) {
      where.id = { not: excludeId };
    }
    
    // Busca professor com o e-mail fornecido
    const professor = await prisma.teacher.findFirst({
      where,
      select: { id: true },
    });
    
    // Retorna true se encontrou algum professor com esse e-mail
    return !!professor;
  } catch (error: unknown) {
    console.error('Erro ao verificar e-mail de professor:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'Erro ao verificar e-mail de professor'
    };
  }
}

/**
 * Função para resetar a senha de um professor no Appwrite
 * @param professorId - ID do professor
 * @returns Mensagem de sucesso ou erro
 */
export async function resetarSenhaProfessor(professorId: string) {
  try {
    // Verificar permissões (apenas administradores podem resetar senhas)
    const currentUser = await getCurrentUserProfile();
    // Verificar se o usuário é administrador
    if (currentUser.role !== Role.ADMIN) {
      throw new Error('Apenas administradores podem resetar senhas');
    }
    
    // Buscar o professor pelo ID
    const professor = await prisma.teacher.findUnique({
      where: { id: professorId },
      select: {
        email: true,
        profile: {
          select: {
            id: true,
          },
        },
      },
    });
    
    if (!professor || !professor.profile) {
      throw new Error('Professor não encontrado');
    }
    
    // Gerar uma nova senha aleatória
    const novaSenha = generateRandomPassword();
    
    // Obter o cliente Appwrite do servidor
    const { client, users } = getServerAppwriteClient();
    
    // Atualizar a senha do usuário no Appwrite
    await users.updatePassword(professor.profile.id, novaSenha);
    
    // Aqui você poderia implementar o envio de e-mail com a nova senha
    // Exemplo: await enviarEmailNovaSenha(professor.email, novaSenha);
    
    return {
      success: true,
      message: 'Senha resetada com sucesso',
      // Retornar a senha apenas em ambiente de desenvolvimento
      senha: process.env.NODE_ENV === 'development' ? novaSenha : undefined,
    };
  } catch (error: unknown) {
    console.error('Erro ao resetar senha do professor:', error);
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'Erro ao resetar senha do professor'
    };
  }
}

/**
 * Função para enviar e-mail de boas-vindas para um professor recém-criado
 * @param professorData - Dados do professor
 * @param senha - Senha gerada para o professor
 * @returns Mensagem de sucesso ou erro
 */
export async function enviarEmailBoasVindasProfessor(
  professorData: { name: string; email: string },
  senha: string
) {
  try {
    // Aqui você implementaria a lógica de envio de e-mail
    // Exemplo usando um serviço de e-mail como SendGrid, Mailgun, etc.
    
    // Exemplo de implementação (pseudocódigo):
    /*
    const emailService = new EmailService();
    await emailService.sendEmail({
      to: professorData.email,
      subject: 'Bem-vindo ao Sistema de Gestão Escolar',
      template: 'welcome-teacher',
      data: {
        name: professorData.name,
        email: professorData.email,
        password: senha,
        loginUrl: process.env.NEXT_PUBLIC_APP_URL + '/login',
      },
    });
    */
    
    console.log(`[DEV] E-mail de boas-vindas enviado para ${professorData.email}`);
    
    return {
      success: true,
      message: 'E-mail de boas-vindas enviado com sucesso',
    };
  } catch (error: unknown) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    // Não lançamos erro aqui para não interromper o fluxo principal
    // apenas registramos o erro e retornamos falha
    return {
      success: false,
      message: 'Erro ao enviar e-mail de boas-vindas',
    };
  }
}