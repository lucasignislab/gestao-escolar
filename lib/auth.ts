// lib/auth.ts
import { Client, Account } from 'node-appwrite';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Nome do cookie de sessão
const SESSION_COOKIE = 'appwrite-session';

/**
 * Cria um cliente Appwrite para operações administrativas (usando API key)
 */
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    get account() {
      return new Account(client);
    },
  };
}

/**
 * Cria um cliente Appwrite para operações de usuário autenticado (usando sessão)
 */
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  
  console.log('🔍 [createSessionClient] Todos os cookies:', cookieStore.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));
  console.log('🔍 [createSessionClient] Cookie de sessão:', session ? `${session.value.substring(0, 20)}...` : 'não encontrado');

  if (!session || !session.value) {
    console.log('❌ [createSessionClient] Nenhuma sessão encontrada');
    throw new Error('No session');
  }

  // Decodificar o cookie se estiver URL-encoded
  let sessionValue = session.value;
  try {
    // Tentar decodificar se estiver URL-encoded
    const decoded = decodeURIComponent(sessionValue);
    if (decoded !== sessionValue) {
      console.log('🔍 [createSessionClient] Cookie decodificado de URL encoding');
      sessionValue = decoded;
    }
  } catch (e) {
    console.log('🔍 [createSessionClient] Cookie não está URL-encoded');
  }

  console.log('✅ [createSessionClient] Definindo sessão:', sessionValue.substring(0, 10) + '...');
  client.setSession(sessionValue);

  return {
    get account() {
      return new Account(client);
    },
  };
}

/**
 * Busca o perfil do usuário autenticado
 * Combina autenticação do Appwrite com dados do perfil no Prisma
 * Cria automaticamente um perfil se o usuário estiver autenticado mas não tiver perfil
 * @returns Profile do usuário ou null se não autenticado
 */
export const getUserProfile = async () => {
  try {
    console.log('🔍 [getUserProfile] Iniciando busca do perfil do usuário');
    const { account } = await createSessionClient();
    console.log('🔍 [getUserProfile] Cliente Appwrite criado, tentando obter usuário');
    
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