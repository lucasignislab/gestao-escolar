// lib/auth.ts
import { Client, Account } from 'appwrite';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * Cria um cliente Appwrite para uso no servidor
 */
const createServerAppwriteClient = async () => {
  const client = new Client();
  
  // Verificar se as variáveis de ambiente estão definidas antes de configurar o cliente
  if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  }

  // Obter o cookie de sessão do servidor
  const cookieStore = await cookies();
  
  // Tentar obter o cookie de várias maneiras
  let sessionCookie = cookieStore.get('appwrite-session');
  
  // Verificar se o cookie existe
  if (sessionCookie?.value) {
    console.log('✅ [createServerAppwriteClient] Cookie de sessão encontrado no servidor');
    console.log('✅ [createServerAppwriteClient] Valor do cookie (primeiros 10 caracteres):', sessionCookie.value.substring(0, 10) + '...');
    
    try {
      // Tentar decodificar o valor do cookie
      const decodedValue = decodeURIComponent(sessionCookie.value);
      console.log('✅ [createServerAppwriteClient] Cookie de sessão decodificado com sucesso');
      client.setSession(decodedValue);
    } catch (e) {
      console.error('❌ [createServerAppwriteClient] Erro ao decodificar o cookie de sessão:', e);
      // Tentar usar o valor bruto se a decodificação falhar
      console.log('✅ [createServerAppwriteClient] Usando valor bruto do cookie');
      client.setSession(sessionCookie.value);
    }
  } else {
    console.log('❌ [createServerAppwriteClient] Cookie de sessão não encontrado no servidor');
    // Listar todos os cookies disponíveis para depuração
    const allCookies = cookieStore.getAll();
    console.log('✅ [createServerAppwriteClient] Todos os cookies disponíveis:', allCookies.map(c => c.name).join(', '));
  }

  return new Account(client);
};

/**
 * Busca o perfil do usuário autenticado
 * Combina autenticação do Appwrite com dados do perfil no Prisma
 * Cria automaticamente um perfil se o usuário estiver autenticado mas não tiver perfil
 * @returns Profile do usuário ou null se não autenticado
 */
export const getUserProfile = async () => {
  try {
    const account = await createServerAppwriteClient();
    
    const user = await account.get();
    
    if (!user) {
      console.log('❌ [getUserProfile] Nenhum usuário autenticado encontrado');
      return null;
    }
    
    console.log('✅ [getUserProfile] Usuário autenticado:', user.email);

    let profile = await prisma.profile.findUnique({
      where: { id: user.$id },
    });

    // Se o usuário está autenticado mas não tem perfil, criar um perfil padrão
    if (!profile && user) {
      profile = await prisma.profile.create({
        data: {
          id: user.$id,
          username: user.email?.split('@')[0] || `user_${user.$id.slice(0, 8)}`,
          role: 'ADMIN', // Perfil padrão como ADMIN para facilitar o acesso inicial
        },
      });
    }

    return profile;
  } catch (error) {
    console.error('❌ [getUserProfile] Erro ao obter perfil do usuário:', error);
    console.error('❌ [getUserProfile] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return null;
  }
};